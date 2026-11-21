/**
 * ShippingMethodSelector — presented at checkout to let the buyer choose
 * Air Freight (~2–3 weeks) or Sea Freight (~6–8 weeks).
 *
 * Props:
 *   method: 'air' | 'sea'
 *   onChange: (method) => void
 *   shippingCostGHS: number  (calculated upstream)
 *   rates: { air: {...}, sea: {...} }
 */
import React from 'react';
import { Plane, Ship } from 'lucide-react';

export default function ShippingMethodSelector({ method, onChange, rates = {} }) {
  const airRate = rates.air || {};
  const seaRate = rates.sea || {};

  const options = [
    {
      key: 'air',
      label: 'Air Freight',
      estimate: airRate.estimateWeeks || '2–3 weeks',
      description: 'Your items travel by air cargo. Faster, ideal for most orders.',
      costNote: `From GH₵${airRate.minimumGHS || 150}`,
      Icon: Plane
    },
    {
      key: 'sea',
      label: 'Sea Freight',
      estimate: seaRate.estimateWeeks || '6–8 weeks',
      description: 'Your items travel by sea vessel. Lower cost, longer lead time.',
      costNote: `From GH₵${seaRate.minimumGHS || 300}`,
      Icon: Ship
    }
  ];

  return (
    <fieldset>
      <legend className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
        Shipping Method
      </legend>
      <div className="space-y-2">
        {options.map(({ key, label, estimate, description, costNote, Icon }) => (
          <label
            key={key}
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
              method === key
                ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 ring-1 ring-black dark:ring-white'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
          >
            <input
              type="radio"
              name="shippingMethod"
              value={key}
              checked={method === key}
              onChange={() => onChange(key)}
              className="sr-only"
            />
            <Icon className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-black dark:text-white">{label}</span>
                <span className="text-[11px] text-zinc-500">{costNote}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{description}</p>
              <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1">
                Est. delivery: {estimate}
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              method === key ? 'border-black dark:border-white' : 'border-zinc-300 dark:border-zinc-600'
            }`}>
              {method === key && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
