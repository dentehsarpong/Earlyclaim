import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Star, ShieldCheck, Plane, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageHelper';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { formatPrice } = useCurrency();
  const { addToCart, setDepositMode } = useCart();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Default');
  const [depositChoice, setDepositChoice] = useState('deposit_50'); // 'deposit_50' | 'full'
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'];

  const depositRate = depositChoice === 'deposit_50' ? 0.50 : 1.0;
  const payNowGHS = Math.round(product.priceGHS * depositRate * qty);
  const payNowUSD = Math.round(product.priceUSD * depositRate * qty);
  const remainingGHS = Math.round(product.priceGHS * (1 - depositRate) * qty);
  const remainingUSD = Math.round(product.priceUSD * (1 - depositRate) * qty);

  const handleAddToCart = () => {
    setDepositMode(depositChoice);
    addToCart(product, selectedSize, selectedColor, qty);
    onClose();
  };

  const handlePreorderNow = () => {
    setDepositMode(depositChoice);
    addToCart(product, selectedSize, selectedColor, qty);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col overscroll-behavior-contain">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                <img
                  src={getImageUrl(images[selectedImg])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                        selectedImg === i ? 'border-black dark:border-white' : 'border-zinc-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Features */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
                  <span className="font-semibold text-black dark:text-white">100% Authenticity Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-black dark:text-white" />
                  <span>Direct Air Cargo to Accra (Est: {product.estimatedDays})</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Selectors */}
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {product.brand} • {product.category}
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight leading-snug mt-1">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-black dark:text-white">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-zinc-500">
                    {product.rating} ({product.reviewsCount} reviews)
                  </span>
                </div>
              </div>

              {/* Price & Deposit Options */}
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase font-bold text-zinc-500">Total Price</span>
                  <span className="text-xl font-black text-black dark:text-white">
                    {formatPrice(product.priceGHS, product.priceUSD)}
                  </span>
                </div>

                {/* Pre-Order Deposit Toggle */}
                <div>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Select Payment Plan:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDepositChoice('deposit_50')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        depositChoice === 'deposit_50'
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <p className="font-bold">50% Deposit</p>
                      <p className="text-[10px] opacity-80">Pay half now, rest on arrival</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositChoice('full')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        depositChoice === 'full'
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <p className="font-bold">Full Payment</p>
                      <p className="text-[10px] opacity-80">100% upfront (Priority dispatch)</p>
                    </button>
                  </div>
                </div>

                {/* Pay Breakdown */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs flex justify-between">
                  <span className="font-medium text-zinc-500">Pay Today:</span>
                  <span className="font-black text-black dark:text-white text-sm">
                    {formatPrice(payNowGHS, payNowUSD)}
                  </span>
                </div>
                {depositChoice === 'deposit_50' && (
                  <div className="text-[11px] flex justify-between text-zinc-400">
                    <span>Due on arrival in Accra:</span>
                    <span className="font-semibold">{formatPrice(remainingGHS, remainingUSD)}</span>
                  </div>
                )}
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Size: <span className="text-black dark:text-white">{selectedSize}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          selectedSize === s
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-black'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-2">
                    Color: <span className="text-black dark:text-white">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          selectedColor === c
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="py-3 px-4 rounded-full border-2 border-black dark:border-white text-black dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handlePreorderNow}
                    className="py-3 px-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Pre-Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="block text-center text-xs text-zinc-400 hover:text-black dark:hover:text-white underline pt-1"
                >
                  View full product specifications & reviews →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
