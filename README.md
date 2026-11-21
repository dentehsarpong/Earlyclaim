# EARLYCLAIM — Luxury Pre-Order & Shopping Agent Platform

> **Ghana's Premier Pre-Order & Shopping Agent E-Commerce Platform** for Sneakers, Watches, Designer Fashion, Jeans, Perfumes, Jewelry, Bags, and Accessories. Designed with a clean, smooth, professional **Monochrome Black & White Luxury UI** inspired by LitBuy.com.

---

## 💎 Features Overview

### 1. Storefront & Layout (LitBuy Architecture)
- **Top Header**: High-contrast matte black bar with EARLYCLAIM monogram logo, rounded "Home" pill, nav links (*Home, Pre-Order Requests, Paste & Buy, Shipping Info, Cost Calculator, Tools dropdown, More dropdown*), search bar, Dark/Light mode toggle, Currency switcher (**GHS ₵ / USD $**), Cart drawer shortcut with badge, and Auth button.
- **Category Bar with Mega-Menu**: "All Categories" button opening a 3-column directory, plus a horizontally scrollable category bar with left/right navigation arrows (*Sneakers, Watches, Designer Brands, Jeans, Perfumes, Jewelry, Bags, Men's, Women's, Kids, Accessories*).
- **Hero Banner Carousel**: Interactive multi-slide promotion carousel with smooth transitions, air freight arrival badges, and quick CTAs.
- **Pill-Style Tabs**: Quick zone filter tabs (*"Picks for You", "Best Selection", "Men's Zone", "Hype Street", "Fashion Jewelry", "Casual Sporty Style", "New Arrivals"*).
- **Product Grid**: Responsive 5-column grid on desktop (2-column on mobile) featuring crisp white-background luxury product photos, 2-line truncated titles, bold prices in GHS and USD, 50% deposit badges, and quick-hover pre-order buttons.
- **Floating Right-Side Dock**: LitBuy-style vertical right sidebar with logo, **live local UTC/GMT clock** (Ghana time), cart counter, flight/cargo tracking shortcut, **WhatsApp direct support button (+233 53 027 9271)**, community link, and smooth back-to-top button.
- **Footer**: Explanations for how to pre-order, air cargo timelines to Kotoka International Airport (KIA), refund policy, FAQs, accepted payment badges (MTN MoMo, Telecel Cash, AirtelTigo, Visa, Mastercard, Paystack), and official business details:
  - **Email**: `dentehsarpong87@gmail.com`
  - **WhatsApp / Phone**: `+233 53 027 9271` (`0530279271`)
  - **Copyright**: `© 2026 TECH ON DEMAND. All rights reserved.`

---

### 2. Core Shopping & Pre-Order Functionality
- **32 Pre-Seeded Sample Products**: Nike Air Jordan 1 'Lost & Found', Travis Scott 'Reverse Mocha', Rolex Submariner Date 41mm, Audemars Piguet Royal Oak, Cartier Santos, Chrome Hearts Denim, Amiri MX1 Jeans, Prada Re-Nylon Bomber, Chanel Classic Flap, Goyard Saint Louis PM, MFK Baccarat Rouge 540, Van Cleef Alhambra, Moissanite Cuban Chain, and more.
- **Flexible Pre-Order Deposits**: Choose between **50% Deposit** (pay half today, pay remainder upon arrival in Accra) or **100% Full Payment** (priority flight allocation).
- **"Paste & Buy" Shopping Agent**: Paste any external URL (Taobao, Weidian, 1688, Nike US/UK, StockX, GOAT, Zara, Amazon). EarlyClaim's system automatically estimates weight, air freight, customs tax, and calculates a 50% deposit ticket (`PB-XXXXX`).
- **Ghanaian Checkout & Delivery**: Full address form with all 16 Ghana regions (*Greater Accra, Ashanti, Western, Central, Eastern, etc.*) and GhanaPost GPS code support.
- **Payment Methods**:
  1. **Paystack Online Checkout** (MTN Mobile Money, Telecel Cash, AirtelTigo, Visa, Mastercard)
  2. **Manual MoMo Transfer** to `0530279271` (TECH ON DEMAND / EARLYCLAIM) with customer transaction ID input and admin verification.
- **Live Order & Cargo Tracker**: Enter order code (e.g. `EC-94821`) to inspect real-time progression across 6 stages:
  $$\text{Pre-ordered} \longrightarrow \text{Purchased} \longrightarrow \text{Shipped} \longrightarrow \text{In Transit} \longrightarrow \text{Arrived in Accra} \longrightarrow \text{Delivered}$$
- **User Dashboard**: Pre-orders tracker, Paste & Buy request tickets, Wishlist, Saved addresses, and **Affiliate / Referral Program** with personal referral links and ₵50 MoMo commission payouts.
- **Admin Dashboard**:
  - Revenue analytics and pre-order deposit volume.
  - Order status switcher across all 6 stages.
  - 1-Click approval for manual MoMo / Bank payments.
  - Review and quote Paste & Buy tickets with direct WhatsApp dispatch.
  - Catalog product manager (Add, view, delete products).

---

## 🚀 Advanced Features (v2.0)

### 1. Admin Order Alerts
- **Real-Time Push & Polling Fallback**: Connected through Server-Sent Events (`/api/notifications/stream`) with automatic 30-second polling fallback.
- **Admin Header Bell**: Real-time unread badge, interactive notification panel (mark single as read, mark all read, direct link to order).
- **Email Notifications**: Triggers an HTML order summary immediately upon placement to `dentehsarpong87@gmail.com` with customer name, items, shipping method, and totals.
- **SMS / WhatsApp Alerts**: Optional Twilio dispatch behind `ENABLE_SMS=true` config flag.
- **New Order Badges**: Highlights unviewed orders with a high-contrast `NEW` badge in the orders table, with a "Mark All Viewed" button.

### 2. Buyer Status Notifications
- **Event-Driven Architecture**: Single code path (`notifyOrderStatusChange`) handles validation, timeline logging, buyer in-app notifications, and outbound email dispatch.
- **Adaptive Status Templates**:
  - `Purchased`: *"Your items have been purchased and inspected by our agent."*
  - `Shipped`: *"Your order has been packed and booked for shipment."* (adapts to flight for Air, vessel for Sea).
  - `In Transit`: *"Your shipment is on its way to Ghana."* (adapts to air cargo vs sea freight).
  - `Arrived`: *"Your [flight/vessel] shipment has arrived and cleared customs in Accra."*
  - `Delivered`: *"Doorstep dispatch complete. Thank you for ordering with EarlyClaim."*
- **Forward-Only Integrity**: Status transitions are restricted to forward sequence (`Pre-ordered` → `Purchased` → `Shipped` → `In Transit` → `Arrived` → `Delivered`) unless an administrator toggles the explicit override checkbox in the confirmation dialog.
- **Full Traceability**: Order timeline tracks the exact ISO timestamp and admin ID for each action. Notification attempts are logged to an audit table (`notificationLogs`).
- **Dedicated Buyer Notifications Page**: Accessible via `/notifications` or from the user dropdown.

### 3. Admin Product & Store Management
- **Full Catalog CRUD**: Create, edit, archive (soft delete), and permanently delete items.
- **Fields Supported**: Title, brand, category, subcategory, description, price (GHS with automatic or custom USD reference), deposit percentage, size options, color options, stock quantity, ship-from country, lead time, and visibility (`published`, `draft`, `archived`).
- **Photo Manager**: Multiple photos per item, set primary photo, reorder images with arrow controls, add via direct URL or local upload.
- **Sort, Filter & Pagination**: Instant client-side search, category filter, visibility filter, price/name sorting, and pagination controls.
- **Store Operations**: Admins can add/delete categories, manage homepage promo banners, configure airway bill / tracking numbers, and view a comprehensive product audit log.

### 4. Shipping Methods & Origin Countries
- **Air Freight vs Sea Freight**:
  - **Air Freight**: Approximately 2–3 weeks lead time, optimized for sneakers, jewelry, and lightweight apparel.
  - **Sea Freight**: Approximately 6–8 weeks lead time, cost-effective for heavier or bulky goods.
- **Configurable Rate Logic**: Admin settings panel allows tuning per-kg and per-CBM base rates and minimums. Checkout dynamically reflects the selected method, adjusts the total and deposit, and displays the estimated arrival date.
- **Ship-From Countries Bar**: Slim, responsive banner positioned at the top of the application highlighting source origins: **United States (US)**, **United Kingdom (GB)**, **Germany (DE)**, and **Italy (IT)** with crisp vector SVG flags.
- **Product Origin Badges & Filters**: Origin flag tags display on product detail pages and cards; buyers can filter the storefront by origin country from the toolbar.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide React, React Router 6, Canvas Confetti.
- **Backend**: Node.js, Express, JSON persistent database with zero external setup needed + MongoDB Mongoose compatibility when `MONGODB_URI` is provided.
- **Authentication**: JWT token authentication, Bcrypt password hashing, Google Sign-In simulation.
- **Payments**: Paystack API integration (MTN MoMo, Telecel Cash, Visa/Mastercard) + Manual MoMo confirmation workflow.
- **Currencies**: GHS (Ghanaian Cedi) default + USD switcher with live exchange converter.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
Clone the repository and install all dependencies:
```bash
# In project root (/Users/user/PB)
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Seeding the 30+ Sample Products
```bash
npm run seed
# Resets and seeds 32 luxury products, demo customer account & admin account
```

### Running Locally (Frontend + Backend)
Run both the Express server (port 5000) and the Vite frontend (port 5173) with a single command:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### Running Production Build
```bash
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** to view the production app served directly from Express.

---

## 🔑 Demo Accounts

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@earlyclaim.com` | `admin123` | Admin Dashboard (`/admin`), Status updates, MoMo approval, Product CRUD |
| **Customer** | `demo@earlyclaim.com` | `demo123` | Pre-orders, Tracking sample `EC-94821`, Wishlist, Referral code `KWAME2026` |

*(You can also click the "Fill Admin" or "Fill Customer" test buttons in the Sign In modal).*

---

## 🌐 Deployment Instructions

### 1. Backend Deployment (Render or Railway)
1. Push your repository to GitHub.
2. In **Render** or **Railway**, create a **New Web Service** pointing to the repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Set Environment Variables:
   - `PORT`: `5000`
   - `JWT_SECRET`: `<your-random-secure-string>`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
   - `PAYSTACK_SECRET_KEY`: `<your-paystack-secret-key>`
   - `MONGODB_URI`: `mongodb+srv://...` (Optional; file persistence is used if omitted)

### 2. Frontend Deployment (Vercel)
1. In **Vercel**, import the repository.
2. Configure project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In `client/vite.config.js` or via rewrite rules in `vercel.json`, direct `/api` proxy calls to your deployed backend URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-render-backend.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📞 Support & Contact

- **Email**: `dentehsarpong87@gmail.com`
- **Phone / WhatsApp**: `+233 53 027 9271` (`0530279271`)
- **Developer**: TECH ON DEMAND
- **Copyright**: © 2026 TECH ON DEMAND. All rights reserved.
# EARLYCLAIM
