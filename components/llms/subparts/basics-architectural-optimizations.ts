import type { LlmSubpart } from '../types';

export const basicsArchitecturalOptimizations: LlmSubpart = {
  id: 'architectural-optimizations',
  title: 'Architectural Optimizations',
  description: 'What changes when you move from a minimal decoder to a production-grade model.',
  content: [
    'These are the practical upgrades that make modern LLMs faster, more stable, and cheaper to run.',
  ],
  comparisons: [
    {
      title: 'RMSNorm',
      description:
        'Replaces LayerNorm with RMSNorm to reduce compute while keeping quality. It is faster (and just as good) because it avoids the mean calculation and drops the bias term, which reduces both operations and parameters.',
      beforeLabel: 'GPT-0 (LayerNorm)',
      beforeCode: `self.ln1 = nn.LayerNorm(d_model)
self.ln2 = nn.LayerNorm(d_model)`,
      afterLabel: 'Optimized (RMSNorm)',
      afterCode: `class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(dim))
        self.eps = eps

    def forward(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.weight

# usage
self.ln1 = RMSNorm(d_model)
self.ln2 = RMSNorm(d_model)`,
    },
    {
      title: 'RoPE (Rotary Positional Embeddings)',
      description:
        'Swaps learned positional embeddings for rotary embeddings that rotate queries/keys in a way that preserves relative position information, improving long-context generalization without adding parameters.',
      beforeLabel: 'GPT-0 (Learned Positional Embedding)',
      beforeCode: `self.pos_emb = nn.Embedding(max_seq_len, d_model)
pos = torch.arange(T, device=device)
x = self.token_emb(input_ids) + self.pos_emb(pos)`,
      afterLabel: 'Optimized (RoPE)',
      afterCode: `def build_rope_cache(seq_len, head_dim, device, base=10000):
    half_dim = head_dim // 2
    inv_freq = base ** (-torch.arange(half_dim, device=device) / half_dim)
    positions = torch.arange(seq_len, device=device)
    freqs = positions[:, None] * inv_freq[None, :]
    return freqs.cos(), freqs.sin()

def apply_rope(x, cos, sin):
    x1, x2 = x[..., ::2], x[..., 1::2]
    return torch.cat([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1)

cos, sin = build_rope_cache(self.max_seq_len, head_dim, device)
q = apply_rope(q, cos[:T], sin[:T])
k = apply_rope(k, cos[:T], sin[:T])`,
    },
    {
      title: 'Flash / Fused Attention (PyTorch SDPA)',
      description:
        'Uses PyTorch’s fused attention kernel to reduce memory overhead and speed up attention, especially for long sequences, while keeping the same attention semantics.',
      beforeLabel: 'GPT-0 (Manual attention)',
      beforeCode: `att = (q @ k.transpose(-2, -1)) * self.scale
mask = torch.tril(torch.ones(T, T, device=x.device)).bool()
att = att.masked_fill(~mask, float("-inf"))
att = F.softmax(att, dim=-1)
out = att @ v`,
      afterLabel: 'Optimized (SDPA)',
      afterCode: `out = F.scaled_dot_product_attention(
    q, k, v,
    is_causal=True
)`,
    },
    {
      title: 'KV Cache for Fast Generation',
      description:
        'Caches past keys and values so each new token only attends to the new slice instead of recomputing attention over the full prefix, cutting generation latency dramatically.',
      beforeLabel: 'GPT-0 (Recompute all tokens)',
      beforeCode: `logits = self(input_cond)  # full forward every step`,
      afterLabel: 'Optimized (KV cache)',
      afterCode: `def forward(self, x, cos, sin, kv_cache=None):
    # ...
    if kv_cache is not None:
        k = torch.cat([kv_cache[0], k], dim=2)
        v = torch.cat([kv_cache[1], v], dim=2)
    # ...
    return self.out(out), (k, v)`,
    },
    {
      title: 'SwiGLU FeedForward',
      description:
        'Replaces GELU FFN with SwiGLU to improve expressivity and training efficiency at similar compute. The gated structure often yields better quality per parameter.',
      beforeLabel: 'GPT-0 (GELU FFN)',
      beforeCode: `self.net = nn.Sequential(
    nn.Linear(d_model, 4 * d_model),
    nn.GELU(),
    nn.Linear(4 * d_model, d_model),
)`,
      afterLabel: 'Optimized (SwiGLU)',
      afterCode: `hidden = 8 * d_model // 3
self.w1 = nn.Linear(d_model, hidden, bias=False)
self.w2 = nn.Linear(d_model, hidden, bias=False)
self.w3 = nn.Linear(hidden, d_model, bias=False)

def forward(self, x):
    return self.w3(F.silu(self.w1(x)) * self.w2(x))`,
    },
    {
      title: 'Tied Embeddings',
      description:
        'Shares token embedding and output projection weights to reduce parameters and sometimes improve generalization by coupling input/output representations.',
      beforeLabel: 'GPT-0 (Separate weights)',
      beforeCode: `self.token_emb = nn.Embedding(vocab_size, d_model)
self.lm_head = nn.Linear(d_model, vocab_size, bias=False)`,
      afterLabel: 'Optimized (Weight tying)',
      afterCode: `self.token_emb = nn.Embedding(vocab_size, d_model)
self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
self.lm_head.weight = self.token_emb.weight`,
    },
  ],
  codeLink: 'https://github.com/sankar-mukherjee/LLMCode/blob/main/src/llms/llm_4.py',
};
