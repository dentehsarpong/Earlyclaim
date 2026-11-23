import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalGHS,
    totalUSD,
    depositMode,
    setDepositMode,
    amountDueGHS,
    remainingBalanceGHS,
    amountDueUSD,
    remainingBalanceUSD
  } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] py-20">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 mx-auto flex items-center justify-center text-zinc-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
            Your Pre-Order Cart is Empty
          </h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Browse our sneakers, watches, designer outerwear, and accessories to claim your allocation before it sells out.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90"
            >
              <span>Explore Drops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white">
              Pre-Order Cart
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review items before reserving your international allocation
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:underline font-semibold"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Cart Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}-${idx}`}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={item.product.selectedImage || item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {item.product.brand}
                    </span>
                    <h4 className="font-bold text-sm text-black dark:text-white line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Size: <span className="font-semibold text-black dark:text-white">{item.size}</span> | Color: <span className="font-semibold text-black dark:text-white">{item.color}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Delivery: ~{item.product.estimatedDays || '10–18 business days'} to Ghana
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  {/* Quantity */}
                  <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-2.5 py-1">
                    <button
                      onClick={() => updateQuantity(idx, -1)}
                      className="text-zinc-500 hover:text-black dark:hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, 1)}
                      className="text-zinc-500 hover:text-black dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-black text-black dark:text-white">
                      {formatPrice(item.product.priceGHS * item.quantity, item.product.priceUSD * item.quantity)}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      50% dep: {formatPrice(Math.round(item.product.priceGHS * item.quantity * 0.5))}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-zinc-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Checkout Breakdown Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
                Pre-Order Summary
              </h3>

              {/* Deposit Plan Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block mb-2">
                  Select Deposit Plan:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDepositMode('deposit_50')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      depositMode === 'deposit_50'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <p className="font-bold">50% Deposit</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Pay half now</p>
                  </button>

                  <button
                    onClick={() => setDepositMode('full')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      depositMode === 'full'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <p className="font-bold">Full 100%</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Priority dispatch</p>
                  </button>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal Value:</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(totalGHS, totalUSD)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping Options:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Air (~2–3w) or Sea (~6–8w)</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Ghana Customs Handling:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">CLEARED</span>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm text-black dark:text-white">
                  <span>Due Today:</span>
                  <span className="text-lg font-black">{formatPrice(amountDueGHS, amountDueUSD)}</span>
                </div>

                {depositMode === 'deposit_50' && (
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Balance due upon arrival in Ghana:</span>
                    <span className="font-semibold">{formatPrice(remainingBalanceGHS, remainingBalanceUSD)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition shadow-xl flex items-center justify-center gap-2 mt-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-2 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>MTN Mobile Money • Telecel Cash • Visa / Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
