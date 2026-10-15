---
title: GitHub加速访问服务的Deno实现与架构思考
date: "2024-07-28"
category: 后端工程
excerpt: 基于 Deno 构建的 GitHub 加速服务获得 178 Stars 和 633 Forks，本文拆解它的技术架构和性能优化思路。
tags:
  - Deno
  - TypeScript
  - 网络代理
badge: 热门
featured: true
---

AstrBot2GitHub 是我开发的一个基于 Deno 的 GitHub 加速访问服务。这个项目的出发点很直接：在国内环境里，很多依赖 GitHub API 或 Raw 资源的工具，经常会因为网络问题导致体验不稳定。

这篇文章想拆开讲三件事：为什么选择 Deno、核心代理架构怎么设计、以及做成可长期维护的服务时遇到过哪些工程问题。

## 项目背景

在需要频繁访问 GitHub API、Release 资源或 Raw 文件的场景里，网络抖动会明显拖慢开发和使用体验。与其把每个调用方都做重试，不如在中间增加一层稳定代理，把缓存、限流和路由逻辑统一收口。

## 为什么选择 Deno

相对于 Node.js，Deno 在这个项目里有几个非常直接的优势：

- 原生支持 TypeScript，减少额外构建配置。
- 自带现代 Web API，`fetch`、`URL`、`Request`、`Response` 开箱即用。
- 权限模型更明确，默认更偏安全。
- 标准库可读性高，适合快速实现网络服务。

## 核心架构设计

### 1. 请求路由与目标地址映射

核心逻辑是把请求路径映射到不同的 GitHub 上游地址。

```ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  let targetUrl: string;

  if (path.startsWith("/api/")) {
    targetUrl = `${GITHUB_API_BASE}${path.replace("/api", "")}`;
  } else if (path.startsWith("/raw/")) {
    targetUrl = `${GITHUB_RAW_BASE}${path.replace("/raw", "")}`;
  } else {
    return new Response("Not Found", { status: 404 });
  }

  return proxyRequest(request, targetUrl);
}
```

### 2. 多层缓存

缓存不是“顺手加一下”的优化，而是这类服务能不能跑稳的核心。

```ts
interface CacheEntry {
  data: unknown;
  timestamp: number;
  etag?: string;
}

class SmartCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttl = 5 * 60 * 1000;

  get(key: string, etag?: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    if (etag && entry.etag !== etag) {
      return null;
    }

    return entry;
  }

  set(key: string, data: unknown, etag?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
  }
}
```

这里的目标不是追求极致复杂，而是优先减少上游压力和重复请求。

### 3. 限流和熔断

代理一旦变成公共入口，就必须考虑流量突增和异常请求。

```ts
class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,
    private readonly refillRate: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const replenished = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + replenished);
    this.lastRefill = now;
  }
}
```

## 性能优化实践

### 连接复用

对这类 I/O 密集型服务来说，连接复用的收益非常明显。减少重复握手开销以后，尾延迟会稳定很多。

```ts
const client = new HTTPClient({
  keepAlive: true,
  maxIdleConnections: 100,
  maxIdleConnectionsPerHost: 10,
  idleTimeout: 30000
});
```

### 流式转发

下载大文件时，流式处理比先把整个响应读入内存更稳。

```ts
async function streamProxy(request: Request, targetUrl: string): Promise<Response> {
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}
```

## 工程化补充

### 日志和监控

只看“服务能跑”是不够的，至少要知道请求量、状态码和耗时。

```ts
interface LogContext {
  requestId: string;
  method: string;
  path: string;
  responseTime?: number;
  statusCode?: number;
}

function logRequest(context: LogContext): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "INFO",
    message: "Request processed",
    ...context
  }));
}
```

### 部署方式

用容器化来固定运行环境，是这类小服务最省心的做法之一。

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY . .

RUN deno cache src/main.ts

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "src/main.ts"]
```

## 遇到过的几个问题

### CORS

代理层经常需要补齐跨域头，不然前端接入会遇到一堆额外限制。

```ts
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
```

### 认证透传

代理认证信息时，既要保证功能正确，也要避免把不该转发的头无脑带出去。

```ts
function processAuthHeaders(headers: Headers): Headers {
  const nextHeaders = new Headers();

  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === "authorization") {
      if (value.startsWith("token ") || value.startsWith("Bearer ")) {
        nextHeaders.set(key, value);
      }
    } else if (!key.toLowerCase().startsWith("x-forwarded-")) {
      nextHeaders.set(key, value);
    }
  }

  return nextHeaders;
}
```

## 总结

这个项目让我更加确定一件事：对很多中小型网络服务来说，关键不是技术栈本身有多新，而是路径是否清晰，边界是否稳定，运维成本是否可控。

Deno 在这类代理服务里很好用，尤其适合想要快速落地一个现代 TypeScript 网络服务的场景。如果你也在做类似项目，建议从最小可用代理开始，再逐步加缓存、限流和监控，不要一开始就把系统做得过度复杂。
