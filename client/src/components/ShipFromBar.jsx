/**
 * ShipFromBar — slim bar above/inside the announcement bar showing source countries.
 * Uses SVG flag data URIs so there's no dependency on flag-icons package.
 * Responsive: compact on mobile, full on desktop.
 */
import React from 'react';

// Inline SVG flags as data URIs for the four ship-from countries
// Using simple, recognizable flag designs
const FLAGS = {
  US: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="w-5 h-3.5 rounded-sm flex-shrink-0 overflow-hidden" aria-hidden="true">
      <rect width="60" height="40" fill="#B22234"/>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} y={i*6+3} x="0" width="60" height="3" fill="white"/>
      ))}
      <rect width="24" height="21" fill="#3C3B6E"/>
      {/* Stars simplified */}
      {[0,1,2,3,4].map(r =>
        [0,1,2,3,4].map(c => (
          <circle key={`${r}-${c}`} cx={2.4+c*4.8} cy={2.1+r*4.2} r="1" fill="white"/>
        ))
      )}
    </svg>
  ),
  GB: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="w-5 h-3.5 rounded-sm flex-shrink-0 overflow-hidden" aria-hidden="true">
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="white" strokeWidth="8"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4"/>
      <rect x="24" y="0" width="12" height="40" fill="white"/>
      <rect x="0" y="14" width="60" height="12" fill="white"/>
      <rect x="26" y="0" width="8" height="40" fill="#C8102E"/>
      <rect x="0" y="16" width="60" height="8" fill="#C8102E"/>
    </svg>
  ),
  DE: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="w-5 h-3.5 rounded-sm flex-shrink-0 overflow-hidden" aria-hidden="true">
      <rect width="60" height="14" fill="#000000"/>
      <rect y="13" width="60" height="14" fill="#DD0000"/>
      <rect y="27" width="60" height="13" fill="#FFCE00"/>
    </svg>
  ),
  IT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="w-5 h-3.5 rounded-sm flex-shrink-0 overflow-hidden" aria-hidden="true">
      <rect width="20" height="40" fill="#009246"/>
      <rect x="20" width="20" height="40" fill="#FFFFFF"/>
      <rect x="40" width="20" height="40" fill="#CE2B37"/>
    </svg>
  )
};

const COUNTRIES = [
  { code: 'US', name: 'United States', shortName: 'USA' },
  { code: 'GB', name: 'United Kingdom', shortName: 'UK' },
  { code: 'DE', name: 'Germany', shortName: 'Germany' },
  { code: 'IT', name: 'Italy', shortName: 'Italy' }
];

export default function ShipFromBar() {
  return (
    <div
      className="bg-zinc-950 border-b border-zinc-800/60 py-1.5 px-4"
      role="region"
      aria-label="Ship-from countries"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between gap-2 flex-wrap">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block flex-shrink-0">
          We ship from:
        </span>
        <div className="flex items-center gap-4 sm:gap-5">
          {COUNTRIES.map(c => (
            <div
              key={c.code}
              className="flex items-center gap-1.5"
              title={c.name}
            >
              {FLAGS[c.code]}
              <span className="text-[10px] text-zinc-400 font-medium hidden sm:block">{c.name}</span>
              <span className="text-[10px] text-zinc-400 font-medium sm:hidden">{c.shortName}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-zinc-600 hidden sm:block flex-shrink-0">
          Delivery to Ghana
        </span>
      </div>
    </div>
  );
}
