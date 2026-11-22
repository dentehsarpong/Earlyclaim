import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Clock } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ShipFromBadge from './ShipFromBadge';

export default function ProductCard({ product, onQuickView }) {
  const { formatPrice } = useCurrency();
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    return user && user.wishlist ? user.wishlist.includes(product.id) : false;
  });

  const handleWishlist = async (e) => {
    e.stopPropagation();
    const result = await toggleWishlist(product.id);
    setIsLiked(result);
  };

  const handleQuickPreorder = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || 'Standard', product.colors?.[0] || 'Default', 1);
  };

  const depositGHS = Math.round(product.priceGHS * 0.50);
  const depositUSD = Math.round(product.priceUSD * 0.50);

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 sm:p-3 flex flex-col justify-between hover:shadow-xl hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer"
    >
      {/* Top Badges & Wishlist */}
      <div className="relative">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
            PRE-ORDER
          </span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[9px] font-bold border border-zinc-300 dark:border-zinc-700">
            50% DEPOSIT
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLiked
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-700'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* White-background Luxury Product Image */}
        <div className="w-full aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden p-2 relative">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Hover Overlay Button (Desktop) */}
          <div
            className={`absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-200 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={handleQuickPreorder}
              className="flex-1 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pre-order</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 transition"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 space-y-1.5 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="uppercase tracking-wider truncate font-semibold">{product.brand}</span>
            <div className="flex items-center gap-0.5 text-zinc-700 dark:text-zinc-300">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-bold text-[10px]">{product.rating}</span>
            </div>
          </div>

          {/* 2-line truncated Title */}
          <h3
            className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:underline pt-0.5"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.shipFromCountry && (
            <div className="pt-1">
              <ShipFromBadge countryCode={product.shipFromCountry} className="!text-[9px] !py-0.5 !px-2" />
            </div>
          )}
        </div>

        {/* Pricing & Deposit Section */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm sm:text-base font-black text-black dark:text-white tracking-tight">
                {formatPrice(product.priceGHS, product.priceUSD)}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium">
                Deposit now: <span className="font-bold text-black dark:text-zinc-200">{formatPrice(depositGHS, depositUSD)}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{product.estimatedDays || '10–18d'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
