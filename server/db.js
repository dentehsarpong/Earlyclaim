const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sampleProducts = require('./data/products');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'earlyclaim.json');

// Initialize database storage
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const demoPasswordHash = bcrypt.hashSync('demo123', salt);

  return {
    products: sampleProducts,
    users: [
      {
        id: 'usr-admin-01',
        name: 'EarlyClaim Administrator',
        email: 'admin@earlyclaim.com',
        phone: '0530279271',
        password: adminPasswordHash,
        role: 'admin',
        referralCode: 'EARLYADMIN',
        referralEarningsGHS: 2400,
        wishlist: ['snk-001', 'wat-001', 'des-001'],
        addresses: [
          {
            id: 'addr-1',
            fullName: 'Admin Operations',
            phone: '0530279271',
            region: 'Greater Accra',
            city: 'Accra',
            street: 'East Legon, Boundary Road',
            gpsAddress: 'GA-183-4921',
            isDefault: true
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-demo-01',
        name: 'Kwame Mensah',
        email: 'demo@earlyclaim.com',
        phone: '0241234567',
        password: demoPasswordHash,
        role: 'customer',
        referralCode: 'KWAME2026',
        referralEarningsGHS: 450,
        wishlist: ['snk-002', 'prf-001'],
        addresses: [
          {
            id: 'addr-2',
            fullName: 'Kwame Mensah',
            phone: '0241234567',
            region: 'Greater Accra',
            city: 'Airport Residential',
            street: '14 Senchi Street',
            gpsAddress: 'GA-045-8832',
            isDefault: true
          }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    orders: [
      {
        id: 'ord-1001',
        orderNumber: 'EC-94821',
        userId: 'usr-demo-01',
        customerName: 'Kwame Mensah',
        customerEmail: 'demo@earlyclaim.com',
        customerPhone: '0241234567',
        items: [
          {
            productId: 'snk-001',
            name: "Air Jordan 1 Retro High OG 'Lost & Found'",
            image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
            size: "US 10",
            color: "Chicago Red / White / Black",
            priceGHS: 4850,
            priceUSD: 310,
            quantity: 1
          }
        ],
        totalGHS: 4850,
        totalUSD: 310,
        depositType: 'deposit_50',
        amountDueGHS: 2425,
        depositPaidGHS: 2425,
        remainingBalanceGHS: 2425,
        paymentMethod: 'paystack_momo',
        paymentStatus: 'paid',
        transactionReference: 'PSTK_REF_94821093',
        status: 'In Transit',
        shippingMethod: 'air',
        adminViewed: true,
        timeline: [
          { title: 'Pre-ordered', date: '2026-11-10 14:20', note: 'Deposit payment received via Paystack MoMo', adminId: null, timestamp: '2026-11-10T14:20:00.000Z' },
          { title: 'Purchased', date: '2026-11-12 09:15', note: 'Item sourced and verified by overseas partner in London', adminId: 'usr-admin-01', timestamp: '2026-11-12T09:15:00.000Z' },
          { title: 'Shipped', date: '2026-11-15 16:40', note: 'Air freight dispatch via DHL Cargo (Flight BA081)', adminId: 'usr-admin-01', timestamp: '2026-11-15T16:40:00.000Z' },
          { title: 'In Transit', date: '2026-11-18 11:00', note: 'In transit to Kotoka International Airport (KIA), Accra', adminId: 'usr-admin-01', timestamp: '2026-11-18T11:00:00.000Z' }
        ],
        shippingAddress: {
          fullName: 'Kwame Mensah',
          phone: '0241234567',
          region: 'Greater Accra',
          city: 'Airport Residential',
          street: '14 Senchi Street',
          gpsAddress: 'GA-045-8832'
        },
        estimatedDeliveryDate: '2026-11-26',
        createdAt: '2026-11-10T14:20:00.000Z',
        adminNotes: ''
      }
    ],
    customRequests: [
      {
        id: 'req-2001',
        requestNumber: 'PB-88412',
        userId: 'usr-demo-01',
        customerName: 'Kwame Mensah',
        customerEmail: 'demo@earlyclaim.com',
        customerPhone: '0241234567',
        url: 'https://www.goat.com/sneakers/air-jordan-4-retro-military-blue-2024',
        productName: 'Air Jordan 4 Retro Military Blue (2024)',
        category: 'Sneakers',
        size: 'US 10.5',
        color: 'Industrial Blue / Off White',
        targetPriceUSD: 240,
        quotedPriceGHS: 4200,
        quotedPriceUSD: 270,
        depositRequiredGHS: 2100,
        status: 'Quoted',
        notes: 'Please verify box is in pristine condition. Deliver to Accra.',
        createdAt: '2026-11-18T10:00:00.000Z'
      }
    ],
    coupons: [
      { code: 'EARLYCLAIM10', discountPercent: 10, minSpendGHS: 1000, active: true },
      { code: 'FIRSTDROP', discountAmountGHS: 150, minSpendGHS: 2000, active: true }
    ],
    currencyRate: {
      USD_TO_GHS: 15.50,
      lastUpdated: new Date().toISOString()
    },
    // --- New data collections ---
    notifications: [],       // buyer in-app notifications
    adminNotifications: [],  // admin in-app notifications
    notificationLogs: [],    // audit log of sent notifications
    productAuditLog: [],     // who changed what product and when
    shippingRates: {
      air: {
        label: 'Air Freight',
        estimateWeeks: '2–3 weeks',
        ratePerKg: 45,          // GHS per kg
        minimumGHS: 150,
        active: true
      },
      sea: {
        label: 'Sea Freight',
        estimateWeeks: '6–8 weeks',
        ratePerCBM: 1800,       // GHS per CBM
        minimumGHS: 300,
        active: true
      }
    },
    categories: [
      { id: 'cat-sneakers', name: 'Sneakers', slug: 'sneakers', active: true },
      { id: 'cat-watches', name: 'Watches', slug: 'watches', active: true },
      { id: 'cat-designer', name: 'Designer Brands', slug: 'designer-brands', active: true },
      { id: 'cat-jeans', name: 'Jeans', slug: 'jeans', active: true },
      { id: 'cat-perfumes', name: 'Perfumes', slug: 'perfumes', active: true },
      { id: 'cat-jewelry', name: 'Jewelry', slug: 'jewelry', active: true },
      { id: 'cat-bags', name: 'Bags', slug: 'bags', active: true },
      { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', active: true },
      { id: 'cat-slides', name: 'Slides', slug: 'slides', active: true },
      { id: 'cat-caps', name: 'Caps', slug: 'caps', active: true },
      { id: 'cat-belts', name: 'Belts', slug: 'belts', active: true }
    ],
    banners: [
      {
        id: 'banner-001',
        title: 'New Season Drops',
        subtitle: 'Exclusive pre-orders from US, UK, Germany & Italy',
        ctaText: 'Shop Now',
        ctaUrl: '/',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=80',
        active: true,
        order: 0
      }
    ]
  };
}

class Database {
  constructor() {
    this.ensureDb();
  }

  ensureDb() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const initial = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      } else {
        // Migrate existing data to add new collections if missing
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(content);
        let mutated = false;

        if (!data.notifications) { data.notifications = []; mutated = true; }
        if (!data.adminNotifications) { data.adminNotifications = []; mutated = true; }
        if (!data.notificationLogs) { data.notificationLogs = []; mutated = true; }
        if (!data.productAuditLog) { data.productAuditLog = []; mutated = true; }
        if (!data.shippingRates) {
          data.shippingRates = getInitialData().shippingRates;
          mutated = true;
        }
        if (!data.categories) { data.categories = getInitialData().categories; mutated = true; }
        const existingCategoryNames = new Set(data.categories.map(category => category.name.toLowerCase()));
        getInitialData().categories.forEach(category => {
          if (!existingCategoryNames.has(category.name.toLowerCase())) {
            data.categories.push(category);
            mutated = true;
          }
        });
        if (!data.banners) { data.banners = getInitialData().banners; mutated = true; }

        // Migrate orders to have shippingMethod and adminViewed
        if (data.orders) {
          data.orders.forEach(o => {
            if (o.shippingMethod === undefined) { o.shippingMethod = 'air'; mutated = true; }
            if (o.adminViewed === undefined) { o.adminViewed = true; mutated = true; }
            if (o.adminNotes === undefined) { o.adminNotes = ''; mutated = true; }
            // Migrate timeline entries to include timestamp and adminId
            if (o.timeline) {
              o.timeline.forEach(t => {
                if (t.timestamp === undefined) {
                  t.timestamp = new Date(t.date).toISOString();
                  mutated = true;
                }
                if (t.adminId === undefined) {
                  t.adminId = null;
                  mutated = true;
                }
              });
            }
          });
        }

        // Migrate products to have shipFromCountry and visibility
        if (data.products) {
          data.products.forEach(p => {
            if (p.shipFromCountry === undefined) { p.shipFromCountry = 'US'; mutated = true; }
            if (p.visibility === undefined) { p.visibility = 'published'; mutated = true; }
            if (p.imageColors === undefined) {
              p.imageColors = Array.isArray(p.images) ? Array(p.images.length).fill('') : [];
              mutated = true;
            }
            const currentSizes = Array.isArray(p.sizes) ? p.sizes : [];
            if (p.category === 'Slides' && (currentSizes.length !== 14 || currentSizes.some((size, index) => String(size) !== String(index + 35)))) {
              p.sizes = Array.from({ length: 14 }, (_, index) => String(index + 35));
              mutated = true;
            }
            const isSneaker = p.category === 'Sneakers' || /sneaker|trainer|running shoe/i.test(p.name || '');
            const legacySeedSneaker = ['des-002', 'des-003'].includes(p.id) && currentSizes.some(size => /^EU\s/i.test(size));
            if (isSneaker && (currentSizes.some(size => /^US\s/i.test(size)) || legacySeedSneaker)) {
              p.sizes = Array.from({ length: 14 }, (_, index) => String(index + 35));
              mutated = true;
            } else if (/jacket|shirt|hoodie|sweater|coat|dress/i.test(p.name || '') &&
              currentSizes.some(size => /^(?:S|M|L|XL|XXL)(?:\b|\s*\()/i.test(size))) {
              p.sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
              mutated = true;
            }
          });
        }

        if (mutated) {
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        }
      }
    } catch (err) {
      console.error('Error ensuring DB file:', err);
    }
  }

  read() {
    try {
      this.ensureDb();
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading DB:', err);
      return getInitialData();
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing DB:', err);
      return false;
    }
  }

  reset() {
    const initial = getInitialData();
    this.write(initial);
    return initial;
  }
}

const dbInstance = new Database();
module.exports = dbInstance;
