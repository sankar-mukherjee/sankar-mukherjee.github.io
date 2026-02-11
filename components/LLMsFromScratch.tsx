import React, { useEffect, useMemo, useState } from 'react';
import { llmParts } from './llms';
import type { LlmSubpart } from './llms/types';

const repoUrl = 'https://github.com/sankar-mukherjee/LLMCode';

export const LLMsFromScratch: React.FC = () => {
  const [activeSubpartId, setActiveSubpartId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash || '';
      const match = /^#\/llms\/([^/]+)\/([^/]+)$/.exec(hash);
      if (match) {
        setActiveSubpartId(match[2]);
      } else {
        setActiveSubpartId(null);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const activeSubpart = useMemo(() => {
    if (!activeSubpartId) return null;
    for (const part of llmParts) {
      const match = part.subparts.find((subpart) => subpart.id === activeSubpartId);
      if (match) {
        return { part, subpart: match };
      }
    }
    return null;
  }, [activeSubpartId]);

  const updateHash = (partId: string, subpartId: string) => {
    window.location.hash = `#/llms/${partId}/${subpartId}`;
  };

  const clearHash = () => {
    if (window.location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  const handleShare = (partId: string, subpartId: string) => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#/llms/${partId}/${subpartId}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  if (activeSubpart) {
    const { part, subpart } = activeSubpart;
    return (
      <div className="fade-in space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-gray-500 dark:text-slate">
              LLMs From Scratch / {part.title}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate font-sans">
              {subpart.title}
            </h2>
            <p className="mt-3 text-gray-700 dark:text-light-slate">
              {subpart.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleShare(part.id, subpart.id)}
              className={`group relative inline-flex items-center text-sm font-medium border px-3 py-1.5 rounded-full transition-all duration-300 ${
                copied
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-navy dark:border-white'
                  : 'text-gray-900 dark:text-lightest-slate border-gray-300 dark:border-slate/60 hover:shadow-sm'
              }`}
              aria-label="Copy share link"
            >
              <i className="fas fa-link mr-2"></i>
              Share
              <span className="pointer-events-none absolute -top-8 right-0 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                {copied ? 'Copied!' : 'Copy link'}
              </span>
            </button>
            <button
              onClick={() => clearHash()}
              className="text-sm font-medium text-gray-900 dark:text-lightest-slate hover:underline"
            >
              Back
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-6 shadow-sm space-y-4">
          {subpart.content.map((paragraph) => (
            <p key={paragraph} className="text-sm text-gray-700 dark:text-light-slate">
              {paragraph}
            </p>
          ))}
          {subpart.sections ? (
            <div className="grid gap-3 md:grid-cols-2">
              {subpart.sections.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 px-4 py-3 text-sm text-gray-800 dark:text-light-slate"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          {subpart.figures ? (
            <div className="space-y-4">
              {subpart.figures.map((figure) => (
                <div
                  key={figure.title}
                  className="rounded-xl border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 p-4 space-y-3"
                >
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-lightest-slate">
                      {figure.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-light-slate">
                      {figure.description}
                    </p>
                  </div>
                  {figure.topics ? (
                    <div className="space-y-3">
                      {figure.topics.map((topic) => (
                        <div key={topic.title} className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-lightest-slate">
                            {topic.title}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-light-slate">
                            {topic.description}
                          </p>
                          {figure.src && figure.imageAfterTopicTitle === topic.title ? (
                            <img
                              src={figure.src}
                              alt={figure.alt || figure.title}
                              className="w-full md:w-1/2 rounded-lg object-contain"
                              loading="lazy"
                            />
                          ) : null}
                          {topic.points ? (
                            <ul className="mt-1 space-y-1 text-sm text-gray-700 dark:text-light-slate list-disc pl-5">
                              {topic.points.map((point) => (
                                <li key={point}>{point}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {figure.groups ? (
                    <div className="space-y-3">
                      {figure.groups.map((group) => (
                        <div key={group.header} className="rounded-lg border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 px-3 py-3 space-y-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-lightest-slate">
                            {group.header}
                          </p>
                          <div className="space-y-2">
                            {group.items.map((item) => (
                              <div key={item.title}>
                                <p className="text-sm font-semibold text-gray-900 dark:text-lightest-slate">
                                  {item.title}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-light-slate">
                                  {item.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {figure.src && !figure.imageAfterTopicTitle ? (
                    <img
                      src={figure.src}
                      alt={figure.alt || figure.title}
                      className="w-full md:w-1/2 rounded-lg object-contain"
                      loading="lazy"
                    />
                  ) : null}
                  {figure.images ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {figure.images.map((img) => (
                        <img
                          key={img.src}
                          src={img.src}
                          alt={img.alt}
                          className="w-full rounded-lg object-contain"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {subpart.comparisons ? (
            <div className="space-y-6">
              {subpart.comparisons.map((item) => (
                <div key={item.title} className="space-y-3">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-lightest-slate">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-light-slate">
                      {item.description}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 p-4">
                      <p className="text-xs font-mono text-gray-500 dark:text-slate mb-2">
                        {item.beforeLabel}
                      </p>
                      <pre className="overflow-x-auto text-xs text-gray-800 dark:text-light-slate">
                        <code className="language-python">{item.beforeCode}</code>
                      </pre>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 p-4">
                      <p className="text-xs font-mono text-gray-500 dark:text-slate mb-2">
                        {item.afterLabel}
                      </p>
                      <pre className="overflow-x-auto text-xs text-gray-800 dark:text-light-slate">
                        <code className="language-python">{item.afterCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {subpart.snippets ? (
            <div className="space-y-5">
              {subpart.snippets.map((snippet) => (
                <div key={snippet.title} className="space-y-2">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-lightest-slate">
                    {snippet.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-light-slate">
                    {snippet.description}
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-gray-200/80 dark:border-slate/60 bg-gray-50 dark:bg-navy/40 p-4 text-xs text-gray-800 dark:text-light-slate">
                    <code className="language-python">{snippet.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          ) : null}
          {subpart.images ? (
            <div className="grid gap-4 md:grid-cols-2">
              {subpart.images.map((image) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className="w-full rounded-xl border border-gray-200/80 dark:border-slate/60 bg-white dark:bg-navy/40 object-contain p-2"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}
          {subpart.codeLink ? (
            <a
              href={subpart.codeLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-lightest-slate hover:underline"
            >
              View related code
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-10">
      <div className="space-y-4">
        <p className="text-xs font-mono text-gray-500 dark:text-slate">LLMs From Scratch</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate font-sans">
          Learning LLMs by Building Them
        </h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-gray-700 dark:text-light-slate max-w-3xl">
            I study how large language models work by implementing the core ideas from scratch.
          </p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-lightest-slate border border-gray-300 dark:border-slate/60 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow duration-300"
          >
            View on GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-slate/60 mt-2"></div>
      <div className="pt-2"></div>

      <div className="space-y-4">
        {llmParts.map((part) => (
          <details
            key={part.id}
            className="group rounded-2xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-6 shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-lightest-slate">
                  {part.title}
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-light-slate">
                  {part.summary}
                </p>
              </div>
              <span className="mt-1 text-gray-500 dark:text-slate group-open:rotate-180 transition-transform duration-300">
                <i className="fas fa-chevron-down"></i>
              </span>
            </summary>
            {part.subparts.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {part.subparts.map((subpart) => (
                <button
                  key={subpart.title}
                  onClick={() => updateHash(part.id, subpart.id)}
                  className="text-left rounded-xl border border-gray-200/70 dark:border-slate/50 bg-gray-50/80 dark:bg-navy/40 p-4 hover:shadow-md transition-shadow duration-300"
                >
                    <h4 className="text-base font-semibold text-gray-900 dark:text-lightest-slate">
                      {subpart.title}
                    </h4>
                    <p className="mt-2 text-sm text-gray-700 dark:text-light-slate">
                      {subpart.description}
                    </p>
                    <p className="mt-3 text-xs font-mono text-gray-500 dark:text-slate">
                      Open subcontent
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500 dark:text-slate">
                Subtopics coming soon.
              </p>
            )}
          </details>
        ))}
      </div>
    </div>
  );
};
