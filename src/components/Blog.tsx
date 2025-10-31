
import React, { useState, useEffect } from 'react';
import { IndexEntry } from '../types';
import { IndexItem } from './IndexItem';
import { BlogTopic } from './BlogTopic';

// Helper to parse metadata from a filename like "1-1-1.md"
const parseFilename = (filename: string): { id: string } => {
  const id = filename.replace(/\.md$/, '');
  if (!id) throw new Error(`Invalid filename format: ${filename}`);
  return { id };
};

// Helper to parse the 'title' from YAML front matter
const parseFrontMatter = (markdown: string): { title: string | null } => {
  const frontMatterRegex = /^\s*---\s*([\s\S]*?)\s*---/;
  const match = frontMatterRegex.exec(markdown);
  if (!match) return { title: null };
  const titleMatch = /^\s*title:\s*(.*)/m.exec(match[1]);
  const title = titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : null;
  return { title };
};

export const Blog: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [blogIndexData, setBlogIndexData] = useState<IndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndBuildTree = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch manifest of all content files
        const manifestResponse = await fetch('/content/manifest.json');
        if (!manifestResponse.ok) throw new Error('Failed to load blog manifest.');
        const filenames: string[] = await manifestResponse.json();

        // 2. Fetch each markdown file to read its front matter for the title
        const fileDataPromises = filenames.map(async (filename) => {
          const res = await fetch(`/content/${filename}`);
          if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
          const text = await res.text();
          const { title } = parseFrontMatter(text);
          const { id } = parseFilename(filename);
          if (!title) throw new Error(`Missing title in front matter for ${filename}`);
          
          return {
            id,
            title,
            content: `/content/${filename}`,
          };
        });
        const flatBlogData = await Promise.all(fileDataPromises);

        // 3. Build the nested tree structure from the flat list of files
        const nodeMap = new Map<string, IndexEntry>();
        flatBlogData.forEach(item => {
          nodeMap.set(item.id, { ...item, children: [] });
        });

        const tree: IndexEntry[] = [];
        flatBlogData.forEach(item => {
          const lastDashIndex = item.id.lastIndexOf('-');
          const parentId = lastDashIndex > -1 ? item.id.substring(0, lastDashIndex) : null;
          const currentNode = nodeMap.get(item.id)!;

          if (parentId && nodeMap.has(parentId)) {
            const parentNode = nodeMap.get(parentId)!;
            parentNode.children = parentNode.children || [];
            parentNode.children.push(currentNode);
          } else {
            tree.push(currentNode);
          }
        });
        
        // Sort children by ID to maintain order
        const sortChildren = (nodes: IndexEntry[]) => {
            nodes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
            nodes.forEach(node => {
                if (node.children) sortChildren(node.children);
            });
        };
        sortChildren(tree);

        setBlogIndexData(tree);

      } catch (err) {
        console.error(err);
        setError('Could not load blog content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndBuildTree();
  }, []);

  const findTopic = (nodes: IndexEntry[], id: string): IndexEntry | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findTopic(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedTopic = selectedTopicId ? findTopic(blogIndexData, selectedTopicId) : null;

  if (selectedTopic && selectedTopic.content) {
    return (
      <BlogTopic
        selectedTopic={selectedTopic}
        onBack={() => setSelectedTopicId(null)}
      />
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">Loading blog index...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    return (
      <div className="flex flex-col">
        {blogIndexData.map(entry => (
          <IndexItem 
            key={entry.id} 
            entry={entry} 
            onSelectTopic={setSelectedTopicId} 
            level={0}
            activeId={null} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate mb-8 font-sans">
          Blog & Concepts
      </h2>
      {renderContent()}
    </div>
  );
};
