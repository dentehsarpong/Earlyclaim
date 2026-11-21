/**
 * ShipFromBadge — small inline badge for product pages showing origin country + flag.
 */
import React from 'react';

const FLAG_SVGS = {
  US: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" aria-hidden="true">
      <rect width="60" height="40" fill="#B22234"/>
      {[0,1,2,3,4,5].map(i => <rect key={i} y={i*6+3} x="0" width="60" height="3" fill="white"/>)}
      <rect width="24" height="21" fill="#3C3B6E"/>
      {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => <circle key={`${r}-${c}`} cx={2.4+c*4.8} cy={2.1+r*4.2} r="1" fill="white"/>))}
    </svg>
  ),
  GB: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" aria-hidden="true">
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" aria-hidden="true">
      <rect width="60" height="14" fill="#000000"/>
      <rect y="13" width="60" height="14" fill="#DD0000"/>
      <rect y="27" width="60" height="13" fill="#FFCE00"/>
    </svg>
  ),
  IT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" aria-hidden="true">
      <rect width="20" height="40" fill="#009246"/>
      <rect x="20" width="20" height="40" fill="#FFFFFF"/>
      <rect x="40" width="20" height="40" fill="#CE2B37"/>
    </svg>
  )
};

const COUNTRY_NAMES = {
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  IT: 'Italy',
  JP: 'Japan',
  FR: 'France',
  CN: 'China'
};

export default function ShipFromBadge({ countryCode, className = '' }) {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  const name = COUNTRY_NAMES[code] || code;
  const flag = FLAG_SVGS[code];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 ${className}`}
      title={`Ships from ${name}`}
    >
      {flag && (
        <span className="w-4 h-3 overflow-hidden rounded-sm flex-shrink-0 inline-flex">
          {flag}
        </span>
      )}
      <span>Ships from {name}</span>
    </span>
  );
}
