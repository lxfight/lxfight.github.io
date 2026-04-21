---
title: AstrBot插件开发实战：从零打造RAG记忆系统
date: "2024-08-04"
category: AI 应用
excerpt: 深入分析获得 110+ stars 的 AstrBot Mnemosyne 插件开发过程，分享 RAG 技术在聊天机器人长期记忆中的应用实践。
tags:
  - Python
  - RAG
  - 插件开发
featured: true
badge: 精选
---

在开发 AstrBot Mnemosyne 插件的过程中，我把很多原本分散的想法真正落成了系统设计。这个插件的目标并不复杂：让聊天机器人具备可持续的长期记忆能力，但要把这件事做得稳定、可控、可维护，里面其实有不少工程问题。

这篇文章按实际开发路径来复盘，从问题定义、架构设计、关键实现到后续优化。

## 项目背景

传统聊天机器人在长对话中最大的体验问题之一，就是上下文记忆能力不足。用户刚说过的话，过一会儿模型就“忘了”；更长期的信息，比如用户偏好、持续任务和历史关系，也很难被稳定利用。

Mnemosyne 的目标是给 AstrBot 增加一层持久化记忆：

- 记住真正重要的对话。
- 在合适的时候检索出来。
- 不让记忆库无限膨胀。
- 尽量降低使用门槛。

## 技术架构

核心思路是典型的 RAG，但重点不在“能检索”，而在“检索是否有价值”。

- 向量数据库负责存储和召回。
- 文本嵌入负责把自然语言转换为可检索表示。
- 检索策略负责筛选相关记忆。
- 记忆管理负责控制生命周期和质量。

## 关键实现

### 1. 文本预处理与分块

长文本如果不切分，会影响向量化质量和检索粒度。我的做法是按句子粗切，再控制块大小。

```python
def chunk_text(text: str, max_chunk_size: int = 500) -> list[str]:
    """将长文本分割成适合向量化的块"""
    sentences = re.split(r"[.!?。！？]", text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk + sentence) <= max_chunk_size:
            current_chunk += sentence + "。"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + "。"

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks
```

### 2. 记忆筛选

并不是所有消息都值得进入长期记忆。真正难的部分，是判断一段对话有没有长期价值。

```python
def calculate_importance_score(message: str) -> float:
    """计算消息的重要性得分"""
    score = 0.0

    important_keywords = ["喜欢", "讨厌", "记住", "重要", "秘密"]
    for keyword in important_keywords:
        if keyword in message:
            score += 0.2

    if "？" in message or "吗" in message:
        score += 0.1

    if 10 <= len(message) <= 100:
        score += 0.1

    return min(score, 1.0)
```

这个评分逻辑不复杂，但很有效。因为在早期版本里，我最常见的问题不是“记不住”，而是“记住了太多没用的东西”。

### 3. 检索优化

为了提升召回质量，我没有只依赖单一相似度检索，而是做了几层组合：

- 语义检索作为主路径。
- 关键词匹配作为补充。
- 时间衰减作为排序因子，让近期内容更容易被命中。

这几层叠加起来的好处是：系统更像“会想起重点”，而不是“随机翻档案”。

## 性能优化

### 批量向量化

如果逐条调用嵌入接口，吞吐和成本都不理想。批量处理可以明显改善这一点。

```python
async def batch_embed_texts(texts: list[str], batch_size: int = 10):
    """批量生成文本向量"""
    embeddings = []
    for index in range(0, len(texts), batch_size):
        batch = texts[index:index + batch_size]
        result = await client.embeddings.create(
            model="text-embedding-ada-002",
            input=batch
        )
        embeddings.extend(item.embedding for item in result.data)
    return embeddings
```

### 缓存

对重复向量化请求和高频检索结果做缓存后，响应速度提升很明显，也能减少外部 API 消耗。

## 发布后的迭代

项目开源之后，我陆续做了几轮比较关键的调整：

- 增加记忆容量限制，避免存储持续膨胀。
- 优化相关性排序，减少“看起来像相关，其实没用”的结果。
- 增加导出能力，方便用户自己管理记忆库。
- 支持更多嵌入模型，降低使用成本。

## 经验总结

做这类插件时，我觉得最重要的不是模型能力本身，而是系统边界。

- 什么内容应该记住。
- 记住后何时召回。
- 错误召回时怎么尽量降低干扰。
- 存储规模如何保持可控。

如果这些问题没有想清楚，只是把“向量库 + Embedding + 检索”拼起来，用户体验通常不会稳定。

## 未来规划

接下来我还想继续补几个方向：

- 支持图片和文件的记忆存储。
- 增加短期记忆和长期记忆分层。
- 加入主动遗忘机制。
- 提供更多向量数据库选项。

## 总结

AstrBot Mnemosyne 是一次很扎实的 AI 工程实践。它让我更明确地意识到，RAG 不只是“把文档喂给模型”，而是一整套围绕记忆质量、检索效果和系统维护成本展开的设计问题。

如果你也在做类似的功能，可以先把最小闭环跑通：存储、筛选、召回，再逐步补优化层。这样比一开始追求全功能更稳。

项目地址：[@lxfight/astrbot_plugin_mnemosyne](https://github.com/lxfight/astrbot_plugin_mnemosyne)
