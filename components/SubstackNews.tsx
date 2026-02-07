import React, { useEffect, useMemo, useState } from 'react';

type NewsItem = {
  title: string;
  link: string;
  date: string;
  snippet: string;
  imageUrl: string;
};

const FEED_URL = 'https://sankar1535.substack.com/feed';
const LOCAL_JSON_URL = '/substack.json';

export const SubstackNews: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(LOCAL_JSON_URL, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Local feed cache missing');
        }
        const data = await res.json();
        if (isMounted) setItems((data.items || []).slice(0, 3));
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load the latest posts right now.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (isLoading) {
      return <p className="text-gray-600 dark:text-slate">Loading latest posts...</p>;
    }

    if (error) {
      return (
        <div className="text-gray-600 dark:text-slate space-y-3">
          <p>{error}</p>
          <a
            href={FEED_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-lightest-slate hover:underline"
          >
            Visit Substack
          </a>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {items.map((item) => (
          <article
            key={item.link}
            className="rounded-2xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="space-y-3">
              <p className="text-xs font-mono text-gray-500 dark:text-slate">
                {item.date ? new Date(item.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : 'Recent'}
              </p>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="block text-xl md:text-2xl font-semibold text-gray-900 dark:text-lightest-slate hover:underline"
              >
                {item.title}
              </a>
              {item.snippet ? (
                <p className="text-sm text-gray-700 dark:text-light-slate">
                  {item.snippet}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    );
  }, [error, isLoading, items]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate font-sans">
            News & Notes
          </h2>
          <p className="text-gray-700 dark:text-light-slate">
            Latest snippets from my Substack.
          </p>
        </div>
        <a
          href="https://sankar1535.substack.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-lightest-slate hover:underline"
        >
          View all posts
        </a>
      </div>
      {content}
    </section>
  );
};
