import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';

const POST_SLUG = 'autoregressive-token-generation-why-streaming-latency-scales-with-tokens-per-second';
const POST_URL = '/content/blog-post.md';

const getCurrentBlogSlug = (): string | null => {
  const hash = window.location.hash || '';
  const match = hash.match(/^#\/blog\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const Blog: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState<string | null>(() => getCurrentBlogSlug());
  const [postMarkdown, setPostMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setActiveSlug(getCurrentBlogSlug());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(POST_URL);
        if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
        const text = await res.text();
        setPostMarkdown(text);
      } catch {
        setError('Could not load blog post.');
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, []);

  const post = useMemo(() => {
    const lines = postMarkdown.split('\n');
    const title = (lines.find((line) => line.startsWith('# ')) || '# Blog Post').replace(/^#\s+/, '').trim();
    const dateLine = lines.find((line) => /^\*.*\*$/.test(line.trim())) || '*Unknown date*';
    const date = dateLine.replace(/^\*|\*$/g, '').trim();

    const contentWithoutHeader = postMarkdown
      .replace(/^# .*\n+/, '')
      .replace(/^\*.*\*\n+/, '');

    const excerptMatch = contentWithoutHeader.match(/([^\n].*?)(\n\s*\n|$)/s);
    const excerpt = excerptMatch ? excerptMatch[1].replace(/\s+/g, ' ').trim() : '';
    const html = marked.parse(contentWithoutHeader);

    return {
      slug: POST_SLUG,
      title,
      date,
      excerpt,
      html,
    };
  }, [postMarkdown]);

  if (isLoading) {
    return <div className="fade-in"><p>Loading blog post...</p></div>;
  }

  if (error) {
    return <div className="fade-in"><p className="text-red-500">{error}</p></div>;
  }

  const isDetailPage = activeSlug === post.slug;

  if (isDetailPage) {
    return (
      <div className="fade-in space-y-4">
        <button
          onClick={() => {
            window.location.hash = '#/blog';
          }}
          className="text-sm font-mono text-black dark:text-white hover:underline"
        >
          &larr; Back to Blog
        </button>
        <article className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 dark:text-slate">{post.date}</p>
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate font-sans">
        Blog
      </h2>

      <article className="rounded-xl bg-[#0b0f16] px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-xl text-slate">{post.date}</p>
        <button
          onClick={() => {
            window.location.hash = `#/blog/${post.slug}`;
          }}
          className="mt-2 text-left text-2xl font-semibold text-[#40a9e8] hover:underline"
        >
          {post.title}
        </button>
        <p className="mt-3 text-white text-[15px] leading-relaxed">{post.excerpt}</p>
      </article>
    </div>
  );
};
