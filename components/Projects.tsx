import React from 'react';

const projects = [
  {
    name: 'LLMCode',
    description:
      'Hands-on learning repo where I implement LLM and deep learning components from scratch and share small, focused code snippets.',
    repo: 'https://github.com/sankar-mukherjee/LLMCode',
    date: 'Ongoing',
    tags: ['LLM Fundamentals', 'Deep Learning', 'Code Snippets'],
  },
  {
    name: 'speech2speech_halfduplex',
    description:
      'A hobby speech-to-speech system to study real-time behavior in a half‑duplex setup on constrained local hardware.',
    repo: 'https://github.com/sankar-mukherjee/speech2speech_halfduplex',
    date: 'Ongoing',
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

export const Projects: React.FC = () => {
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

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map(project => (
          <article
            key={project.name}
            className="group rounded-xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-gray-500 dark:text-slate">
                  {project.date}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-lightest-slate">
                  {project.name}
                </h3>
                <p className="mt-2 text-gray-700 dark:text-light-slate">
                  {project.description}
                </p>
              </div>
            </div>
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
          </article>
        ))}
      </div>
    </div>
  );
};
