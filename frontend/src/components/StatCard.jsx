// src/components/StatCard.jsx
import React from 'react';

export default function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center bg-white px-4 py-2 rounded-lg shadow-sm border">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
