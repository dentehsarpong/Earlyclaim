const db = require('./db');

console.log('⚡ EARLYCLAIM Database Seeding starting...');
const result = db.reset();
console.log(`✅ Database successfully reset & seeded!`);
console.log(`📦 Loaded ${result.products.length} high-quality products.`);
console.log(`👥 Loaded ${result.users.length} users (Admin: admin@earlyclaim.com / admin123).`);
console.log(`🛒 Loaded sample orders and Paste & Buy requests.`);
process.exit(0);
