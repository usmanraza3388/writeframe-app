// src/components/TabsSwitcher.jsx
import React from 'react';

export default function TabsSwitcher({ active, onChange }) {
  const tabs = ['scenes', 'characters', 'monologues', 'frames'];
  return (
    <div className="flex justify-between gap-2">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1 rounded-full text-sm border ${active === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {t[0].toUpperCase()+t.slice(1)}
        </button>
      ))}
    </div>
  );
}
