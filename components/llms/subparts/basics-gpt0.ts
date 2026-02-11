import type { LlmSubpart } from '../types';

export const basicsGpt0: LlmSubpart = {
  id: 'gpt0-minimal-decoder',
  title: 'GPT-0 (Minimal Decoder)',
  description: 'Core representations and how sequences are mapped into vectors.',
  content: [
    'This section walks through a minimal GPT-style decoder that omits optimizations so the mechanics are easy to trace.',
    'Use it to understand how token embeddings, positional signals, and attention flow through a basic decoder block.',
  ],
  images: [
    {
      src: 'https://raw.githubusercontent.com/sankar-mukherjee/LLMCode/main/src/llms/imgs/decoder_transformer_block.png',
      alt: 'Decoder transformer block diagram',
    },
    {
      src: 'https://raw.githubusercontent.com/sankar-mukherjee/LLMCode/main/src/llms/imgs/SDPA.webp',
      alt: 'Scaled dot-product attention diagram',
    },
  ],
  snippets: [
    {
      title: 'Imports',
      description: 'Pulls in the core PyTorch modules used throughout the model.',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F`,
    },
    {
      title: 'Causal Self-Attention',
      description: 'Implements scaled dot-product attention with a causal mask.',
      code: `class CausalSelfAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        assert d_model % n_heads == 0

        self.n_heads = n_heads
        self.head_dim = d_model // n_heads
        self.scale = self.head_dim ** -0.5

        self.qkv = nn.Linear(d_model, 3 * d_model)
        self.out = nn.Linear(d_model, d_model)

    def forward(self, x):
        B, T, C = x.shape

        qkv = self.qkv(x)
        q, k, v = qkv.chunk(3, dim=-1)

        q = q.view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.n_heads, self.head_dim).transpose(1, 2)

        att = (q @ k.transpose(-2, -1)) * self.scale

        # causal mask
        mask = torch.tril(torch.ones(T, T, device=x.device)).bool()
        att = att.masked_fill(~mask, float("-inf"))

        att = F.softmax(att, dim=-1)

        out = att @ v
        out = out.transpose(1, 2).contiguous().view(B, T, C)

        return self.out(out)`,
    },
    {
      title: 'Feed-Forward Network',
      description: 'Applies a 2-layer MLP with GELU nonlinearity to each token.',
      code: `class FeedForward(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.GELU(),
            nn.Linear(4 * d_model, d_model),
        )

    def forward(self, x):
        return self.net(x)`,
    },
    {
      title: 'Decoder Block',
      description: 'Stacks layer norm, attention, and MLP with residual connections.',
      code: `class DecoderBlock(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.ln1 = nn.LayerNorm(d_model)
        self.attn = CausalSelfAttention(d_model, n_heads)
        self.ln2 = nn.LayerNorm(d_model)
        self.ffn = FeedForward(d_model)

    def forward(self, x):
        x = x + self.attn(self.ln1(x))
        x = x + self.ffn(self.ln2(x))
        return x`,
    },
    {
      title: 'GPT Decoder',
      description: 'Defines embeddings, stacked blocks, and the language modeling head.',
      code: `class GPTDecoder(nn.Module):
    def __init__(self, vocab_size, d_model, n_heads, n_layers, max_seq_len):
        super().__init__()

        self.max_seq_len = max_seq_len

        self.token_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = nn.Embedding(max_seq_len, d_model)

        self.blocks = nn.ModuleList([
            DecoderBlock(d_model, n_heads)
            for _ in range(n_layers)
        ])

        self.ln_f = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)

    def forward(self, input_ids):
        B, T = input_ids.shape
        device = input_ids.device

        assert T <= self.max_seq_len, "Sequence too long"

        pos = torch.arange(T, device=device)
        x = self.token_emb(input_ids) + self.pos_emb(pos)

        for block in self.blocks:
            x = block(x)

        x = self.ln_f(x)
        logits = self.lm_head(x)
        return logits`,
    },
    {
      title: 'Autoregressive Generation',
      description: 'Generates tokens by sampling from the final-step logits.',
      code: `    @torch.no_grad()
    def generate(self, input_ids, max_new_tokens, temperature=1.0):
        self.eval()

        for _ in range(max_new_tokens):
            input_cond = input_ids[:, -self.max_seq_len:]
            logits = self(input_cond)
            next_token_logits = logits[:, -1, :]

            if temperature == 0.0:
                next_token = torch.argmax(next_token_logits, dim=-1, keepdim=True)
            else:
                probs = F.softmax(next_token_logits / temperature, dim=-1)
                next_token = torch.multinomial(probs, 1)

            input_ids = torch.cat([input_ids, next_token], dim=1)

        return input_ids`,
    },
  ],
  codeLink: 'https://github.com/sankar-mukherjee/LLMCode/blob/main/src/llms/llm_0.py',
};
