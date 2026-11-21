import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  ShieldCheck,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

const FAQS = [
  {
    q: "How does the 50% Pre-Order Deposit work?",
    a: "When you place a pre-order, you pay only 50% of the total amount upfront. We use this deposit to purchase and lock your product with our verified boutique partners overseas. The remaining 50% balance is paid only when the package arrives at our depot in Accra, right before doorstep delivery."
  },
  {
    q: "How long does shipping to Ghana take?",
    a: "Standard air cargo from London, Guangzhou, Tokyo or the United States takes between 10 to 18 business days. Once your package lands at Kotoka International Airport (KIA), our clearance agents process it within 24–48 hours."
  },
  {
    q: "Do I have to pay extra customs duties or airport taxes?",
    a: "No! All prices shown on EARLYCLAIM are all-inclusive. Ghana Revenue Authority (GRA) import duties, clearing charges, and airport handling fees are already included in your quoted price."
  },
  {
    q: "What is the Paste & Buy service?",
    a: "Paste & Buy is our custom shopping agent feature. If you want sneakers, watches or clothing from Taobao, Weidian, StockX, Nike US, or Zara, you simply copy the product link, paste it into our Paste & Buy form, and our procurement team in London and China will purchase it, take HD inspection photos, and air freight it to you in Ghana."
  },
  {
    q: "What if the item is not authentic or has a defect?",
    a: "We provide a 100% money-back authenticity guarantee. Every single item is physically inspected at our overseas sorting facility before flight dispatch. If an item fails verification or has flaws, we notify you immediately and issue a full refund."
  },
  {
    q: "Which payment methods are accepted in Ghana?",
    a: "We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, and Visa/Mastercard cards via Paystack. You can also make a direct MoMo transfer to 0530279271 (TECH ON DEMAND / EARLYCLAIM) with instant staff confirmation."
  }
];

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm">
            <Plane className="w-3.5 h-3.5" />
            <span>Air Cargo & Pre-Order Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
            Shipping & Pre-Order Logistics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
            Everything you need to know about air cargo timelines, customs clearance in Accra, pre-order deposit safeguards, and buyer protection.
          </p>
        </div>

        {/* 4 Steps Visual Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
            The 4-Step Pre-Order Journey
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-[11px]">1</span>
              <h5 className="font-bold text-sm text-black dark:text-white">50% Deposit</h5>
              <p className="text-zinc-500 text-[11px]">Pay half using MTN MoMo, Telecel or Card to secure your allocation.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-[11px]">2</span>
              <h5 className="font-bold text-sm text-black dark:text-white">Inspection QC</h5>
              <p className="text-zinc-500 text-[11px]">Our team in London/Guangzhou inspects serial numbers, stitching, and packaging.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-[11px]">3</span>
              <h5 className="font-bold text-sm text-black dark:text-white">Air Cargo</h5>
              <p className="text-zinc-500 text-[11px]">Double-boxed cargo flight to Kotoka International Airport (ACC).</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-[11px]">4</span>
              <h5 className="font-bold text-sm text-black dark:text-white">Doorstep Delivery</h5>
              <p className="text-zinc-500 text-[11px]">Clear customs, pay remaining 50% balance, and receive delivery at home or office.</p>
            </div>
          </div>
        </div>

        {/* Timelines by Destination Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Delivery Days to Ghana Regions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Origin Airport</th>
                  <th className="py-2.5">Destination in Ghana</th>
                  <th className="py-2.5">Flight Frequency</th>
                  <th className="py-2.5">Estimated Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
                <tr>
                  <td className="py-3 font-semibold text-black dark:text-white">London Heathrow (LHR)</td>
                  <td className="py-3">Greater Accra (Airport, East Legon, Cantonments)</td>
                  <td className="py-3">3x Weekly (DHL / BA)</td>
                  <td className="py-3 font-bold text-black dark:text-white">10–14 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-black dark:text-white">Guangzhou (CAN)</td>
                  <td className="py-3">Kumasi (Adum, Ahodwo, KNUST)</td>
                  <td className="py-3">2x Weekly Cargo Flight</td>
                  <td className="py-3 font-bold text-black dark:text-white">12–18 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-black dark:text-white">New York (JFK)</td>
                  <td className="py-3">Western & Central (Takoradi, Cape Coast)</td>
                  <td className="py-3">2x Weekly Direct Flight</td>
                  <td className="py-3 font-bold text-black dark:text-white">12–18 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-black dark:text-white">Tokyo Narita (NRT)</td>
                  <td className="py-3">Nationwide Regional Capitals</td>
                  <td className="py-3">Weekly Express</td>
                  <td className="py-3 font-bold text-black dark:text-white">14–21 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs Accordion / List */}
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase text-black dark:text-white tracking-tight">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1.5"
              >
                <h4 className="font-bold text-sm text-black dark:text-white">{faq.q}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Callout */}
        <div className="p-8 rounded-3xl bg-black text-white border border-zinc-800 text-center space-y-3">
          <h4 className="text-xl font-black uppercase tracking-tight">Need Real-Time Freight Updates?</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Our Ghana logistics operations desk is on standby to assist with customs queries, special item requests, and airway bills.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20have%20a%20shipping%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Us: +233 53 027 9271</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
