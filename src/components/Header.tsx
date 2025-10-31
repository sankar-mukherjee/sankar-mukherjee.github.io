
import React from 'react';
import { Page } from '../types.ts';
import { useTheme } from '../ThemeContext.tsx';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const { theme, toggleTheme } = useTheme();

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
                <a onClick={() => setActivePage(Page.Blog)} className={navLinkClasses(Page.Blog)}>
                  Blog
                </a>
              </div>
            </nav>
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
    </header>
  );
};