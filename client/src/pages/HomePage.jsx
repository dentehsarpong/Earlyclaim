import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, Plane, ShieldCheck, ChevronDown, RefreshCw } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryBar from '../components/CategoryBar';
import PillTabs from '../components/PillTabs';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useCurrency } from '../context/CurrencyContext';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All Categories');
  const [activeTab, setActiveTab] = useState('Picks for You');
  const [sortOption, setSortOption] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [originCountry, setOriginCountry] = useState(searchParams.get('origin') || 'All');

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== 'All Categories' && activeCategory !== 'All') {
      params.append('category', activeCategory);
    }
    if (activeTab && activeTab !== 'Picks for You') {
      params.append('tag', activeTab);
    }
    if (originCountry && originCountry !== 'All') {
      params.append('shipFromCountry', originCountry);
    }
    const q = searchParams.get('search');
    if (q) {
      params.append('search', q);
      setSearchQuery(q);
    }

    if (sortOption === 'price_asc') params.append('sort', 'price_asc');
    else if (sortOption === 'price_desc') params.append('sort', 'price_desc');
    else if (sortOption === 'rating') params.append('sort', 'rating');

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, [activeCategory, activeTab, sortOption, originCountry, searchParams]);

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setVisibleCount(15);
    if (cat === 'All Categories' || cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setVisibleCount(15);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] transition-colors">
      {/* Category Horizontal Bar with Mega Menu */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Main Content Area */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pill-Style Tabs */}
        <PillTabs activeTab={activeTab} onSelectTab={handleSelectTab} />

        {/* Toolbar: Category header, Active filters & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight uppercase">
                {activeCategory}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                {products.length} Items Available
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pay 50% deposit now • Air freight to Ghana with zero customs hassle
            </p>
          </div>

          {/* Search Query indicator */}
          {searchQuery && (
            <div className="flex items-center gap-2 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full">
              <span>Search: <strong className="text-black dark:text-white">"{searchQuery}"</strong></span>
              <button onClick={clearSearch} className="text-zinc-400 hover:text-black dark:hover:text-white font-bold ml-1">✕</button>
            </div>
          )}

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Origin Country Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Origin:</span>
              <div className="relative">
                <select
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 pr-7 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                >
                  <option value="All">All Origins</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="IT">🇮🇹 Italy</option>
                </select>
                <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Sort:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid: 5 columns on desktop, 2 on mobile */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-black dark:text-white animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Loading Luxury Pre-Orders...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 mx-auto flex items-center justify-center text-zinc-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-black dark:text-white">No items found matching your criteria</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Looking for a custom designer sneaker, watch or clothing item not currently listed? Use our Paste & Buy agent!
            </p>
            <Link
              to="/paste-and-buy"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider"
            >
              Paste External Link →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 pt-6">
              {products.slice(0, visibleCount).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < products.length && (
              <div className="text-center pt-12 pb-6">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition active:scale-95 shadow-sm"
                >
                  Load More Items ({products.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* Shopping Agent "Paste & Buy" Callout Banner */}
        <section className="mt-16 rounded-3xl bg-black text-white border border-zinc-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Zero Limits Procurement</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                HAVE A LINK FROM TAOBAO, NIKE, STOCKX OR ZARA?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                Paste any external product link into EarlyClaim. Our international shopping agents in London and Guangzhou will procure, inspect, pack, and air freight it directly to your doorstep in Ghana.
              </p>
              <div className="pt-2">
                <Link
                  to="/paste-and-buy"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition shadow-lg"
                >
                  <span>Submit Link to Agent</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                How It Works in 4 Steps:
              </h4>
              <ul className="text-xs space-y-2.5 text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Paste product URL & specify size/color</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Receive transparent quote in GHS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Pay 50% deposit via MoMo or card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span>Receive package in 10–21 business days</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
