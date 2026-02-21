# Autoregressive Token Generation: Why Streaming Latency Scales with Tokens Per Second

*February 21, 2026*

Autoregressive token generation creates a sequential bottleneck where each new token requires a full model pass, causing latency to scale with output length. Understanding this fundamental limitation is crucial for optimizing language model performance, especially in streaming applications.

In streaming, this relationship is defined by several key performance factors that determine the user experience and system efficiency.

## 1. Sequential Dependency

### One-by-one Generation

Autoregressive models must incorporate each newly generated token back into the context before predicting the next. This makes parallelizing the output phase impossible, unlike the initial prompt processing (prefill) which can be done in parallel.

### Latency Scaling

Because of this loop, total response time is roughly the **Time to First Token (TTFT)** plus the product of the number of tokens and the **Time Per Output Token (TPOT)**.

## 2. Hardware Bottlenecks (Memory Bandwidth)

### I/O vs. Computation

For small batch sizes common in streaming, the speed is limited by **memory bandwidth**—the time it takes to move model parameters from GPU memory to the processor—rather than actual math.

### KV Caching

To mitigate this, systems use **KV caching** to store previously computed attention states, preventing redundant calculations as the sequence grows.

## 3. Perceived vs. Absolute Latency

### Streaming Benefit

While autoregression is slow, **streaming delivers partial results** immediately. This drastically reduces **perceived latency** because the user sees progress (TTFT) even if the total generation takes a long time.

### Reading Speed

Optimal streaming targets are around **6–8 tokens per second**, which matches or slightly exceeds human reading speed (approximately 250 words per minute).

## 4. Throughput Trade-offs

While streaming improves perceived latency, it comes with important considerations for overall system throughput and efficiency.

## Strategies to Mitigate Latency

### 1. Speculative Decoding (Draft-Target)

Speculative decoding is a technique where a smaller, faster "draft" model generates multiple candidate tokens in parallel, which are then verified by the larger target model in a single pass.

**Key Benefits:**
- Achieves 2–3x speedup over standard autoregressive decoding
- Doesn't require retraining the base model
- Uses existing small models alongside large ones

**How It Works:**
The draft model generates K tokens, which the target model then evaluates in one forward pass. If any draft token doesn't match the target's probability distribution above a threshold, the entire sequence is rejected from that point forward.

**Trade-offs:**
- Requires fitting two models in GPU memory simultaneously
- Speedup varies significantly based on the draft model's accuracy
- Performance degrades when the draft and target models have different "styles"

### 2. Medusa / Multiple Token Prediction (MTP)

Medusa attaches multiple prediction "heads" directly onto the base model, each predicting tokens 1, 2, 3… steps ahead simultaneously.

**Key Benefits:**
- Achieves the fastest raw throughput (up to 3x on certain workloads)
- Only requires a single model in memory
- More consistent speedups than speculative decoding

**How It Works:**
Instead of using a separate draft model, Medusa adds lightweight "heads" to the existing model architecture that predict multiple future tokens in parallel from the same hidden state.

**Trade-offs:**
- Requires fine-tuning the model with these additional heads
- Increases VRAM usage slightly (though less than two separate models)
- Needs model architecture changes, not a pure inference-time optimization

### 3. EAGLE (Extrapolation Algorithm for Greater Language-Model Efficiency)

EAGLE uses a "feature-based" draft model that predicts future tokens by looking at the hidden state evolution pattern, rather than just autoregressive token sequences.

**Key Benefits:**
- Highest acceptance rate among speculative methods
- Better at handling complex logic and code
- More robust to domain shifts

**How It Works:**
EAGLE trains a small autoregressive model that predicts not just the next token, but the next hidden state. This allows it to draft tokens based on semantic features rather than surface patterns.

**Trade-offs:**
- More complex implementation than standard speculation
- Requires specific feature plugin support in frameworks like TensorRT-LLM
- Needs access to hidden states during inference

### 4. Lookahead / N-Gram Caching

Lookahead decoding leverages patterns in the prompt or previous output to predict the next several tokens without running inference.

**Key Benefits:**
- Zero-cost setup—no extra models or training required
- Works well for repetitive or structured text
- Particularly effective in Retrieval-Augmented Generation (RAG) scenarios

**How It Works:**
The system maintains an n-gram cache of common patterns. When generating text, it checks if the current context matches a cached pattern and, if so, directly outputs the continuation.

**Trade-offs:**
- Limited speedup (usually 1.2–1.5x)
- Only effective on highly predictable or repetitive content
- Doesn't help with creative or novel generation

### 5. Low Frame-Rate / "Relaxed" Tokens

Common in multimodal tasks like **speech synthesis** or **image generation**, these methods relax the "exact match" requirement of speculative decoding.

**Tolerance Factor:**
Because speech or image tokens are often ambiguous (multiple tokens can represent the same sound/pixel), systems use a **tolerance factor** (β) to accept draft tokens that are "close enough" to the target's prediction.

**Impact:**
This increases the token acceptance rate and decoding throughput without perceptually degrading the quality of the final output.

---

## Comparison of Low-Latency Decoding Strategies

| **Strategy** | **Primary Benefit** | **Technical Tradeoff** | **Best Use Case** |
|--------------|---------------------|------------------------|-------------------|
| **Speculative Decoding** | **2–3x speedup**; uses existing small models (e.g., Llama-70B + 1B). | Requires managing two models in GPU memory; high variance in speedup based on "drafter" accuracy. | General chat and reasoning where a smaller "assistant" version of the model exists. |
| **Medusa / MTP** | **Fastest raw throughput**; no second model needed. | Requires training/fine-tuning custom "heads" onto your base model; increases VRAM usage slightly. | High-volume production APIs where you have the resources to fine-tune the model architecture. |
| **EAGLE** | **Highest acceptance rate**; better at handling complex logic. | More complex implementation than standard speculation; requires specific "feature" plugin support in TensorRT-LLM. | Coding and math where standard small draft models often guess incorrectly. |
| **Lookahead / N-Gram** | **Zero-cost setup**; no extra models or training. | Limited speedup (usually ~1.2–1.5x); only works well on repetitive or highly structured text. | RAG applications or code generation where text is highly predictable/repetitive. |
| **Low Frame-Rate / Relaxed** | **Maximum "streaming" fluidness**; overcomes jitter. | Potential for minor quality drift; harder to implement for pure text (mostly used in Audio/Video). | Real-time voice assistants or multimodal streaming where "exact" tokens matter less than timing. |

---

## Decision Matrix: When to Use What?

Choosing the right strategy depends on your hardware constraints, whether you can afford to re-train parts of your model, and the specific nature of your traffic.

- **If you have a massive model and a small one available:** Use **Speculative Decoding** (Draft-Target). It's the standard "off-the-shelf" solution for vLLM and TensorRT-LLM.

- **If you are running on the edge (single GPU) and can't fit two models:** Use **Medusa** or **Lookahead**. These keep the memory footprint small.

- **If your priority is "Human-Like" Real-time Interaction:** Combine **Speculative Decoding** with a **Low Frame-Rate** buffer to ensure the text appears at a constant, comfortable reading speed rather than in "bursts."

- **If you are building for Code Generation:** Use **EAGLE**. Code has strict syntax that "dumb" drafters often fail, but EAGLE's context-aware drafting handles it much better.

---

Understanding these fundamental constraints and optimization strategies enables you to make informed decisions when designing and deploying streaming language model applications. The key is matching the right technique to your specific use case, hardware constraints, and performance requirements.
