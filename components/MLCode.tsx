import React, { useEffect } from 'react';
import hljs from 'highlight.js';

type Snippet = {
  title: string;
  code: string;
};

type MLSection = {
  id: string;
  title: string;
  sourceUrl: string;
  images: { src: string; alt: string }[];
  snippets: Snippet[];
};

const sections: MLSection[] = [
  {
    id: 'cnn',
    title: 'CNN',
    sourceUrl: 'https://github.com/sankar-mukherjee/LLMCode/blob/main/src/basic/cnn/cnn.py',
    images: [{ src: '/cnn.jpg', alt: 'CNN diagram' }],
    snippets: [
      {
        title: 'Conv2D',
        code: `class Conv2D(nn.Module):
    def __init__(self,
                 in_channels,
                 out_channels,
                 kernel_size,
                 stride=1,
                 padding=0,
                 bias=True):
        super().__init__()

        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.out_channels = out_channels

        # (out_channels, in_channels, kernel_size, kernel_size)
        self.linear = nn.Linear(
            in_channels * kernel_size * kernel_size,
            out_channels,
            bias=bias
        )

    def forward(self, x):
        # x: (B, C, H, W)
        B, C, H, W = x.shape

        if self.padding > 0:
            # (B, C, H+2p, W+2p)
            x = F.pad(x, (self.padding, self.padding, self.padding, self.padding))

        out_h = (x.shape[2] - self.kernel_size) // self.stride + 1
        out_w = (x.shape[3] - self.kernel_size) // self.stride + 1

        # (B, C, out_h, out_w, k, k)
        patches = x.unfold(2, self.kernel_size, self.stride).unfold(3, self.kernel_size, self.stride)
        # (B, C, out_h, out_w, k*k)
        patches = patches.contiguous().view(B, C, out_h, out_w, -1)
        # (B, out_h, out_w, C*k*k)
        patches = patches.permute(0,2,3,1,4).reshape(B, out_h, out_w, -1)

        # (B, out_h, out_w, out_channels)
        out = self.linear(patches)

        # (B, out_channels, out_h, out_w)
        out = out.permute(0,3,1,2)

        return out`,
      },
      {
        title: 'MaxPool2D',
        code: `class MaxPool2D(nn.Module):
    def __init__(self, pool_size=2):
        super().__init__()
        self.pool_size = pool_size

    def forward(self, x):
        # x: (B, C, H, W)
        p = self.pool_size
        # (B, C, H//p, W//p, p, p)
        patches = x.unfold(2, p, p).unfold(3, p, p)
        # (B, C, H//p, W//p)
        return patches.amax(dim=(-1, -2))`,
      },
      {
        title: 'MultiLayerCNN2D',
        code: `class ConvBlock2D(nn.Module):
    def __init__(self, in_c, out_c, kernel_size=3, padding=1, pool_size=2):
        super().__init__()

        self.conv = Conv2D(in_c, out_c, kernel_size=kernel_size, padding=padding)
        self.relu = nn.ReLU()
        self.pool = MaxPool2D(pool_size=pool_size)

    def forward(self, x):
        # x: (B, in_c, H, W)
        x = self.conv(x)
        x = self.relu(x)
        x = self.pool(x)
        return x`,
      },
      {
        title: 'MultiLayerCNN2D',
        code: `class MultiLayerCNN2D(nn.Module):
    def __init__(self,
                 input_size=28,
                 in_channels=1,
                 conv_channels=[32, 64],
                 kernel_size=3,
                 padding=1,
                 pool_size=2,
                 fc_hidden=128,
                 num_classes=10):

        super().__init__()

        # Build conv blocks
        channels = [in_channels] + conv_channels
        self.blocks = nn.ModuleList([
            ConvBlock2D(channels[i], channels[i+1], kernel_size, padding, pool_size)
            for i in range(len(conv_channels))
        ])

        # Calculate output size after all conv+pool layers
        size = input_size
        for _ in conv_channels:
            size = (size + 2*padding - kernel_size + 1) // pool_size

        flattened = conv_channels[-1] * size * size

        # Fully connected layers
        self.fc1 = nn.Linear(flattened, fc_hidden)
        self.fc2 = nn.Linear(fc_hidden, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x):
        # x: (B, in_channels, input_size, input_size)

        for block in self.blocks:
            x = block(x)

        # (B, flattened)
        x = x.view(x.size(0), -1)

        # (B, fc_hidden)
        x = self.relu(self.fc1(x))
        # (B, num_classes)
        x = self.fc2(x)

        return x`,
      },
    ],
  },
  {
    id: 'rnn',
    title: 'RNN',
    sourceUrl: 'https://github.com/sankar-mukherjee/LLMCode/blob/main/src/basic/rnn/rnn.py',
    images: [
      { src: '/rnn.webp', alt: 'RNN diagram' },
      { src: '/lstm.png', alt: 'LSTM diagram' },
    ],
    snippets: [
      {
        title: 'SimpleRNN (full)',
        code: `class SimpleRNN(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super().__init__()

        self.hidden_size = hidden_size

        # RNN weights
        self.Wx = nn.Linear(input_size, hidden_size)
        self.Wh = nn.Linear(hidden_size, hidden_size)

        # output layer
        self.fc = nn.Linear(hidden_size, num_classes)
        self.tanh = nn.Tanh()

    def forward(self, x):
        # x: (batch, seq_len, input_size)
        batch, seq_len, _ = x.shape
        h = torch.zeros(batch, self.hidden_size, device=x.device)

        for t in range(seq_len):
            xt = x[:, t, :]
            h = self.tanh(self.Wx(xt) + self.Wh(h))

        out = self.fc(h)
        return out`,
      },
      {
        title: 'ManualLSTM + LSTMModel (full)',
        code: `class ManualLSTM(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.hidden_size = hidden_size

        # one projection for all 4 gates (common interview pattern)
        self.Wx = nn.Linear(input_size, 4 * hidden_size)
        self.Wh = nn.Linear(hidden_size, 4 * hidden_size)

    def forward(self, x, h, c):
        # x: (batch, input_size)
        gates = self.Wx(x) + self.Wh(h)

        # split into 4 gates
        i, f, g, o = gates.chunk(4, dim=-1)

        i = torch.sigmoid(i)   # input gate
        f = torch.sigmoid(f)   # forget gate
        o = torch.sigmoid(o)   # output gate
        g = torch.tanh(g)      # candidate

        c_next = f * c + i * g
        h_next = o * torch.tanh(c_next)

        return h_next, c_next

class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden, num_classes):
        super().__init__()
        self.cell = ManualLSTM(input_size, hidden)
        self.fc = nn.Linear(hidden, num_classes)

    def forward(self, x):
        B, T, _ = x.shape
        h = torch.zeros(B, self.cell.hidden_size, device=x.device)
        c = torch.zeros_like(h)

        for t in range(T):
            h, c = self.cell(x[:, t], h, c)

        return self.fc(h)`,
      },
    ],
  },
  {
    id: 'loss',
    title: 'Loss',
    sourceUrl: 'https://github.com/sankar-mukherjee/LLMCode/blob/main/src/basic/loss/loss.py',
    images: [{ src: '/loss_eq.png', alt: 'Loss equations' }],
    snippets: [
      {
        title: 'MSE Loss',
        code: `def mse_loss(pred, target):
    diff = pred - target
    return torch.mean(diff ** 2)`,
      },
      {
        title: 'Numerically Stable Softmax',
        code: `def softmax(logits, dim=-1):
    max_logits = torch.max(logits, dim=dim, keepdim=True)[0]
    exp_logits = torch.exp(logits - max_logits)
    sum_exp = torch.sum(exp_logits, dim=dim, keepdim=True)
    return exp_logits / sum_exp`,
      },
      {
        title: 'Log-Softmax (stable)',
        code: `def log_softmax(logits, dim=-1):
    max_logits = torch.max(logits, dim=dim, keepdim=True)[0]
    exp_logits = torch.exp(logits - max_logits)
    sum_exp = torch.sum(exp_logits, dim=dim, keepdim=True)
    return (logits - max_logits) - torch.log(sum_exp)`,
      },
      {
        title: 'Cross Entropy (manual)',
        code: `def cross_entropy_loss(logits, targets):
    log_probs = log_softmax(logits, dim=1)
    batch_indices = torch.arange(logits.shape[0], device=logits.device)
    log_probs_of_true_class = log_probs[batch_indices, targets]
    return -torch.mean(log_probs_of_true_class)`,
      },
      {
        title: 'Binary Cross Entropy',
        code: `def binary_cross_entropy(pred, target, eps=1e-8):
    pred = torch.clamp(pred, eps, 1 - eps)
    loss = -(target * torch.log(pred) + (1 - target) * torch.log(1 - pred))
    return loss.mean()`,
      },
      {
        title: 'KL Divergence (Gaussian)',
        code: `def kl_divergence_normal(mu_p, sigma_p, mu_q, sigma_q):
    term1 = torch.log(sigma_q / sigma_p)
    term2 = (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2)
    return term1 + term2 - 0.5`,
      },
      {
        title: 'Cosine Similarity Loss',
        code: `def cosine_similarity_loss(x1, x2, eps=1e-8):
    dot = torch.sum(x1 * x2, dim=1)
    norm_x1 = torch.sqrt(torch.sum(x1**2, dim=1) + eps)
    norm_x2 = torch.sqrt(torch.sum(x2**2, dim=1) + eps)
    cos_sim = dot / (norm_x1 * norm_x2)
    return (1.0 - cos_sim).mean()`,
      },
      {
        title: 'Contrastive Loss',
        code: `def contrastive_loss(x1, x2, labels, margin=1.0):
    distances = torch.norm(x1 - x2, dim=1)
    pos_loss = labels * distances.pow(2)
    neg_loss = (1 - labels) * torch.clamp(margin - distances, min=0).pow(2)
    return (pos_loss + neg_loss).mean()`,
      },
    ],
  },
];

const renderSnippet = (snippet: Snippet, wrap = false) => (
  <article key={snippet.title} className="space-y-2">
    <h4 className="text-lg font-semibold text-gray-900 dark:text-lightest-slate">
      {snippet.title}
    </h4>
    <pre className={`vscode-code rounded-xl p-4 text-xs ${wrap ? 'whitespace-pre-wrap break-words overflow-hidden' : 'overflow-x-auto'}`}>
      <code className="language-python">{snippet.code}</code>
    </pre>
  </article>
);

export const MLCode: React.FC = () => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return (
    <div className="fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate mb-3 font-sans">
          ML Code
        </h2>
        <p className="text-gray-700 dark:text-light-slate">
          Curated snippets from <code>LLMCode/src/basic</code> for <code>cnn</code>, <code>rnn</code>, and <code>loss</code>.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <details
            key={section.id}
            className="group rounded-xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-5 shadow-sm"
            open={section.id === 'cnn'}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-lightest-slate">
                  {section.title}
                </h3>
                <p className="text-xs font-mono text-gray-500 dark:text-slate">Snippets</p>
              </div>
              <span className="text-gray-500 dark:text-slate group-open:rotate-180 transition-transform duration-300">
                <i className="fas fa-chevron-down"></i>
              </span>
            </summary>

            <div className="mt-4 space-y-4">
              <a
                href={section.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-lightest-slate hover:underline"
              >
                View source on GitHub
              </a>

              {section.id === 'cnn' ? (
                <div className="space-y-4">
                  <img
                    src={section.images[0].src}
                    alt={section.images[0].alt}
                    className="w-full max-h-72 rounded-lg border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 object-contain"
                    loading="lazy"
                  />
                  <div className="grid gap-4 lg:grid-cols-2 items-start">
                    <div className="space-y-4">
                      {renderSnippet(section.snippets[0], true)}
                      {renderSnippet(section.snippets[1], true)}
                    </div>
                    <div className="space-y-4">
                      {renderSnippet(section.snippets[2], true)}
                      {renderSnippet(section.snippets[3], true)}
                    </div>
                  </div>
                </div>
              ) : null}

              {section.id === 'rnn' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 items-start">
                    {section.images.map((img) => (
                      <img
                        key={img.src}
                        src={img.src}
                        alt={img.alt}
                        className="w-full max-h-72 rounded-lg border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 object-contain"
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {section.snippets.map((snippet) => renderSnippet(snippet))}
                  </div>
                </div>
              ) : null}

              {section.id === 'loss' ? (
                <div className="grid gap-6 lg:grid-cols-2 items-start">
                  <div className="space-y-4">
                    {section.snippets.map((snippet) => renderSnippet(snippet, true))}
                  </div>
                  <div className="lg:sticky lg:top-6">
                    <img
                      src={section.images[0].src}
                      alt={section.images[0].alt}
                      className="w-full rounded-lg border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
