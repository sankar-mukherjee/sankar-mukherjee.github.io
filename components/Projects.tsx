import React, { useEffect, useState } from 'react';

const projects = [
  {
    name: 'LLMCode',
    description:
      'Hands-on learning repo where I implement LLM and deep learning components from scratch and share small, focused code snippets.',
    repo: 'https://github.com/sankar-mukherjee/LLMCode',
    image:
      'https://raw.githubusercontent.com/sankar-mukherjee/LLMCode/main/repo.png',
    date: 'Ongoing',
    tags: ['LLM Fundamentals', 'Deep Learning', 'Code Snippets'],
  },
  {
    name: 'speech2speech_fullduplex',
    description:
      'A full-duplex speech-to-speech project focused on simultaneous turn handling and low-latency conversational behavior.',
    repo: 'https://github.com/sankar-mukherjee/speech2speech_fullduplex',
    date: 'Ongoing',
    tags: ['Speech', 'Realtime', 'Full Duplex'],
  },
  {
    name: 'speech2speech_halfduplex',
    description:
      'A hobby speech-to-speech system to study real-time behavior in a half‑duplex setup on constrained local hardware.',
    repo: 'https://github.com/sankar-mukherjee/speech2speech_halfduplex',
    date: 'Feb 13, 2026',
    tags: ['Speech', 'Realtime', 'Audio Systems'],
  },
  {
    name: 'Vocos with finetuning',
    description:
      'Finetuning a pre-trained Vocos model with mel spectrograms generated from any TTS decoder.',
    repo: 'https://github.com/sankar-mukherjee/vocos_finetune',
    date: 'Jul 23, 2024',
    tags: ['Speech', 'Vocos', 'Finetuning'],
  },
  {
    name: 'Speech to intent classification',
    description:
      'Speech-to-text → intent classification REST API that can be deployed to the cloud.',
    repo: 'https://github.com/sankar-mukherjee/speech2intent',
    date: 'Jun 8, 2023',
    tags: ['Speech', 'REST API', 'Intent'],
  },
  {
    name: 'VITS with MMS for TTS',
    description:
      'Voice cloning experiment using VITS TTS with MMS-based models.',
    repo: 'https://github.com/sankar-mukherjee/vits_with_mms',
    date: 'May 28, 2023',
    tags: ['TTS', 'VITS', 'Voice Cloning'],
  },
  {
    name: 'Universal TTS',
    description: 'Speech synthesis system with prosody embeddings.',
    repo: 'https://github.com/sankar-mukherjee/Expressive-Speech-Synthesis-Research',
    date: 'Dec 16, 2020',
    tags: ['TTS', 'Prosody', 'Speech Synthesis'],
  },
];

const parseRepo = (repoUrl: string): { owner: string; repo: string } | null => {
  const match = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/.exec(repoUrl);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
};

const resolveImageUrl = (imagePath: string, owner: string, repo: string, branch: string) => {
  if (/^https?:\/\//i.test(imagePath)) {
    const blobMatch = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/.exec(imagePath);
    if (blobMatch) {
      return `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}/${blobMatch[4]}`;
    }
    return imagePath;
  }
  const cleanPath = imagePath.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
};

const readmeCandidates = ['README.md', 'readme.md', 'README.MD'];
const branches = ['main', 'master'];

export const Projects: React.FC = () => {
  const [repoImages, setRepoImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchReadmeImage = async (repoUrl: string): Promise<string | null> => {
      const parsed = parseRepo(repoUrl);
      if (!parsed) return null;

      for (const branch of branches) {
        for (const readme of readmeCandidates) {
          try {
            const rawReadmeUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${readme}`;
            const res = await fetch(rawReadmeUrl);
            if (!res.ok) continue;

            const markdown = await res.text();
            const mdImageMatch = /!\[[^\]]*\]\(([^)]+)\)/.exec(markdown);
            if (mdImageMatch?.[1]) {
              return resolveImageUrl(mdImageMatch[1].trim(), parsed.owner, parsed.repo, branch);
            }

            const htmlImgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(markdown);
            if (htmlImgMatch?.[1]) {
              return resolveImageUrl(htmlImgMatch[1].trim(), parsed.owner, parsed.repo, branch);
            }
          } catch (error) {
            // Ignore and try next candidate.
          }
        }
      }

      return null;
    };

    const run = async () => {
      const results = await Promise.all(
        projects.map(async (project) => {
          const image = await fetchReadmeImage(project.repo);
          return [project.repo, image] as const;
        })
      );

      const next: Record<string, string> = {};
      results.forEach(([repo, image]) => {
        if (image) next[repo] = image;
      });
      setRepoImages(next);
    };

    run();
  }, []);

  return (
    <div className="fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate mb-3 font-sans">
          Projects
        </h2>
        <p className="text-gray-700 dark:text-light-slate">
          A small selection of personal projects and experiments.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map(project => (
          (() => {
            const projectImage = ('image' in project ? project.image : undefined) || repoImages[project.repo];
            return (
          <article
            key={project.name}
            className="group rounded-xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-gray-500 dark:text-slate">
                  {project.date}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-lightest-slate">
                  {project.name}
                </h3>
                <p className="mt-2 text-gray-700 dark:text-light-slate">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-slate/40 dark:text-light-slate"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5">
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-lightest-slate hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
              {projectImage ? (
                <div className="md:w-72 md:flex-shrink-0">
                  <img
                    src={projectImage}
                    alt={`${project.name} README preview`}
                    className="w-full max-h-52 rounded-lg object-contain bg-gray-50 dark:bg-navy/40"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          </article>
            );
          })()
        ))}
      </div>
    </div>
  );
};
