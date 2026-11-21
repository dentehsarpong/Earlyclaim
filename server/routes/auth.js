const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const data = db.read();
    const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newReferralCode = 'EC' + Math.floor(100000 + Math.random() * 900000);

    // If referred by someone, award bonus or record referrer
    let referredBy = null;
    if (referralCode) {
      const referrer = data.users.find(u => u.referralCode?.toUpperCase() === referralCode.trim().toUpperCase());
      if (referrer) {
        referredBy = referrer.id;
        referrer.referralEarningsGHS = (referrer.referralEarningsGHS || 0) + 50; // Welcome referral reward
      }
    }

    const newUser = {
      id: 'usr-' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: 'customer',
      referralCode: newReferralCode,
      referredBy,
      referralEarningsGHS: 0,
      wishlist: [],
      addresses: [],
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    db.write(data);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...newUser };
    delete safeUser.password;

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
      message: 'Account created successfully'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const data = db.read();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...user };
    delete safeUser.password;

    res.json({
      success: true,
      token,
      user: safeUser,
      message: 'Logged in successfully'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Google Sign-In Mock/Endpoint
router.post('/google', (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email required' });
    }

    const data = db.read();
    let user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const salt = bcrypt.genSaltSync(10);
      const randomPassword = bcrypt.hashSync(uuidv4(), salt);
      const newReferralCode = 'EC' + Math.floor(100000 + Math.random() * 900000);

      user = {
        id: 'usr-' + uuidv4().slice(0, 8),
        name: name || 'Google User',
        email: email.toLowerCase(),
        phone: '',
        password: randomPassword,
        role: 'customer',
        referralCode: newReferralCode,
        referralEarningsGHS: 0,
        googleId,
        wishlist: [],
        addresses: [],
        createdAt: new Date().toISOString()
      };
      data.users.push(user);
      db.write(data);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { ...user };
    delete safeUser.password;

    res.json({
      success: true,
      token,
      user: safeUser,
      message: 'Google authentication successful'
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: 'Google login failed' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  const safeUser = { ...req.user };
  delete safeUser.password;
  res.json({ success: true, user: safeUser });
});

// Update Profile
router.put('/me', authenticateToken, (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const data = db.read();
    const index = data.users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) data.users[index].name = name;
    if (phone !== undefined) data.users[index].phone = phone;
    if (addresses) data.users[index].addresses = addresses;

    db.write(data);
    const safeUser = { ...data.users[index] };
    delete safeUser.password;

    res.json({ success: true, user: safeUser, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Wishlist Toggle
router.post('/wishlist/toggle', authenticateToken, (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    const data = db.read();
    const userIndex = data.users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

    const user = data.users[userIndex];
    user.wishlist = user.wishlist || [];
    const exists = user.wishlist.includes(productId);

    if (exists) {
      user.wishlist = user.wishlist.filter(id => id !== productId);
    } else {
      user.wishlist.push(productId);
    }

    db.write(data);
    res.json({
      success: true,
      wishlist: user.wishlist,
      isWishlisted: !exists,
      message: !exists ? 'Added to wishlist' : 'Removed from wishlist'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle wishlist' });
  }
});

module.exports = router;
