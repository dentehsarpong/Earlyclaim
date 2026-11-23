import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Link2,
  Sparkles,
  Calculator,
  ShieldCheck,
  Plane,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_BASE_URL } from '../apiConfig';

export default function PasteAndBuyPage() {
  const { user } = useAuth();
  const { formatPrice, rate } = useCurrency();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Designer Brands');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [targetPriceUSD, setTargetPriceUSD] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [image, setImage] = useState(null); // Added image state
  const [uploading, setUploading] = useState(false);

  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estimate calculations
  const parsedUSD = parseFloat(targetPriceUSD) || 0;
  const estItemGHS = Math.round(parsedUSD * rate);
  const estShippingGHS = parsedUSD > 0 ? 350 : 0; // standard 1-2kg air freight estimate
  const totalEstGHS = estItemGHS + estShippingGHS;
  const depositEstGHS = Math.round(totalEstGHS * 0.50);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid product link.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Please provide your WhatsApp phone number so we can send the quote.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          productName: productName.trim() || 'Custom Shopping Agent Request',
          category,
          size: size.trim(),
          color: color.trim(),
          targetPriceUSD: parsedUSD,
          notes: notes.trim(),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          imageUrl: image // Included image URL
        })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setSubmittedRequest(data.request);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to contact EarlyClaim agent server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
      const res = await fetch(`${API_BASE_URL}/api/products/upload-reference-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            dataUrl: reader.result,
            filename: file.name
        })
      });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        if (data.success && data.url) {
          setImage(data.url);
        } else {
          setError('Failed to upload image. Please try again.');
        }
      } catch (err) {
        setError(err.message || 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Shopping Agent Service</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white uppercase">
            PASTE & BUY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Paste any link from Taobao, Weidian, 1688, Nike, Zara, StockX, GOAT, or Amazon. Our team purchases it, performs high-definition quality inspection, and air freights it directly to your address in Ghana.
          </p>
        </div>

        {submittedRequest ? (
          /* Submission Success View */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-black dark:bg-white text-white dark:text-black mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Request Confirmed</span>
              <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                Ticket #{submittedRequest.requestNumber}
              </h2>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Our procurement specialist is reviewing your link now. We will send you an official invoice and quote via WhatsApp within 15–45 minutes.
              </p>
            </div>

            {/* Breakdown card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Product Name:</span>
                <span className="font-semibold text-black dark:text-white truncate max-w-[200px]">{submittedRequest.productName}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Estimated Total:</span>
                <span className="font-bold text-black dark:text-white">~{formatPrice(submittedRequest.quotedPriceGHS, submittedRequest.quotedPriceUSD)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>50% Pre-Order Deposit:</span>
                <span className="font-bold text-green-600 dark:text-green-400">~{formatPrice(submittedRequest.depositRequiredGHS)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Estimated Arrival:</span>
                <span className="font-semibold text-black dark:text-white">10–18 Business Days</span>
              </div>
            </div>

            {/* Direct WhatsApp notify button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20just%20submitted%20Paste%20%26%20Buy%20ticket%20%23${submittedRequest.requestNumber}%20for%20${encodeURIComponent(submittedRequest.productName)}.%20Please%20verify%20my%20quote.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Notify Agent on WhatsApp (+233 53 027 9271)</span>
              </a>

              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setUrl('');
                  setProductName('');
                  setTargetPriceUSD('');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200"
              >
                Submit Another Link
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form (8 Cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                    1. Product URL / Web Link <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      placeholder="https://item.taobao.com/item.htm?id=... or StockX, Nike, Zara link"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                    <Link2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 mb-4">
                    Accepts links from Taobao, Weidian, 1688, GOAT, StockX, Nike, Zara, Amazon, etc.
                  </p>

                  <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                    Product Reference Image (Optional)
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-bold uppercase tracking-wider transition">
                    <span>{uploading ? 'Uploading...' : image ? 'Image Uploaded' : 'Upload Image from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {image && (
                    <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Product Name / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jordan 4 Retro Military Blue"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    >
                      <option value="Sneakers">Sneakers</option>
                      <option value="Watches">Watches</option>
                      <option value="Designer Brands">Designer Brands</option>
                      <option value="Jeans">Jeans & Denim</option>
                      <option value="Perfumes">Perfumes</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Bags">Bags & Luggage</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Slides">Slides</option>
                      <option value="Caps">Caps</option>
                      <option value="Belts">Belts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. US 10.5 or Medium"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Color / Style
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Black / Blue"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Est. Item Price (USD $)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={targetPriceUSD}
                      onChange={(e) => setTargetPriceUSD(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Special Procurement Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please verify shoe box condition. Include receipt if available."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                {/* Contact information for quote */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    2. Where Should We Send Your Quote?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Kwame Mensah"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                        WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0530279271 / 0241234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition shadow-xl flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Link to Shopping Agent</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Live Cost Estimator Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <Calculator className="w-4 h-4 text-black dark:text-white" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Estimated Pre-Order Cost
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Item Value:</span>
                    <span className="font-semibold text-black dark:text-white">${parsedUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>In GHS (1 USD ≈ ₵{rate.toFixed(2)}):</span>
                    <span className="font-semibold text-black dark:text-white">{formatPrice(estItemGHS)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Est. Air Freight & Duty:</span>
                    <span className="font-semibold text-black dark:text-white">{formatPrice(estShippingGHS)}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-black dark:text-white text-sm">
                    <span>Est. Total:</span>
                    <span className="font-black">{formatPrice(totalEstGHS)}</span>
                  </div>
                  <div className="pt-1 flex justify-between text-green-600 dark:text-green-400 font-bold">
                    <span>50% Pre-Order Deposit:</span>
                    <span>{formatPrice(depositEstGHS)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 space-y-1">
                  <p>• Final quote confirmed by our agent within 30 minutes.</p>
                  <p>• Pay with MTN MoMo, Telecel Cash, or Card via Paystack.</p>
                  <p>• Full inspection photo sent before international dispatch.</p>
                </div>
              </div>

              {/* Supported Platforms */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-2 text-xs">
                <p className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">
                  Supported Retailers:
                </p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">Taobao</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">Weidian</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">1688</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">Nike US/UK</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">StockX</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">GOAT</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">Zara</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">Amazon</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
