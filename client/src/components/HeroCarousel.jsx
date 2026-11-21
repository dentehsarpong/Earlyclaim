import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Plane, ShieldCheck, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'GHANA PRE-ORDER SPECIAL',
    title: 'PRE-ORDER DIRECT TO ACCRA & KUMASI',
    subtitle: 'Pay only 50% deposit upfront. 100% authentic designer drops delivered to your doorstep in 10–21 days.',
    ctaText: 'Explore Pre-Orders',
    ctaLink: '#products-section',
    secondaryText: 'How It Works',
    secondaryLink: '/shipping-info',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
    stats: [
      { label: 'Deposit Option', val: '50% Upfront' },
      { label: 'Air Freight', val: '10–18 Days' },
      { label: 'Customs Tax', val: 'All Cleared' },
    ]
  },
  {
    id: 2,
    tag: 'SHOPPING AGENT SERVICE',
    title: 'PASTE ANY LINK. WE BUY & SHIP TO GHANA',
    subtitle: 'Found sneakers, jeans or luxury watches on Taobao, Weidian, Zara, Nike or StockX? Paste the URL and we handle everything.',
    ctaText: 'Paste & Buy Now',
    ctaLink: '/paste-and-buy',
    secondaryText: 'Estimate Freight',
    secondaryLink: '/calculator',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    stats: [
      { label: 'Zero Fraud', val: 'Guaranteed' },
      { label: 'Inspection', val: 'Free HD QC' },
      { label: 'MoMo Checkout', val: 'Supported' },
    ]
  },
  {
    id: 3,
    tag: 'VERIFIED LUXURY VAULT',
    title: 'ROLEX, CHROME HEARTS & PRADA DROPS',
    subtitle: 'Limited pre-order allocations directly sourced from official boutiques in London, Tokyo, and New York.',
    ctaText: 'View Luxury Vault',
    ctaLink: '#products-section',
    secondaryText: 'Track Order',
    secondaryLink: '/tracking',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
    stats: [
      { label: 'Authenticity', val: '100% Verified' },
      { label: 'Packaging', val: 'Double-Boxed' },
      { label: 'WhatsApp Help', val: '24/7 Dedicated' },
    ]
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full bg-black text-white overflow-hidden border-b border-zinc-800">
      {/* Background Graphic Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold uppercase tracking-widest text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{slide.tag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08] text-white">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              {slide.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {slide.ctaLink.startsWith('#') ? (
                <a
                  href={slide.ctaLink}
                  className="px-6 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider transition active:scale-95 flex items-center gap-2 shadow-lg"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  to={slide.ctaLink}
                  className="px-6 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider transition active:scale-95 flex items-center gap-2 shadow-lg"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                to={slide.secondaryLink}
                className="px-5 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium text-xs uppercase tracking-wider transition"
              >
                {slide.secondaryText}
              </Link>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/80 max-w-md">
              {slide.stats.map((st, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    {st.label}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">
                    {st.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white text-black font-black flex items-center justify-center text-xs">
                    EC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">EARLYCLAIM Priority</p>
                    <p className="text-[10px] text-zinc-400">Doorstep Delivery in Ghana</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-white border border-zinc-700">
                    AIR FREIGHT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Dots */}
        <div className="flex items-center justify-between pt-8">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 transition-all rounded-full ${
                  current === idx ? 'w-8 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length)}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-center transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrent(prev => (prev + 1) % SLIDES.length)}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-center transition"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
