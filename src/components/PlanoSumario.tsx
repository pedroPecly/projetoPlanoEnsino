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
    <div className="bg-white shadow rounded-lg p-4 sticky top-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Sumário</h2>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.target)}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}