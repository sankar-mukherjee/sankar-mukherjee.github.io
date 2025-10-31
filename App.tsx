import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { About } from './components/About';
import { Blog } from './components/Blog';
import { Page } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.About);

  const renderPage = () => {
    switch (activePage) {
      case Page.Blog:
        return <Blog />;
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
          {renderPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;