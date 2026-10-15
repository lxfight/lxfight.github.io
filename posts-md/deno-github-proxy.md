---
title: 用 Deno 写一个抗造的 GitHub 代理服务：AstrBot2GitHub 架构复盘
date: "2024-07-28"
category: 后端工程
excerpt: 从最初几十行能跑通的转发脚本，到拿到两百多 Star 的公共服务，复盘 AstrBot2GitHub 在流式转发、ETag 缓存与防刷限流上的实战取舍。
tags:
  - Deno
  - TypeScript
  - 网络代理
badge: 热门
featured: true
---

做 `AstrBot2GitHub` 的起因很实在：在使用和开发 AstrBot 的过程中，插件拉取更新、读取仓库元数据、下载 Release 附件都重度依赖 GitHub。而在国内网络环境下，`api.github.com` 和 `raw.githubusercontent.com` 时通时断，经常让机器人在安装插件或自检更新时直接卡死。

如果在每个插件或客户端里各自写重试和镜像切换，不仅代码到处重复，一旦某个镜像失效还得挨个发版。最干脆的办法就是在中间立一层专门的反向代理服务，把路由映射、缓存、限流和跨域头统一收口。

这个小项目后来在社区里攒了 250+ Stars 和 600+ Forks。回头看，把一个“自己能用的几十行转发脚本”打磨成“能扛住公共流量的稳定服务”，中间踩过的坑比预想中多得多。

## 为什么选了 Deno 而不是 Node.js

立项时我想要的是一个**单文件就能跑、部署体积小、直接写 TypeScript** 的运行时。Deno 在这种纯网络 I/O 型小服务上非常顺手：

- **Web 标准 API 一等公民**：入站请求和出站 `fetch` 用的都是标准的 `Request`、`Response`、`Headers` 和 `ReadableStream`，不需要在 Node 的 `IncomingMessage` 和 Web Stream 之间来回做适配。
- **零配置 TypeScript**：省掉了 `tsconfig.json`、构建打包和源码映射那一摊杂事，改完代码直接跑。
- **权限显式收敛**：启动时只给 `--allow-net` 和 `--allow-env`，一个暴露在公网的代理进程就算出问题，也碰不到宿主机的文件系统。

## 核心架构里的三个关键设计

### 1. 路径映射与流式透传（绝不整包缓冲）

GitHub 的请求大致分两类：体积小但频率高的 API 请求（查版本、读目录），以及体积可能几十上百兆的 Raw / Release 二进制文件。

早期最容易犯的错误是在代理层 `await response.arrayBuffer()` 或 `await response.text()`，把上游响应全读进内存再返回给客户端。平时测几个 KB 的配置文件毫无察觉，一旦有人并发拉取较大的资源包，实例内存瞬间就会被撑爆。

正确的做法是直接把上游 `fetch` 拿到的 `response.body`（本身就是 `ReadableStream`）原样交给下游 `Response`，靠底层流控边收边发：

```ts
const UPSTREAMS: Record<string, string> = {
  "/api/": "https://api.github.com/",
  "/raw/": "https://raw.githubusercontent.com/",
  "/gh/": "https://github.com/"
};

function resolveTarget(url: URL): URL | null {
  for (const [prefix, base] of Object.entries(UPSTREAMS)) {
    if (url.pathname.startsWith(prefix)) {
      const rest = url.pathname.slice(prefix.length);
      return new URL(rest + url.search, base);
    }
  }
  return null;
}

async function proxyStream(req: Request, target: URL): Promise<Response> {
  const upstreamReq = new Request(target, {
    method: req.method,
    headers: sanitizeRequestHeaders(req.headers, target.host),
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    redirect: "follow"
  });

  const upstreamRes = await fetch(upstreamReq);

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: buildResponseHeaders(upstreamRes.headers)
  });
}
```

### 2. 利用 ETag 做条件请求缓存，省下宝贵的 API 额度

GitHub 对未认证的 API 请求有非常严格的限流（每小时 60 次），就算挂了 Token，面对大量插件客户端轮询仓库状态，额度也很快见底。

好在 GitHub API 对 `ETag` 和 `If-None-Match` 的支持极好——只要上游返回 `304 Not Modified`，这次请求就**不计入 GitHub 的 Rate Limit 配额**。

因此代理层的缓存不能只是傻瓜式的“存 5 分钟过期”，而是要把首次请求拿到的响应体和 `ETag` 一起存下来。当本地 TTL 过期后，代理带着旧 `ETag` 去问一下 GitHub：如果返回 `304`，直接续期本地缓存并返回给客户端；只有返回 `200` 时才更新缓存内容。

```ts
interface CachedItem {
  body: Uint8Array;
  status: number;
  headers: [string, string][];
  etag: string;
  expireAt: number;
}

async function fetchWithEtagCache(
  cache: Map<string, CachedItem>,
  key: string,
  target: URL,
  reqHeaders: Headers,
  ttlMs = 60_000
): Promise<Response> {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && now < hit.expireAt) {
    return new Response(hit.body, { status: hit.status, headers: hit.headers });
  }

  const headers = sanitizeRequestHeaders(reqHeaders, target.host);
  if (hit?.etag) {
    headers.set("If-None-Match", hit.etag);
  }

  const res = await fetch(target, { headers });

  if (res.status === 304 && hit) {
    hit.expireAt = now + ttlMs;
    return new Response(hit.body, { status: hit.status, headers: hit.headers });
  }

  const etag = res.headers.get("etag");
  if (res.ok && etag) {
    const buf = new Uint8Array(await res.arrayBuffer());
    const savedHeaders = Array.from(buildResponseHeaders(res.headers).entries());
    cache.set(key, {
      body: buf,
      status: res.status,
      headers: savedHeaders,
      etag,
      expireAt: now + ttlMs
    });
    return new Response(buf, { status: res.status, headers: savedHeaders });
  }

  return new Response(res.body, {
    status: res.status,
    headers: buildResponseHeaders(res.headers)
  });
}
```

加上这层条件请求后，高频轮询插件列表和版本检查对上游配额的消耗几乎降了一个数量级。

### 3. 请求头清洗与防刷限流

把反向代理放到公网之后，有两件事不做一定会出事：

第一是 **Header 清洗**。不能把客户端发来的 `Host`、`Cf-Connecting-Ip`、`X-Forwarded-*` 或者无关 Cookie 原封不动转发给 GitHub，否则轻则触发上游的 WAF 拦截，重则造成信息泄露。认证头也只允许合乎规范的 `Authorization` 或服务端预设的只读 Token 注入。

```ts
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host"
]);

function sanitizeRequestHeaders(incoming: Headers, targetHost: string): Headers {
  const clean = new Headers();
  for (const [k, v] of incoming.entries()) {
    const lower = k.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower.startsWith("x-forwarded-")) continue;
    clean.set(k, v);
  }
  clean.set("Host", targetHost);
  if (!clean.has("User-Agent")) {
    clean.set("User-Agent", "AstrBot2GitHub-Proxy/1.0");
  }
  return clean;
}
```

第二是**按 IP 与路径维度的令牌桶限流**。公共代理很容易被爬虫或写死死循环的故障脚本盯上，用轻量级的内存令牌桶把异常高频请求直接挡在 `429 Too Many Requests`，同时定期清理过期的 IP 桶防止内存泄漏，服务才能长期无人值守地跑下去。

## 容器化与部署

部署层面尽量保持克制，一个十几行的 `Dockerfile` 锁死 Deno 版本，构建阶段预缓存依赖，运行阶段只开网络和环境变量权限：

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY . .
RUN deno cache src/main.ts

EXPOSE 8000
CMD ["run", "--allow-net", "--allow-env", "src/main.ts"]
```

整个服务跑在轻量容器里，也可以直接塞进 Deno Deploy 这类边缘环境。

## 一点体会

写 `AstrBot2GitHub` 最大的感触是：这种基础设施型的小工具，**克制比炫技重要得多**。不需要复杂的框架，也不需要花哨的后台，只要把流式内存边界、上游配额保护（ETag 缓存）和异常请求隔离这三件事扎扎实实做好，几百行代码就能稳稳当当地帮几百个下游实例省去天天断连的烦恼。
