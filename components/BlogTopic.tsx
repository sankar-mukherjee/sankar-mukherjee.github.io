import React, { useState, useEffect } from 'react';
import { IndexEntry } from '../types';

// Declare `marked` on the window object since it's loaded from a CDN script
declare global {
  interface Window {
    marked: {
      parse: (markdown: string) => string;
    };
  }
}

interface BlogTopicProps {
  selectedTopic: IndexEntry;
  onBack: () => void;
}

const parseFrontMatter = (markdown: string): { title: string | null; content: string } => {
  const frontMatterRegex = /^\s*---\s*([\s\S]*?)\s*---/;
  const match = frontMatterRegex.exec(markdown);
  
  if (!match) {
    return { title: null, content: markdown };
  }
  
  const frontMatterBlock = match[1];
  const content = markdown.substring(match[0].length).trim();
  
  const titleMatch = /^\s*title:\s*(.*)/m.exec(frontMatterBlock);
  const title = titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : null;

  return { title, content };
};

export const BlogTopic: React.FC<BlogTopicProps> = ({ selectedTopic, onBack }) => {
  const [postContent, setPostContent] = useState<string>('');
  const [postTitle, setPostTitle] = useState<string>(selectedTopic.title);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTopic.content) {
      setIsLoading(true);
      setError(null);
      setPostContent('');
      setPostTitle(selectedTopic.title); // Reset to index title initially

      fetch(selectedTopic.content)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          if (window.marked) {
            const { title: fmTitle, content: mdContent } = parseFrontMatter(text);
            if (fmTitle) {
              setPostTitle(fmTitle);
            }
            const html = window.marked.parse(mdContent);
            setPostContent(html);
          } else {
            throw new Error('Markdown parser (marked.js) is not loaded.');
          }
        })
        .catch(err => {
          console.error("Failed to fetch or parse blog post:", err);
          setError('Failed to load blog post content. Please try again later.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setPostContent('');
        setError(null);
        setIsLoading(false);
    }
  }, [selectedTopic.content, selectedTopic.id, selectedTopic.title]);


  return (
    <div className="fade-in">
       <button
        onClick={onBack}
        className="text-sm font-mono text-black dark:text-white mb-8 hover:underline"
      >
        &larr; Back to Index
      </button>

      <main>
        <article className="prose dark:prose-invert max-w-none">
            <h1>
            {postTitle}
            </h1>
            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
              <div dangerouslySetInnerHTML={{ __html: postContent }} />
            )}
        </article>
      </main>
    </div>
  );
};