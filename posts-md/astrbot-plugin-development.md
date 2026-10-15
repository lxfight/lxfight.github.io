---
title: AstrBot 长期记忆插件 Mnemosyne 开发复盘：当 RAG 遇上群聊噪音
date: "2024-08-04"
category: AI 应用
excerpt: 给聊天机器人加长期记忆，难的从来不是调向量数据库接口，而是怎么在碎片化、充满复读和闲聊的日常对话里，筛出真正值得记下来的信息。
tags:
  - Python
  - RAG
  - 插件开发
badge: 精选
featured: true
---

做 `astrbot_plugin_mnemosyne`（记忆女神）之前，我对“给机器人加长期记忆”这件事想得挺简单：把聊天记录切一切、算个 Embedding 塞进向量库，每次对话前检索几条最相似的塞回 Prompt，不就完事了吗？

等第一版原型真挂到群聊和私聊里跑了两天，现实就给了我一记闷棍：

- 群里有人连发十条“哈哈哈哈哈”或者表情包，向量库里瞬间塞满了毫无意义的废话。
- 用户说了一句“今天也一样”，单看这句话连主语都没有，向量检索要么完全召回不到，要么在别的话题下被莫名其妙捞出来，把模型带偏。
- 随着记忆条数往上涨，检索回来的常常是半年前已经作废的旧设定，机器人还在拿过时的信息接话。

后来这个插件在 GitHub 上拿到了 230+ Stars，而整个迭代过程，其实就是一直在和上面这三个工程问题死磕。

## 为什么不能“按字面逐条入库”

文档型 RAG（比如读 PDF、查知识库）面对的是结构完整、信息密度高的段落；但**对话型记忆面对的是高度口语化、极其依赖上下文的碎片**。

把每一条原始消息直接丢去算向量，既浪费 API 额度，又会严重污染检索空间。在 Mnemosyne 里，我把入库链路改成了“**滑动窗口聚合 → 价值过滤与事实提炼 → 向量入库**”三步。

### 1. 先过滤噪音，再按对话轮次提炼事实

与其试图用简陋的关键词打分去猜单句话重不重要，不如先把明显的口水话（纯符号、超短附和、指令前缀）在本地直接筛掉；攒够一小段对话窗口后，让小模型（或轻量提取器）把散乱的多轮对话浓缩成一句**主谓宾完整的独立事实**。

比如把三四句关于饮食偏好的闲聊，提炼成一条干净的记录：`“用户 A 表示自己对海鲜过敏，平时偏好吃川菜。”` 这样存进向量库里的每一条记忆，单独拎出来都是自洽的。

```python
from dataclasses import dataclass
import re
import time

NOISE_PATTERN = re.compile(r"^[\s\W_哈哈嘿呵啊哦嗯666？?！!。.]+$")

@dataclass
class MemoryRecord:
    session_id: str
    summary: str
    embedding: list[float]
    created_at: float
    access_count: int = 0

def is_worth_processing(messages: list[str]) -> bool:
    """快速拦截纯水群消息与指令，避免无意义的模型与 Embedding 调用"""
    valid_lines = [
        m.strip() for m in messages
        if len(m.strip()) >= 4
        and not m.strip().startswith("/")
        and not NOISE_PATTERN.match(m.strip())
    ]
    return len("".join(valid_lines)) >= 20
```

只加了这一层前置拦截和对话窗口归并，Embedding 接口的调用量就砍掉了七成以上，而且召回出来的句子再也不会没头没尾。

### 2. 检索不能只看余弦相似度：引入时间衰减

纯靠向量余弦相似度（Cosine Similarity）排高低，会导致一个很反直觉的现象：三个月前某次聊得很投机的旧话题，因为字面匹配度高了 0.02，永远压在昨天刚交代的新情况前面。

人的记忆是有时间温度的。我在召回打分里把**语义相似度**和**时间衰减（Time Decay）**做了加权融合，同时把高于一定阈值的近似记忆合并去重：

```python
import math

def score_memory(
    cosine_sim: float,
    created_at: float,
    now: float,
    half_life_days: float = 14.0,
    alpha: float = 0.78
) -> float:
    """结合语义相似度与指数时间衰减计算最终召回得分"""
    age_days = max(0.0, (now - created_at) / 86400.0)
    decay = math.exp(-math.log(2) * (age_days / half_life_days))
    return alpha * cosine_sim + (1.0 - alpha) * decay
```

这样一来，除非远期记忆在语义上极其契合（比如明确问起几个月前的某件事），否则近期发生的上下文会自然获得更高的优先级，机器人的回应听起来就更像一个跟得上近况的朋友。

## 别让异步 I/O 拖慢聊天响应

插件跑在 AstrBot 的消息事件循环里，最忌讳在主回复链路上做耗时的同步操作。

如果用户发一句话，插件要先同步调一次总结接口、再调一次 Embedding 接口、再去写磁盘数据库，最后才把控制权交还给主对话模型，用户体感上会觉得机器人每次回话都要卡好几秒。

Mnemosyne 在工程上的处理原则是**“读在当次，写在后台”**：

- **读取阶段（低延迟）**：收到用户消息后，只对当前 Query 做一次向量化（带 LRU 内存缓存），从本地向量库快速算出 Top-K 记忆注入 System Prompt。
- **写入阶段（全异步批量）**：对话结束后的记忆归并、去重和持久化，全部丢进后台异步队列（`asyncio.Queue`），攒够一批或者趁空闲窗口再批量调用 Embedding 接口：

```python
async def flush_embedding_batch(
    client,
    model: str,
    pending_texts: list[str],
    batch_size: int = 16
) -> list[list[float]]:
    """后台批量请求 Embedding，降低网络往返开销与限流风险"""
    vectors: list[list[float]] = []
    for i in range(0, len(pending_texts), batch_size):
        batch = pending_texts[i : i + batch_size]
        resp = await client.embeddings.create(model=model, input=batch)
        vectors.extend(item.embedding for item in resp.data)
    return vectors
```

## 开源之后收到最多反馈的地方

插件发出来被大家用起来之后，社区 Issue 和 PR 教会了我另一件事：**开发者觉得酷的机制，不一定比“可控性”更重要。**

大家提得最多的需求其实非常务实：

1. **会话隔离要彻底**：群聊 A 的梗绝不能串到群聊 B 或私聊里去，还要允许按群开关记忆。
2. **机器人记错了能手动改**：一旦某次幻觉被写进了长期记忆，机器人就会一直复读这个错误认知。为此后来补上了记忆查看、单条删除、清空和导出的管理命令。
3. **支持自定义小模型与本地 Embedding**：不能强绑某一家昂贵的商业接口，得允许用户把总结模型和向量模型换成便宜的开源模型或本地服务。

## 写在最后

折腾完 Mnemosyne 再回头看，所谓的“AI 记忆系统”，三分在算法和模型，七分其实都在数据清洗、生命周期管理和边界隔离上。把什么东西挡在门外、什么时候该让旧记忆退场、记错了怎么给用户留个橡皮擦——把这些不起眼的细节抠明白了，插件才算真正能长期用下去。

项目仓库：[@lxfight/astrbot_plugin_mnemosyne](https://github.com/lxfight/astrbot_plugin_mnemosyne)
