import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Plane,
  CreditCard,
  Smartphone,
  Building,
  ArrowRight,
  CheckCircle2,
  Lock,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import { API_BASE_URL } from '../apiConfig';

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'Savannah',
  'North East',
  'Western North'
];

export default function CheckoutPage() {
  const { cartItems, totalGHS, totalUSD, depositMode, amountDueGHS, remainingBalanceGHS, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('Accra');
  const [street, setStreet] = useState('');
  const [gpsAddress, setGpsAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment method
  // 'paystack_momo' | 'paystack_card' | 'manual_momo' | 'manual_bank'
  const [paymentMethod, setPaymentMethod] = useState('paystack_momo');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState('air');
  const [shippingRates, setShippingRates] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders/shipping-rates`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rates) setShippingRates(data.rates);
      })
      .catch(() => {});
  }, []);

  const currentRate = shippingRates[shippingMethod] || {};
  const shippingCostGHS = currentRate.minimumGHS || (shippingMethod === 'sea' ? 300 : 150);
  const effectiveTotalGHS = totalGHS + shippingCostGHS;
  const depositMultiplier = depositMode === 'deposit_50' ? 0.50 : depositMode === 'deposit_70' ? 0.70 : 1.0;
  const computedAmountDueGHS = Math.round(effectiveTotalGHS * depositMultiplier);
  const computedRemainingBalanceGHS = effectiveTotalGHS - computedAmountDueGHS;

  // Manual payment transaction id
  const [manualTxId, setManualTxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      setError('Please provide your full name, phone number, and delivery street address.');
      return;
    }

    if (paymentMethod === 'manual_momo' && !manualTxId.trim()) {
      setError('Please enter your Mobile Money Transaction ID after sending the payment.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: fullName.trim(),
        customerEmail: email.trim() || 'customer@earlyclaim.com',
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          region,
          city,
          street: street.trim(),
          gpsAddress: gpsAddress.trim()
        },
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.selectedImage || item.product.images?.[0],
          size: item.size,
          color: item.color,
          priceGHS: item.product.priceGHS,
          priceUSD: item.product.priceUSD,
          quantity: item.quantity
        })),
        depositType: depositMode,
        paymentMethod,
        shippingMethod,
        notes: notes.trim(),
        manualTransactionId: manualTxId.trim()
      };

      const res = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('earlyclaim_token')}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        // If manual payment, submit reference too
        if (paymentMethod === 'manual_momo' && manualTxId.trim()) {
          await fetch(`${API_BASE_URL}/api/orders/submit-manual-proof`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: data.order.orderNumber,
              transactionId: manualTxId.trim(),
              senderPhone: phone.trim(),
              senderName: fullName.trim()
            })
          });
        }

        // Trigger victory celebration
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        clearCart();
        navigate(`/order-success/${data.order.orderNumber}`, { state: { order: data.order } });
      } else {
        setError(data.message || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process pre-order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Secure Pre-Order Checkout
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
            Delivery & Payment
          </h1>
          <p className="text-xs text-zinc-500">
            Guaranteed doorstep delivery in Ghana • Sourced from London, US & Tokyo
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Form: Delivery Address & Payment Method (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Delivery Address Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <MapPin className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  1. Ghana Delivery Address
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kwame Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                    Ghana Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0530279271 / 0241234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Email Address (For flight tracking updates)
                </label>
                <input
                  type="email"
                  placeholder="kwame@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>{r} Region</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accra, Kumasi, Tema, Takoradi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                    Street Address / Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Legon, Near ANC Mall"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                    GhanaPost GPS (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GA-183-4921"
                    value={gpsAddress}
                    onChange={(e) => setGpsAddress(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call my assistant before delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            {/* 2. Shipping Method Selection */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <ShippingMethodSelector
                method={shippingMethod}
                onChange={setShippingMethod}
                rates={shippingRates}
              />
            </div>

            {/* 3. Payment Method Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <CreditCard className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  3. Choose Payment Method
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Paystack MoMo */}
                <label
                  onClick={() => setPaymentMethod('paystack_momo')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'paystack_momo'
                      ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 ring-1 ring-black dark:ring-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <p className="font-bold text-black dark:text-white">Paystack Mobile Money</p>
                      <p className="text-[11px] text-zinc-500">MTN MoMo, Telecel Cash, AirtelTigo (Instant Automatic Confirmation)</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'paystack_momo'}
                    onChange={() => setPaymentMethod('paystack_momo')}
                    className="accent-black"
                  />
                </label>

                {/* Paystack Cards */}
                <label
                  onClick={() => setPaymentMethod('paystack_card')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'paystack_card'
                      ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 ring-1 ring-black dark:ring-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <p className="font-bold text-black dark:text-white">Visa / Mastercard via Paystack</p>
                      <p className="text-[11px] text-zinc-500">Local Ghanaian and International Debit / Credit Cards</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'paystack_card'}
                    onChange={() => setPaymentMethod('paystack_card')}
                    className="accent-black"
                  />
                </label>

                {/* Manual MoMo / Bank Transfer to 0530279271 */}
                <label
                  onClick={() => setPaymentMethod('manual_momo')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'manual_momo'
                      ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 ring-1 ring-black dark:ring-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <p className="font-bold text-black dark:text-white">Direct MoMo Transfer (0530279271)</p>
                      <p className="text-[11px] text-zinc-500">Send directly to EarlyClaim MoMo & enter your Transaction ID</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'manual_momo'}
                    onChange={() => setPaymentMethod('manual_momo')}
                    className="accent-black"
                  />
                </label>
              </div>

              {/* Manual MoMo Instruction Box */}
              {paymentMethod === 'manual_momo' && (
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    <p className="font-bold text-black dark:text-white">Direct Transfer Instructions:</p>
                    <p>1. Send deposit amount (<strong>{formatPrice(amountDueGHS)}</strong>) to:</p>
                    <p className="font-mono bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                      Number: <strong>0530279271</strong> (+233 53 027 9271)<br />
                      Name: <strong>TECH ON DEMAND / EARLYCLAIM</strong><br />
                      Reference: <strong>EARLYCLAIM PREORDER</strong>
                    </p>
                    <p>2. Enter your MoMo Transaction ID below to verify:</p>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 29384819481 or PSTK reference"
                      value={manualTxId}
                      onChange={(e) => setManualTxId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sticky top-32">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
                Pre-Order Items ({cartItems.length})
              </h3>

              {/* Items summary */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                      <img src={item.product.selectedImage || item.product.images?.[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-semibold text-black dark:text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {item.size} • {item.color} • Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-black dark:text-white">
                      {formatPrice(item.product.priceGHS * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal Value:</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(totalGHS, totalUSD)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Freight ({shippingMethod === 'sea' ? 'Sea' : 'Air'}):</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(shippingCostGHS)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Estimated Delivery:</span>
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">{currentRate.estimateWeeks || (shippingMethod === 'sea' ? '6–8 weeks' : '2–3 weeks')}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm text-black dark:text-white">
                  <span>Due Today ({depositMode === 'deposit_50' ? '50% Deposit' : 'Full'}):</span>
                  <span className="text-xl font-black">{formatPrice(computedAmountDueGHS)}</span>
                </div>
                {depositMode === 'deposit_50' && (
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Due on arrival in Accra:</span>
                    <span>{formatPrice(computedRemainingBalanceGHS)}</span>
                  </div>
                )}
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition shadow-2xl flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span>Securing Pre-Order Allocation...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Pay Pre-Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-2 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>256-bit Encrypted Checkout • Full Buyer Protection</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
