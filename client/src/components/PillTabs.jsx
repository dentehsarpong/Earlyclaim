import React from 'react';

const TABS = [
  'Picks for You',
  'Best Selection',
  "Men's Zone",
  'Hype Street',
  'Fashion Jewelry',
  'Casual Sporty Style',
  'New Arrivals',
];

export default function PillTabs({ activeTab, onSelectTab }) {
  return (
    <div className="w-full py-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-100 ring-2 ring-black dark:ring-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
