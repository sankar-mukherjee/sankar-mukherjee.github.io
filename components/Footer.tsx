import React from 'react';

const socialLinks = [
  { icon: 'fa-github', url: 'https://github.com/sankar-mukherjee', name: 'GitHub' },
  { icon: 'fa-linkedin-in', url: 'https://www.linkedin.com/in/sankarmukherjee/', name: 'LinkedIn' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-navy py-6 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-slate">
        <div className="flex justify-center space-x-6 mb-4">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="text-gray-600 dark:text-slate hover:text-black dark:hover:text-white transition-colors duration-300 text-2xl"
            >
              <i className={`fab ${link.icon}`}></i>
            </a>
          ))}
        </div>
        <p className="text-xs font-mono">
          Designed & Built by Sankar Mukherjee using Google AI Studio
        </p>
        <p className="text-xs font-mono mt-1">
          &copy; 2025
        </p>
      </div>
    </footer>
  );
};