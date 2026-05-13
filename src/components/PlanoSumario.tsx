import React from 'react';

interface SummaryItem {
  id: string;
  label: string;
  target: string;
}

interface PlanoSumarioProps {
  items: SummaryItem[];
}

export function PlanoSumario({ items }: PlanoSumarioProps) {
  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white shadow rounded-lg p-4 lg:sticky lg:top-4">
      <h2 className="text-base font-medium text-gray-900 mb-4">Sumário</h2>
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.target)}
            className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}