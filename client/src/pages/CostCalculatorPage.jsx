import React, { useState } from 'react';
import { Calculator, Plane, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORY_WEIGHTS = {
  Sneakers: { weight: 1.6, ratePerKg: 180 },
  Watches: { weight: 0.8, ratePerKg: 250 }, // high insurance
  'Designer Brands': { weight: 1.2, ratePerKg: 200 },
  Jeans: { weight: 0.9, ratePerKg: 160 },
  Perfumes: { weight: 0.6, ratePerKg: 190 },
  Jewelry: { weight: 0.4, ratePerKg: 280 },
  Bags: { weight: 1.5, ratePerKg: 200 },
  Accessories: { weight: 0.5, ratePerKg: 160 },
  Slides: { weight: 0.8, ratePerKg: 160 },
  Caps: { weight: 0.3, ratePerKg: 160 },
  Belts: { weight: 0.4, ratePerKg: 160 },
};

export default function CostCalculatorPage() {
  const { formatPrice, rate } = useCurrency();

  const [category, setCategory] = useState('Sneakers');
  const [itemPriceUSD, setItemPriceUSD] = useState(200);
  const [customWeight, setCustomWeight] = useState(1.6);

  const catData = CATEGORY_WEIGHTS[category] || { weight: 1.0, ratePerKg: 180 };
  const effectiveWeight = customWeight > 0 ? customWeight : catData.weight;

  const itemGHS = Math.round(itemPriceUSD * rate);
  const airFreightGHS = Math.round(effectiveWeight * catData.ratePerKg);
  const customsDutyGHS = Math.round(itemGHS * 0.08); // 8% import handling & clearance
  const totalCostGHS = itemGHS + airFreightGHS + customsDutyGHS;
  const deposit50GHS = Math.round(totalCostGHS * 0.50);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    if (CATEGORY_WEIGHTS[val]) {
      setCustomWeight(CATEGORY_WEIGHTS[val].weight);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm">
            <Calculator className="w-3.5 h-3.5" />
            <span>Official Freight Estimator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
            Ghana Air Freight Calculator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Calculate accurate shipping, insurance, Ghana customs clearance, and 50% pre-order deposit for any item you wish to import.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Controls (6 Cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
              1. Item Specifications
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                Item Category
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              >
                {Object.keys(CATEGORY_WEIGHTS).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                Item Retail Price ($ USD)
              </label>
              <input
                type="number"
                min="10"
                max="50000"
                value={itemPriceUSD}
                onChange={(e) => setItemPriceUSD(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-mono"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Current rate: 1 USD ≈ GH₵{rate.toFixed(2)}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Estimated Weight (kg)
                </label>
                <span className="text-xs font-mono font-bold text-black dark:text-white">{customWeight} kg</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="10.0"
                step="0.1"
                value={customWeight}
                onChange={(e) => setCustomWeight(parseFloat(e.target.value))}
                className="w-full accent-black dark:accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>0.2 kg (Jewelry/Cap)</span>
                <span>5.0 kg (Boots)</span>
                <span>10 kg (Luggage)</span>
              </div>
            </div>
          </div>

          {/* Breakdown Results (6 Cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
                2. Landed Cost in Ghana
              </h3>

              <div className="space-y-3 pt-3 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Item Cost:</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(itemGHS)} (${itemPriceUSD})</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Air Freight ({customWeight} kg):</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(airFreightGHS)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Ghana Customs Handling & Tax:</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(customsDutyGHS)}</span>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm text-black dark:text-white">
                  <span>Total Landed Price in Ghana:</span>
                  <span className="text-xl font-black">{formatPrice(totalCostGHS)}</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Required 50% Pre-Order Deposit</span>
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">
                    {formatPrice(deposit50GHS)}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Remaining {formatPrice(totalCostGHS - deposit50GHS)} paid when package lands in Accra.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Link
                to="/paste-and-buy"
                className="w-full py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Pre-Order With This Estimate</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
