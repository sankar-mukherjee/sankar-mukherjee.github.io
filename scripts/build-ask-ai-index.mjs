import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const manifestPath = path.join(repoRoot, 'public', 'content', 'manifest.json');
const substackPath = path.join(repoRoot, 'public', 'substack.json');
const outPath = path.join(repoRoot, 'public', 'knowledge-base', 'ask-ai-index.json');
const standaloneBlogPostPath = path.join(repoRoot, 'public', 'content', 'blog-post.md');
const githubUser = process.env.GITHUB_USERNAME || 'sankar-mukherjee';
const maxRepos = Number(process.env.GITHUB_MAX_REPOS || 100);

const projectDocs = [
  {
    title: 'LLMCode',
    url: 'https://github.com/sankar-mukherjee/LLMCode',
    text: 'Hands-on learning repo where I implement LLM and deep learning components from scratch and share focused code snippets.',
  },
  {
    title: 'speech2speech_fullduplex',
    url: 'https://github.com/sankar-mukherjee/speech2speech_fullduplex',
    text: 'Full-duplex speech-to-speech project focused on simultaneous turn handling and low-latency conversational behavior.',
  },
  {
    title: 'speech2speech_halfduplex',
    url: 'https://github.com/sankar-mukherjee/speech2speech_halfduplex',
    text: 'Half-duplex speech-to-speech system for constrained local hardware experiments.',
  },
];

const resumeDocs = [
  {
    title: 'Resume Summary',
    url: '/#/resume',
    text: 'Senior Machine Learning Engineer specializing in ASR, TTS, voice cloning, and speech security with end-to-end ownership from research and training to low-latency production deployment.',
  },
  {
    title: 'Resume Experience - Omilia',
    url: '/#/resume',
    text: 'Senior Machine Learning Engineer at Omilia (Aug 2023 to Oct 2025). Built production-grade multilingual ASR and TTS systems, streaming low-latency inference, speech security pipelines, and cloud-native MLOps workflows.',
  },
  {
    title: 'Resume Experience - Oxolo',
    url: '/#/resume',
    text: 'Machine Learning Engineer at Oxolo (Apr 2022 to Jul 2023). Worked on generative speech systems, voice cloning from minimal reference audio, speech emotion recognition, and ML CI/CD monitoring pipelines.',
  },
  {
    title: 'Resume Experience - GOODIX',
    url: '/#/resume',
    text: 'Audio and Voice Algorithm Engineer at GOODIX (Apr 2021 to Mar 2022). Developed compact speech enhancement networks and applied pruning and INT8 quantization for mobile deployment constraints.',
  },
  {
    title: 'Resume Experience - DefinedCrowd',
    url: '/#/resume',
    text: 'Speech Scientist at DefinedCrowd (Sep 2019 to Mar 2021). Developed multilingual acoustic models, speech processing systems for noisy environments, and production-aligned data pipelines.',
  },
  {
    title: 'Resume Skills',
    url: '/#/resume',
    text: 'Skills include ASR, TTS, Speech LLMs, Whisper, RNNT, diffusion models, model evaluation, PyTorch, TensorFlow, Docker, distributed training, and streaming inference.',
  },
];

const cleanText = (text) =>
  String(text || '')
    .replace(/^---[\s\S]*?---/m, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const chunkText = (text, maxLen = 700, overlap = 120) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + maxLen);
    chunks.push(text.slice(i, end).trim());
    if (end === text.length) break;
    i = Math.max(0, end - overlap);
  }
  return chunks.filter(Boolean);
};

const parseFrontMatterTitle = (markdown) => {
  const match = /^\s*---\s*([\s\S]*?)\s*---/.exec(markdown);
  if (!match) return null;
  const titleMatch = /^\s*title:\s*(.*)/m.exec(match[1]);
  return titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : null;
};

const fetchGithubRepoDocs = async () => {
  const docs = [];
  const authToken = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const repos = [];
  let page = 1;
  const perPage = 100;

  while (repos.length < maxRepos) {
    const listUrl = `https://api.github.com/users/${githubUser}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`;
    const res = await fetch(listUrl, { headers });
    if (!res.ok) {
      throw new Error(`GitHub repo list failed (${res.status})`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  const selected = repos.slice(0, maxRepos);
  for (const repo of selected) {
    const owner = repo?.owner?.login || githubUser;
    const name = repo?.name;
    const defaultBranch = repo?.default_branch || 'main';
    const htmlUrl = repo?.html_url || `https://github.com/${owner}/${name}`;
    const repoMeta = cleanText(
      `${repo?.description || ''} ${Array.isArray(repo?.topics) ? repo.topics.join(' ') : ''} language ${repo?.language || ''}`
    );

    if (!name) continue;

    if (repoMeta) {
      docs.push({
        id: `github-meta-${owner}-${name}`,
        title: `GitHub Repo: ${name}`,
        url: htmlUrl,
        source: 'projects',
        text: repoMeta,
      });
    }

    const readmeCandidates = ['README.md', 'readme.md', 'README.MD'];
    let readmeText = '';
    for (const readme of readmeCandidates) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${name}/${defaultBranch}/${readme}`;
      try {
        const readmeRes = await fetch(rawUrl);
        if (!readmeRes.ok) continue;
        readmeText = await readmeRes.text();
        if (readmeText) break;
      } catch {
        // try next filename
      }
    }

    if (!readmeText) continue;
    const cleaned = cleanText(readmeText).slice(0, 18000);
    const chunks = chunkText(cleaned, 900, 120);
    chunks.forEach((chunk, idx) => {
      docs.push({
        id: `github-readme-${owner}-${name}-${idx}`,
        title: `GitHub README: ${name}`,
        url: htmlUrl,
        source: 'projects',
        text: chunk,
      });
    });
  }

  return docs;
};

const build = async () => {
  const docs = [];

  try {
    const manifestRaw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw);
    for (const file of manifest) {
      const fullPath = path.join(repoRoot, 'public', 'content', file);
      const md = await fs.readFile(fullPath, 'utf8');
      const title = parseFrontMatterTitle(md) || file.replace(/\.md$/, '');
      const text = cleanText(md);
      const chunks = chunkText(text);
      chunks.forEach((chunk, idx) => {
        docs.push({
          id: `blog-${file}-${idx}`,
          title,
          url: `/content/${file}`,
          source: 'blog',
          text: chunk,
        });
      });
    }
  } catch (err) {
    console.error('Blog indexing failed:', err.message);
  }

  try {
    const blogPostRaw = await fs.readFile(standaloneBlogPostPath, 'utf8');
    const firstHeading = blogPostRaw.match(/^#\s+(.+)$/m);
    const title = firstHeading ? firstHeading[1].trim() : 'Standalone Blog Post';
    const cleaned = cleanText(blogPostRaw);
    const chunks = chunkText(cleaned, 900, 120);
    chunks.forEach((chunk, idx) => {
      docs.push({
        id: `blog-standalone-${idx}`,
        title,
        url: '/#/blog/autoregressive-token-generation-why-streaming-latency-scales-with-tokens-per-second',
        source: 'blog',
        text: chunk,
      });
    });
  } catch (err) {
    console.error('Standalone blog indexing failed:', err.message);
  }

  try {
    const substackRaw = await fs.readFile(substackPath, 'utf8');
    const substack = JSON.parse(substackRaw);
    for (const item of substack.items || []) {
      const text = cleanText(`${item.title || ''} ${item.snippet || ''}`);
      docs.push({
        id: `substack-${item.link}`,
        title: item.title || 'Substack post',
        url: item.link || 'https://sankar1535.substack.com/',
        source: 'substack',
        text,
      });
    }
  } catch (err) {
    console.error('Substack indexing failed:', err.message);
  }

  projectDocs.forEach((p, idx) => {
    docs.push({
      id: `project-${idx}`,
      title: p.title,
      url: p.url,
      source: 'projects',
      text: cleanText(p.text),
    });
  });

  resumeDocs.forEach((p, idx) => {
    docs.push({
      id: `resume-${idx}`,
      title: p.title,
      url: p.url,
      source: 'resume',
      text: cleanText(p.text),
    });
  });

  try {
    const githubDocs = await fetchGithubRepoDocs();
    docs.push(...githubDocs);
  } catch (err) {
    console.error('GitHub repo indexing failed:', err.message);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    totalDocs: docs.length,
    docs,
  };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${docs.length} docs to public/knowledge-base/ask-ai-index.json`);
};

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
