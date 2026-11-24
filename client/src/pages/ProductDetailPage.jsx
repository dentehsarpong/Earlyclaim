import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Plane,
  Clock,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  ChevronRight,
  Check,
  HelpCircle,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ShipFromBadge from '../components/ShipFromBadge';
import { getColorSwatch } from '../utils/colorSwatch';
import { getImageUrl } from '../utils/imageHelper';
import { getColorImageIndex } from '../utils/productVariants';
import { API_BASE_URL } from '../apiConfig';

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart, setDepositMode } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [depositChoice, setDepositChoice] = useState('deposit_50'); // 'deposit_50' | 'full'
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${idOrSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          setSelectedSize(data.product.sizes?.[0] || 'Standard');
          const initialColor = data.product.colors?.[0] || 'Default';
          setSelectedColor(initialColor);
          setSelectedImg(getColorImageIndex(data.product, initialColor));
        }
      })
      .catch(err => console.error('Failed to load product detail:', err))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-black dark:text-white animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-2">Loading Luxury Item...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-24 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-black dark:text-white">Item Not Found</h2>
        <p className="text-xs text-zinc-500">The product you are requesting is either out of pre-order allocation or does not exist.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase">
          Back to Store
        </Link>
      </div>
    );
  }

  const depositRate = depositChoice === 'deposit_50' ? 0.50 : 1.0;
  const payNowGHS = Math.round(product.priceGHS * depositRate * qty);
  const payNowUSD = Math.round(product.priceUSD * depositRate * qty);
  const remainingGHS = Math.round(product.priceGHS * (1 - depositRate) * qty);
  const remainingUSD = Math.round(product.priceUSD * (1 - depositRate) * qty);

  const handlePreorderNow = () => {
    setDepositMode(depositChoice);
    addToCart(product, selectedSize, selectedColor, qty);
    navigate('/checkout');
  };

  const selectColor = (color) => {
    setSelectedColor(color);
    setSelectedImg(getColorImageIndex(product, color));
  };

  const selectImage = (index) => {
    setSelectedImg(index);
    const imageColor = product.imageColors?.[index];
    if (imageColor) setSelectedColor(imageColor);
  };

  const handleAddToCart = () => {
    setDepositMode(depositChoice);
    addToCart(product, selectedSize, selectedColor, qty);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5]">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link to="/" className="hover:text-black dark:hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/?category=${product.category}`} className="hover:text-black dark:hover:text-white">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black dark:text-white font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-4 relative group">
              <img
                src={getImageUrl(product.images?.[selectedImg])}
                alt={product.name}
                className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-wider">
                AUTHENTIC PRE-ORDER
              </span>
            </div>

            {/* Thumbnail row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => selectImage(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-white dark:bg-zinc-950 p-1 transition ${
                      selectedImg === i ? 'border-black dark:border-white shadow-md' : 'border-zinc-200 dark:border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
                <h5 className="font-bold text-xs uppercase">Authenticity Checked</h5>
                <p className="text-[11px] text-zinc-500">Every serial number & tag inspected in London/US before freight.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <Plane className="w-5 h-5 text-black dark:text-white" />
                <h5 className="font-bold text-xs uppercase">Air Cargo to Accra</h5>
                <p className="text-[11px] text-zinc-500">Arrives via flight to Kotoka (KIA) in {product.estimatedDays || '10–18 days'}.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <RotateCcw className="w-5 h-5 text-black dark:text-white" />
                <h5 className="font-bold text-xs uppercase">Buyer Protection</h5>
                <p className="text-[11px] text-zinc-500">Full refund if item fails authenticity verification.</p>
              </div>
            </div>
          </div>

          {/* Right: Product Buy Box (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold uppercase tracking-wider text-zinc-400">{product.brand}</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                  {product.category}
                </span>
              </div>
              <ShipFromBadge countryCode={product.shipFromCountry || 'US'} />
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex text-black dark:text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {product.rating} ({product.reviewsCount} customer pre-order reviews)
                </span>
              </div>
            </div>

            {/* Price & Deposit Options Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase font-bold text-zinc-500">Item Pre-Order Price</span>
                <span className="text-2xl font-black text-black dark:text-white">
                  {formatPrice(product.priceGHS, product.priceUSD)}
                </span>
              </div>

              {/* Deposit Option Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-2">
                  Choose Payment Option:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDepositChoice('deposit_50')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      depositChoice === 'deposit_50'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <p className="font-bold">50% Deposit</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Pay half now, balance on arrival in Ghana</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositChoice('full')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      depositChoice === 'full'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <p className="font-bold">Full 100%</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Full payment with express dispatch priority</p>
                  </button>
                </div>
              </div>

              {/* Price Calculation breakdown */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-sm text-black dark:text-white">
                  <span>Pay Today:</span>
                  <span className="text-base font-black">{formatPrice(payNowGHS, payNowUSD)}</span>
                </div>
                {depositChoice === 'deposit_50' && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Due on arrival in Accra:</span>
                    <span>{formatPrice(remainingGHS, remainingUSD)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>International Air Freight & Customs:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">ALL INCLUSIVE</span>
                </div>
              </div>
            </div>

            {/* Size Variants */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-2">
                  {product.category === 'Sneakers' || /sneaker/i.test(product.name) ? 'Select EU Size:' : 'Select Size:'} <span className="text-black dark:text-white">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        selectedSize === s
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Variants */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-2">
                  Colorway: <span className="text-black dark:text-white">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectColor(c)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                        selectedColor === c
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      <span aria-hidden="true" className="inline-block w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/30" style={{ background: getColorSwatch(c) }} />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 px-6 rounded-full border-2 border-black dark:border-white text-black dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handlePreorderNow}
                  className="py-3.5 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Pre-Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp direct chat link */}
              <a
                href={`https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20want%20to%20pre-order%20the%20${encodeURIComponent(product.name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Ask Question on WhatsApp (+233 53 027 9271)</span>
              </a>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2">
                Item Description & Provenance
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-black uppercase tracking-tight text-black dark:text-white mb-6">
              More Drops in {product.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={() => navigate(`/product/${p.id}`)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
