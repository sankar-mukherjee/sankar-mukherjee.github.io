import React, { useState } from 'react';
import { Page } from '../types';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = (page: Page) =>
    `cursor-pointer px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
      activePage === page
        ? 'text-black dark:text-white'
        : 'text-gray-600 dark:text-slate hover:text-black dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-navy/80 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-lightest-slate font-mono">Sankar Mukherjee</h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a onClick={() => setActivePage(Page.About)} className={navLinkClasses(Page.About)}>
                  About
                </a>
                <a
                  onClick={() => {
                    if (window.location.hash.startsWith('#/llms')) {
                      history.pushState('', document.title, window.location.pathname + window.location.search);
                      window.dispatchEvent(new HashChangeEvent('hashchange'));
                    }
                    setActivePage(Page.LLMs);
                  }}
                  className={navLinkClasses(Page.LLMs)}
                >
                  LLMs From Scratch
                </a>
                <a onClick={() => setActivePage(Page.MLCode)} className={navLinkClasses(Page.MLCode)}>
                  ML Code
                </a>
                <a onClick={() => setActivePage(Page.Projects)} className={navLinkClasses(Page.Projects)}>
                  Projects
                </a>
                <a onClick={() => setActivePage(Page.Blog)} className={navLinkClasses(Page.Blog)}>
                  Blog
                </a>
              </div>
            </nav>
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              className="md:hidden ml-4 text-gray-600 dark:text-slate hover:text-black dark:hover:text-white transition-colors duration-300"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-6 text-gray-600 dark:text-slate hover:text-black dark:hover:text-white transition-colors duration-300"
            >
              {theme === 'light' ? (
                <i className="fas fa-moon text-xl"></i>
              ) : (
                <i className="fas fa-sun text-xl"></i>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen ? (
        <div className="md:hidden border-t border-gray-200 dark:border-slate/60">
          <div className="px-4 py-3 flex flex-col gap-2">
            <a
              onClick={() => {
                setActivePage(Page.About);
                setIsMenuOpen(false);
              }}
              className={navLinkClasses(Page.About)}
            >
              About
            </a>
            <a
              onClick={() => {
                if (window.location.hash.startsWith('#/llms')) {
                  history.pushState('', document.title, window.location.pathname + window.location.search);
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
                setActivePage(Page.LLMs);
                setIsMenuOpen(false);
              }}
              className={navLinkClasses(Page.LLMs)}
            >
              LLMs From Scratch
            </a>
            <a
              onClick={() => {
                setActivePage(Page.MLCode);
                setIsMenuOpen(false);
              }}
              className={navLinkClasses(Page.MLCode)}
            >
              ML Code
            </a>
            <a
              onClick={() => {
                setActivePage(Page.Projects);
                setIsMenuOpen(false);
              }}
              className={navLinkClasses(Page.Projects)}
            >
              Projects
            </a>
            <a
              onClick={() => {
                setActivePage(Page.Blog);
                setIsMenuOpen(false);
              }}
              className={navLinkClasses(Page.Blog)}
            >
              Blog
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
};
