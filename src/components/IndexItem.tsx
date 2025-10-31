
import React, { useState } from 'react';
import { IndexEntry } from '../types.ts';

interface IndexItemProps {
  entry: IndexEntry;
  onSelectTopic: (id: string) => void;
  level: number;
  activeId: string | null;
}

export const IndexItem: React.FC<IndexItemProps> = ({ entry, onSelectTopic, level, activeId }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Auto-expand all levels

  const hasChildren = entry.children && entry.children.length > 0;
  const hasContent = !!entry.content;
  const isActive = entry.id === activeId;

  const handleToggleExpand = () => {
    // If it has children, toggle expand.
    // If it has ONLY content (not children), select it.
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (hasContent) {
      onSelectTopic(entry.id);
    }
  };

  const handleSelectTopic = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent the toggle handler from firing
      onSelectTopic(entry.id);
  };

  return (
    <div
      style={{ marginLeft: level > 0 ? '1rem' : '0' }}
    >
      <div
        onClick={handleToggleExpand}
        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200
          ${hasContent ? 'hover:bg-gray-200/50 dark:hover:bg-lightest-navy/50' : ''}
          ${isActive ? 'bg-gray-200 dark:bg-lightest-navy' : ''}
        `}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggleExpand()}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <span className="font-mono text-gray-600 dark:text-slate w-6 text-center flex-shrink-0">
          {hasChildren ? (isExpanded ? '−' : '+') : ''}
        </span>
        
        <span className="font-mono text-gray-500 dark:text-slate mr-3">
          {entry.id.replace(/-/g, '.')}
        </span>

        <span
          onClick={hasContent ? handleSelectTopic : undefined}
          className={`flex-grow ${isActive ? 'text-black dark:text-white' : 'text-gray-800 dark:text-light-slate'} ${hasContent ? '' : 'cursor-default'}`}
        >
          {entry.title}
        </span>
      </div>
      
      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {hasChildren && (
            <div className="pt-1 flex flex-col">
              {entry.children?.map(child => (
                <IndexItem
                  key={child.id}
                  entry={child}
                  onSelectTopic={onSelectTopic}
                  level={level + 1}
                  activeId={activeId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};