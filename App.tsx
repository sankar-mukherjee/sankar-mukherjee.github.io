import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AskAIWidget } from './components/AskAIWidget';
import { Page } from './types';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

const About = lazy(() =>
  import('./components/About').then((m) => ({ default: m.About }))
);
const Resume = lazy(() =>
  import('./components/Resume').then((m) => ({ default: m.Resume }))
);
const Blog = lazy(() =>
  import('./components/Blog').then((m) => ({ default: m.Blog }))
);
const Projects = lazy(() =>
  import('./components/Projects').then((m) => ({ default: m.Projects }))
);
const LLMsFromScratch = lazy(() =>
  import('./components/LLMsFromScratch').then((m) => ({ default: m.LLMsFromScratch }))
);
const MLCode = lazy(() =>
  import('./components/MLCode').then((m) => ({ default: m.MLCode }))
);
const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.About);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#/resume')) {
        setActivePage(Page.Resume);
      } else if (hash.startsWith('#/blog')) {
        setActivePage(Page.Blog);
      } else if (hash.startsWith('#/projects')) {
        setActivePage(Page.Projects);
      } else if (hash.startsWith('#/mlcode')) {
        setActivePage(Page.MLCode);
      } else if (hash.startsWith('#/llms')) {
        setActivePage(Page.LLMs);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    hljs.highlightAll();
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case Page.Resume:
        return <Resume />;
      case Page.Blog:
        return <Blog />;
      case Page.Projects:
        return <Projects />;
      case Page.LLMs:
        return <LLMsFromScratch />;
      case Page.MLCode:
        return <MLCode />;
      case Page.About:
      default:
        return <About />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-navy text-gray-800 dark:text-light-slate">
      <style>{`
        .fade-in {
          animation: fadeInAnimation 0.5s ease-in-out;
        }
        @keyframes fadeInAnimation {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<p className="text-center">Loading...</p>}>
            {renderPage()}
          </Suspense>
        </div>
      </main>
      <AskAIWidget />
      <Footer />
    </div>
  );
};

export default App;
