import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Sparkles, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'All Categories', isSpecial: true },
  { name: 'Sneakers', sub: 'Air Jordan, Yeezy, Nike Dunk, NB 9060' },
  { name: 'Watches', sub: 'Rolex, AP, Cartier, Omega' },
  { name: 'Designer Brands', sub: 'Prada, Balenciaga, Dior, Louis Vuitton' },
  { name: 'Jeans', sub: 'Chrome Hearts, Amiri, Gallery Dept, Purple' },
  { name: 'Perfumes', sub: 'MFK Baccarat, Creed, Tom Ford, Kilian' },
  { name: 'Jewelry', sub: 'Van Cleef, Cartier Love, Moissanite, Tiffany' },
  { name: 'Bags', sub: 'Chanel Flap, Goyard, Bottega, Rimowa' },
  { name: "Men's", sub: 'Streetwear, Outerwear, Footwear' },
  { name: "Women's", sub: 'Luxury Handbags, Jewelry, Fragrances' },
  { name: 'Kids', sub: 'Sneakers, Mini Streetwear' },
  { name: 'Accessories', sub: 'Caps, Sunglasses, Wallets' },
];

export default function CategoryBar({ activeCategory, onSelectCategory }) {
  const scrollRef = useRef(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const megaMenuRef = useRef(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Close mega menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="w-full bg-[#121214] border-b border-zinc-800/80 sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-12 relative">
        {/* "All Categories" Mega Menu Trigger */}
        <div className="relative flex-shrink-0 mr-3" ref={megaMenuRef}>
          <button
            onClick={() => setMegaMenuOpen(!megaMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition border ${
              megaMenuOpen || activeCategory === 'All' || activeCategory === 'All Categories'
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-zinc-900 text-zinc-200 border-zinc-700/80 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          {/* Mega-Menu Dropdown */}
          {megaMenuOpen && (
            <div className="absolute left-0 mt-3 w-[720px] max-w-[90vw] bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    EarlyClaim Pre-Order Directory
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Global Shopping Agent Direct to Ghana
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 text-xs">
                {CATEGORIES.filter(c => !c.isSpecial).map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      onSelectCategory(cat.name);
                      setMegaMenuOpen(false);
                    }}
                    className="group cursor-pointer p-2.5 rounded-xl hover:bg-zinc-900/90 border border-transparent hover:border-zinc-800 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white group-hover:text-zinc-200">
                        {cat.name}
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {cat.sub}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Can't find a specific item or model?</span>
                <button
                  onClick={() => {
                    setMegaMenuOpen(false);
                    window.location.href = '/paste-and-buy';
                  }}
                  className="font-semibold text-white underline hover:text-zinc-300"
                >
                  Use Paste & Buy to request any URL →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-36 z-10 w-7 h-7 rounded-full bg-black/90 text-white border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Categories Row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
        >
          {CATEGORIES.filter(c => !c.isSpecial).map((cat) => {
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="flex-shrink-0 ml-1 w-7 h-7 rounded-full bg-black/90 text-white border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
