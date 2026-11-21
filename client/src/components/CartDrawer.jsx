import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
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

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black dark:text-white" />
              <h3 className="font-black text-sm uppercase tracking-wider text-black dark:text-white">
                Pre-Order Cart ({cartItems.length})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-black dark:text-white">Your Pre-Order Cart is Empty</h4>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  Browse our high-fashion sneakers, watches, and streetwear drops to claim your item before stocks run out.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${idx}`}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex gap-3 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between pr-5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            {item.product.brand}
                          </p>
                        </div>
                        <h5 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {item.product.name}
                        </h5>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Size: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.size}</span> | Color: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.color}</span>
                        </p>
                      </div>

                      {/* Pricing and Qty Controls */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="font-black text-xs text-black dark:text-white">
                          {formatPrice(item.product.priceGHS * item.quantity, item.product.priceUSD * item.quantity)}
                        </span>

                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(idx, -1)}
                            className="text-zinc-400 hover:text-black dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(idx, 1)}
                            className="text-zinc-400 hover:text-black dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-red-500 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Deposit Option Selector */}
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Payment Plan
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setDepositMode('deposit_50')}
                      className={`p-2 rounded-xl text-left border transition ${
                        depositMode === 'deposit_50'
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <p className="font-bold">50% Deposit</p>
                      <p className="text-[9px] opacity-80">Pay ₵ half today</p>
                    </button>
                    <button
                      onClick={() => setDepositMode('full')}
                      className={`p-2 rounded-xl text-left border transition ${
                        depositMode === 'full'
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <p className="font-bold">Full Payment</p>
                      <p className="text-[9px] opacity-80">100% upfront</p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50 dark:bg-zinc-950">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal Value:</span>
                  <span>{formatPrice(totalGHS, totalUSD)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping Options:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Air (~2–3w) or Sea (~6–8w)</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-black dark:text-white pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Due Today ({depositMode === 'deposit_50' ? '50% Deposit' : 'Full'}):</span>
                  <span className="text-base font-black">
                    {formatPrice(amountDueGHS, amountDueUSD)}
                  </span>
                </div>
                {depositMode === 'deposit_50' && (
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Balance upon Accra arrival:</span>
                    <span>{formatPrice(remainingBalanceGHS, remainingBalanceUSD)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>Paystack Encrypted • MTN MoMo, Telecel & Cards</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
