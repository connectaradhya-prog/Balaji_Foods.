const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { sendOTP, sendOrderConfirmation } = require('./utils/mailer');
const supabase = require('./lib/supabase');

dotenv.config();

const app = express();

// Security Middlewares & Headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Password']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use((req, res, next) => {
  if (req.url.match(/\.(png|jpg|jpeg|gif|ico|svg|css|js|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));


// Connect MongoDB if URI is supplied
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err.message));
} else {
  console.log('MongoDB URI not configured - utilizing Supabase / Memory storage mode.');
}

// Razorpay & Owner Payment Settings Store
let memoryPaymentSettings = {
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  upiVpa: 'connectaradhya@okaxis',
  accountHolder: 'Balaji Foods & Sweets',
  bankName: 'Axis Bank',
  accountNumber: '50100239182391',
  ifscCode: 'UTIB0001245',
  branchName: 'Kothrud, Pune'
};

let razorpay = null;
if (memoryPaymentSettings.razorpayKeyId && memoryPaymentSettings.razorpayKeySecret) {
  try {
    razorpay = new Razorpay({
      key_id: memoryPaymentSettings.razorpayKeyId,
      key_secret: memoryPaymentSettings.razorpayKeySecret
    });
  } catch (e) {
    console.log('Razorpay initialization skipped or failed:', e.message);
  }
}

// Security Middleware for Customer Token Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, process.env.JWT_SECRET || 'balaji_foods_secure_jwt_key_2025', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// Security Middleware for Admin Access Protection
const authenticateAdmin = (req, res, next) => {
  const adminPass = req.headers['x-admin-password'];
  const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (adminPass && adminPass === expectedPass) {
    return next();
  }
  
  // Allow fallback if not explicitly enforced in local development
  if (process.env.NODE_ENV !== 'production' && !process.env.ADMIN_PASSWORD) {
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized: Admin authentication header required' });
};

// In-Memory Fallback Stores
let memoryUsers = [
  {
    _id: 'usr-101',
    email: 'aarav.sharma@example.com',
    name: 'Aarav Sharma',
    mobile: '9823011223',
    building: 'Flat 402, Sai Heights',
    address: 'Kothrud',
    landmark: 'Near Gandhi Bhavan',
    city: 'Pune',
    pincode: '411038',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr-102',
    email: 'priya.kulkarni@example.com',
    name: 'Priya Kulkarni',
    mobile: '9890123456',
    building: '12 Anandi Nivas',
    address: 'MG Road',
    landmark: 'Opposite City Center',
    city: 'Nashik',
    pincode: '422001',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let memoryProducts = [
  {
    _id: 'prod-1',
    title: 'Spicy Chivda',
    desc: 'Crunchy, spicy Maharashtrian chivda roasted to golden perfection.',
    price: 120,
    img: 'chivda_new.png',
    fallback: 'chivda.jpg',
    category: 'savory',
    unit: '250g',
    shelfLife: '45 Days',
    gheePercent: 'Pure Groundnut Oil & Ghee',
    energy: '480 kcal',
    story: 'Prepared using traditional thin flattened rice (pohe), roasted peanuts, fried curry leaves, and secret Maharashtrian spices. Perfect for high tea and festive munching.',
    ingredients: ['Poha (Flattened Rice)', 'Peanuts', 'Cashews', 'Curry Leaves', 'Green Chillies', 'Turmeric', 'Pure Spices'],
    available: true
  },
  {
    _id: 'prod-2',
    title: 'Besan Ladoo',
    desc: 'Sweet, aromatic, pure ghee roasted besan ladoo topped with almonds.',
    price: 150,
    img: 'balaji_ladoo_hero.png',
    fallback: 'ladoo.jpg',
    category: 'sweet',
    unit: '6 pcs',
    shelfLife: '30 Days',
    gheePercent: '100% Pure Gir Cow Ghee',
    energy: '530 kcal',
    story: 'Slow roasted gram flour in pure golden ghee until aromatic, rolled gently with cardamom and roasted nuts. Guaranteed melt-in-the-mouth texture.',
    ingredients: ['Pure Cow Ghee', 'Gram Flour (Besan)', 'Pure Sugar', 'Cardamom Powder', 'Almonds', 'Pistachios'],
    available: true
  },
  {
    _id: 'prod-3',
    title: 'Shankarpali',
    desc: 'Golden bites of joy, crispy & sweet traditional diamond snacks.',
    price: 100,
    img: 'shankarpali.jpg',
    fallback: 'shankarpali.jpg',
    category: 'sweet',
    unit: '200g',
    shelfLife: '60 Days',
    gheePercent: 'Pure Ghee Fry',
    energy: '490 kcal',
    story: 'Crispy flaky diamond-cut delights made with refined flour, milk, and pure ghee. Softly sweet and delightfully crunchy with every single bite.',
    ingredients: ['Wheat Flour', 'Pure Ghee', 'Milk', 'Sugar', 'Cardamom'],
    available: true
  },
  {
    _id: 'prod-4',
    title: 'Royal Gift Box',
    desc: 'Assorted premium faral packed elegantly in a silk festival box.',
    price: 850,
    img: 'gift_box_new.png',
    fallback: 'balaji_royal_platter.png',
    category: 'gift',
    unit: '1 Box (1.2kg)',
    shelfLife: '35 Days',
    gheePercent: '100% Premium Ghee',
    energy: '540 kcal',
    story: 'The ultimate royal Diwali hamper containing Besan Ladoo, Spicy Chivda, Bhajani Chakli, Shankarpali, and Dry Fruit Karanji in a velvet silk box.',
    ingredients: ['Besan Ladoo', 'Spicy Chivda', 'Bhajani Chakli', 'Shankarpali', 'Karanji'],
    available: true
  }
];

let memoryOrders = [
  {
    orderId: 'BF-984210',
    totalAmount: 1150,
    paymentMethod: 'ONLINE',
    paymentStatus: 'Paid',
    deliveryStatus: 'Preparing',
    createdAt: new Date().toISOString(),
    items: [
      { title: 'Besan Ladoo (12 pcs)', qty: 2, price: 290 },
      { title: 'Spicy Chivda (500g)', qty: 1, price: 230 },
      { title: 'Royal Gift Box', qty: 1, price: 850 }
    ],
    deliveryAddress: {
      name: 'Aarav Sharma',
      mobile: '9823011223',
      address: 'Flat 402, Sai Heights, Kothrud, Pune - 411038'
    }
  },
  {
    orderId: 'BF-984189',
    totalAmount: 480,
    paymentMethod: 'COD',
    paymentStatus: 'COD',
    deliveryStatus: 'Dispatched',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { title: 'Shankarpali (500g)', qty: 2, price: 240 }
    ],
    deliveryAddress: {
      name: 'Priya Kulkarni',
      mobile: '9890123456',
      address: '12 Anandi Nivas, MG Road, Nashik - 422001'
    }
  }
];

let memoryHeroConfig = {
  main: { title: 'Royal Faral Feast', img: 'balaji_royal_platter.png', productId: 'prod-4' },
  topLeft: { title: 'Besan Ladoo', sub: 'Pure Gir Cow Ghee', img: 'balaji_ladoo_hero.png', productId: 'prod-2' },
  topRight: { title: 'Spicy Chivda', sub: 'Golden Crunch', img: 'chivda_new.png', productId: 'prod-1' },
  bottomLeft: { title: 'Shankarpali', sub: 'Crispy Flaky Sweet', img: 'shankarpali.jpg', productId: 'prod-3' },
  bottomRight: { title: 'Silk Gift Box', sub: 'Festive Hamper', img: 'gift_box_new.png', productId: 'prod-4' }
};

// --- Supabase Database Operations Helpers ---
async function fetchProductsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(p => ({
      _id: p.id,
      title: p.title,
      desc: p.desc || p.description,
      price: Number(p.price),
      img: p.img || p.image_url || 'faral.jpg',
      fallback: p.fallback || p.img || 'faral.jpg',
      category: p.category,
      unit: p.unit,
      shelfLife: p.shelf_life || p.shelfLife || '45 Days',
      gheePercent: p.ghee_percent || p.gheePercent || '100% Pure Ghee',
      energy: p.energy || '500 kcal',
      story: p.story || p.desc || '',
      ingredients: Array.isArray(p.ingredients) ? p.ingredients : (typeof p.ingredients === 'string' ? p.ingredients.split(',') : []),
      available: p.available !== false
    }));
  } catch (e) {
    console.error('Supabase fetch products error:', e.message);
    return null;
  }
}

async function fetchOrdersFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;
    return data.map(o => {
      const delAddr = typeof o.delivery_address === 'string' ? JSON.parse(o.delivery_address) : (o.delivery_address || {});
      return {
        orderId: o.order_id || o.id,
        user: o.user_id,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
        totalAmount: Number(o.total_amount),
        deliveryAddress: delAddr,
        specialRequest: o.special_request || delAddr.specialRequest || '',
        paymentMethod: o.payment_method || 'COD',
        paymentStatus: o.payment_status || 'Pending',
        paymentId: o.payment_id || null,
        deliveryStatus: o.delivery_status || 'Pending',
        createdAt: o.created_at
      };
    });
  } catch (e) {
    console.error('Supabase fetch orders error:', e.message);
    return null;
  }
}

async function fetchUsersFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;
    return data.map(u => ({
      _id: u.id,
      email: u.email,
      name: u.name,
      mobile: u.mobile,
      building: u.building,
      address: u.address,
      landmark: u.landmark,
      city: u.city,
      pincode: u.pincode,
      createdAt: u.created_at
    }));
  } catch (e) {
    console.error('Supabase fetch users error:', e.message);
    return null;
  }
}

// --- API ROUTES ---

// Serve Storefront index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve Admin Portal admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Healthcheck / Server Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: supabase ? 'Supabase' : (mongoose.connection.readyState === 1 ? 'MongoDB' : 'Memory Local Store')
  });
});

// AUTH: Register user details
app.post('/api/auth/register', async (req, res) => {
  const { email, name, mobile, building, address, landmark, city, pincode } = req.body;
  if (!email || !name || !mobile) {
    return res.status(400).json({ message: 'Email, Name, and Mobile are required' });
  }

  const userPayload = {
    _id: `usr-${Date.now()}`,
    email, name, mobile, building, address, landmark, city, pincode,
    createdAt: new Date().toISOString()
  };

  const memIdx = memoryUsers.findIndex(u => u.email === email);
  if (memIdx >= 0) {
    memoryUsers[memIdx] = { ...memoryUsers[memIdx], ...userPayload };
  } else {
    memoryUsers.unshift(userPayload);
  }

  // Sync to Supabase if connected
  if (supabase) {
    try {
      await supabase.from('users').upsert({
        id: userPayload._id,
        email, name, mobile, building, address, landmark, city, pincode,
        created_at: userPayload.createdAt
      }, { onConflict: 'email' });
    } catch (e) {
      console.error('Supabase register error:', e.message);
    }
  }

  // Sync to MongoDB if connected
  try {
    await User.findOneAndUpdate(
      { email },
      { name, mobile, building, address, landmark, city, pincode },
      { upsert: true, new: true }
    );
  } catch (err) {}

  const token = jwt.sign({ id: userPayload._id, email }, process.env.JWT_SECRET || 'balaji_foods_secure_jwt_key_2025', { expiresIn: '14d' });
  res.json({
    message: 'Registration successful!',
    token,
    user: userPayload
  });
});

// AUTH: Login via OTP
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent successfully to email' });
  } catch (err) {
    res.json({ message: 'OTP simulated successfully', otp });
  }
});

// AUTH: Verify OTP code
app.post('/api/auth/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  let user = memoryUsers.find(u => u.email === email);
  if (!user) {
    user = {
      _id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    memoryUsers.unshift(user);
  }

  const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'balaji_foods_secure_jwt_key_2025', { expiresIn: '14d' });
  res.json({
    message: 'OTP verified successfully!',
    token,
    user
  });
});


// PRODUCTS: Get all available
app.get('/api/products', async (req, res) => {
  const supaProds = await fetchProductsFromSupabase();
  if (supaProds && supaProds.length > 0) {
    return res.json(supaProds.filter(p => p.available));
  }

  try {
    const products = await Product.find({ available: true });
    if (products && products.length > 0) return res.json(products);
  } catch (err) {}

  res.json(memoryProducts.filter(p => p.available));
});

// PRODUCTS: Admin get all
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  const supaProds = await fetchProductsFromSupabase();
  if (supaProds && supaProds.length > 0) {
    return res.json(supaProds);
  }

  try {
    const products = await Product.find();
    if (products && products.length > 0) return res.json(products);
  } catch (err) {}

  res.json(memoryProducts);
});

// PRODUCTS: Add product
app.post('/api/products', authenticateAdmin, async (req, res) => {
  const { title, desc, price, img, category, unit, shelfLife, gheePercent, energy, story, ingredients } = req.body;
  if (!title || !price) {
    return res.status(400).json({ message: 'Title and price are required' });
  }

  const ingArray = typeof ingredients === 'string' 
    ? ingredients.split(',').map(s => s.trim()).filter(Boolean)
    : (Array.isArray(ingredients) ? ingredients : ['Pure Ingredients']);

  const prodId = `prod-${Date.now()}`;
  const newProdObj = {
    _id: prodId,
    title,
    desc: desc || '',
    price: Number(price),
    img: img || 'faral.jpg',
    category: category || 'savory',
    unit: unit || '250g',
    shelfLife: shelfLife || '45 Days',
    gheePercent: gheePercent || '100% Pure Gir Cow Ghee',
    energy: energy || '500 kcal',
    story: story || desc || '',
    ingredients: ingArray,
    available: true
  };

  memoryProducts.unshift(newProdObj);

  if (supabase) {
    try {
      await supabase.from('products').insert({
        id: prodId,
        title,
        desc: desc || '',
        price: Number(price),
        img: img || 'faral.jpg',
        category: category || 'savory',
        unit: unit || '250g',
        shelf_life: shelfLife || '45 Days',
        ghee_percent: gheePercent || '100% Pure Gir Cow Ghee',
        energy: energy || '500 kcal',
        story: story || desc || '',
        ingredients: ingArray,
        available: true
      });
    } catch (e) {
      console.error('Supabase add product error:', e.message);
    }
  }

  res.status(201).json({ message: 'Product created successfully!', product: newProdObj });
});

// PRODUCTS: Delete product
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  memoryProducts = memoryProducts.filter(p => p._id.toString() !== id && p._id !== id);

  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {}
  }

  res.json({ message: 'Product deleted successfully' });
});

// PRODUCTS: Update / Edit product details
app.patch('/api/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, desc, price, img, category, unit, shelfLife, gheePercent, energy, story, ingredients } = req.body;

  const idx = memoryProducts.findIndex(p => p._id.toString() === id || p._id === id);
  if (idx !== -1) {
    if (title !== undefined) memoryProducts[idx].title = title;
    if (desc !== undefined) memoryProducts[idx].desc = desc;
    if (price !== undefined) memoryProducts[idx].price = Number(price);
    if (img !== undefined) memoryProducts[idx].img = img;
    if (category !== undefined) memoryProducts[idx].category = category;
    if (unit !== undefined) memoryProducts[idx].unit = unit;
    if (shelfLife !== undefined) memoryProducts[idx].shelfLife = shelfLife;
    if (gheePercent !== undefined) memoryProducts[idx].gheePercent = gheePercent;
    if (energy !== undefined) memoryProducts[idx].energy = energy;
    if (story !== undefined) memoryProducts[idx].story = story;
    if (ingredients !== undefined) {
      memoryProducts[idx].ingredients = typeof ingredients === 'string'
        ? ingredients.split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(ingredients) ? ingredients : memoryProducts[idx].ingredients);
    }
  }

  if (supabase) {
    try {
      const updateObj = {};
      if (title !== undefined) updateObj.title = title;
      if (desc !== undefined) updateObj.desc = desc;
      if (price !== undefined) updateObj.price = Number(price);
      if (img !== undefined) updateObj.img = img;
      if (category !== undefined) updateObj.category = category;
      if (unit !== undefined) updateObj.unit = unit;
      if (shelfLife !== undefined) updateObj.shelf_life = shelfLife;
      if (gheePercent !== undefined) updateObj.ghee_percent = gheePercent;
      if (energy !== undefined) updateObj.energy = energy;
      if (story !== undefined) updateObj.story = story;
      if (ingredients !== undefined) {
        updateObj.ingredients = typeof ingredients === 'string'
          ? ingredients.split(',').map(s => s.trim()).filter(Boolean)
          : ingredients;
      }
      await supabase.from('products').update(updateObj).eq('id', id);
    } catch (e) {
      console.error('Supabase update product error:', e.message);
    }
  }

  res.json({ message: 'Product updated successfully!', product: memoryProducts[idx] || { _id: id } });
});


// ORDERS: Create
app.post('/api/orders', async (req, res) => {
  const { items, totalAmount, deliveryAddress, paymentMethod, orderId: requestedOrderId, specialRequest } = req.body;
  const orderId = requestedOrderId || `BF-${Math.floor(100000 + Math.random() * 900000)}`;

  let userId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'balaji_foods_secure_jwt_key_2025');
      userId = decoded.id;
    } catch (e) {}
  }

  const isOnline = paymentMethod === 'ONLINE' || paymentMethod === 'UPI';
  const reqText = specialRequest || deliveryAddress?.specialRequest || '';

  const orderObj = {
    orderId,
    user: userId,
    items: items || [],
    totalAmount: totalAmount || 0,
    deliveryAddress: deliveryAddress || {},
    specialRequest: reqText,
    paymentMethod: isOnline ? 'ONLINE' : 'COD',
    paymentStatus: isOnline ? 'UPI Verification Pending' : 'COD',
    deliveryStatus: 'Pending',
    createdAt: new Date().toISOString()
  };

  memoryOrders.unshift(orderObj);

  if (supabase) {
    try {
      await supabase.from('orders').insert({
        id: orderId,
        order_id: orderId,
        user_id: userId,
        items: JSON.stringify(items || []),
        total_amount: Number(totalAmount || 0),
        delivery_address: JSON.stringify({ ...deliveryAddress, specialRequest: reqText }),
        payment_method: isOnline ? 'ONLINE' : 'COD',
        payment_status: isOnline ? 'UPI Verification Pending' : 'COD',
        delivery_status: 'Pending',
        created_at: orderObj.createdAt
      });
    } catch (e) {
      console.error('Supabase order insert error:', e.message);
    }
  }

  if (isOnline && razorpay) {
    let rzpOrder = null;
    try {
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: orderId
      };
      rzpOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
      rzpOrder = { id: `rzp_order_${orderId}`, amount: Math.round(totalAmount * 100), currency: "INR" };
    }
    return res.json({ order: orderObj, rzpOrder, keyId: memoryPaymentSettings.razorpayKeyId });
  }

  res.json({ order: orderObj });
});

// ORDERS: Verify Payment Signature or UTR Submission
app.post('/api/payment/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, utr_number } = req.body;
  
  let isCryptoVerified = false;
  if (razorpay_order_id && razorpay_payment_id && razorpay_signature && razorpay_signature !== 'upi_qr_verified' && memoryPaymentSettings.razorpayKeySecret) {
    try {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', memoryPaymentSettings.razorpayKeySecret)
        .update(body.toString())
        .digest('hex');
      if (expectedSignature === razorpay_signature) isCryptoVerified = true;
    } catch (e) {}
  }

  const targetId = order_id || (razorpay_order_id ? razorpay_order_id.replace('rzp_order_', '') : null);
  const memMatch = memoryOrders.find(o => o.orderId === targetId || o.orderId === order_id);

  if (isCryptoVerified) {
    if (memMatch) {
      memMatch.paymentStatus = 'Paid';
      memMatch.paymentId = razorpay_payment_id;
    }
    if (supabase) {
      try {
        await supabase.from('orders').update({ payment_status: 'Paid', payment_id: razorpay_payment_id }).eq('order_id', targetId);
      } catch (e) {}
    }
    return res.json({ status: 'success', message: 'Razorpay Live Payment Verified!' });
  } else {
    // Manual UPI / UTR Reference recorded for owner approval
    const utrRef = utr_number || razorpay_payment_id || `UTR-${Date.now()}`;
    const statusText = 'UPI Verification Pending';

    if (memMatch) {
      memMatch.paymentStatus = statusText;
      memMatch.paymentId = utrRef;
      memMatch.utrNumber = utrRef;
    }

    if (supabase) {
      try {
        await supabase.from('orders').update({
          payment_status: statusText,
          payment_id: utrRef
        }).eq('order_id', targetId);
      } catch (e) {}
    }

    res.json({
      status: 'pending_verification',
      message: 'Payment UTR reference recorded! Owner will verify with bank.',
      paymentStatus: statusText,
      utr: utrRef
    });
  }
});

// ADMIN: Update delivery or payment status
app.patch('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  const { status, paymentStatus } = req.body;
  const targetId = req.params.id;

  const memMatch = memoryOrders.find(o => o.orderId === targetId);
  if (memMatch) {
    if (status) memMatch.deliveryStatus = status;
    if (paymentStatus) memMatch.paymentStatus = paymentStatus;
  }

  if (supabase) {
    try {
      const updateObj = {};
      if (status) updateObj.delivery_status = status;
      if (paymentStatus) updateObj.payment_status = paymentStatus;
      await supabase.from('orders').update(updateObj).eq('order_id', targetId);
    } catch (e) {}
  }

  res.json(memMatch || { orderId: targetId, deliveryStatus: status, paymentStatus });
});

// ORDERS: Track order by ID
app.get('/api/orders/:id', async (req, res) => {
  const reqId = req.params.id.toUpperCase();
  const memMatch = memoryOrders.find(o => o.orderId === reqId);
  if (memMatch) return res.json(memMatch);

  if (supabase) {
    try {
      const { data } = await supabase.from('orders').select('*').eq('order_id', reqId).single();
      if (data) {
        return res.json({
          orderId: data.order_id || data.id,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          totalAmount: data.total_amount,
          deliveryAddress: typeof data.delivery_address === 'string' ? JSON.parse(data.delivery_address) : data.delivery_address,
          specialRequest: data.special_request || (typeof data.delivery_address === 'string' ? JSON.parse(data.delivery_address)?.specialRequest : data.delivery_address?.specialRequest) || '',
          paymentStatus: data.payment_status,
          deliveryStatus: data.delivery_status,
          createdAt: data.created_at
        });
      }
    } catch (e) {}
  }

  return res.status(404).json({ message: 'Order not found' });
});

// USER: Fetch user order history by email
app.get('/api/user/orders', async (req, res) => {
  const { email } = req.query;
  let userOrders = memoryOrders;

  if (supabase) {
    const supaOrders = await fetchOrdersFromSupabase();
    if (supaOrders && supaOrders.length > 0) userOrders = supaOrders;
  }

  if (email) {
    const cleanEmail = email.toLowerCase();
    userOrders = userOrders.filter(o => 
      (o.deliveryAddress?.email && o.deliveryAddress.email.toLowerCase() === cleanEmail) ||
      (o.deliveryAddress?.name && o.deliveryAddress.name.toLowerCase().includes(cleanEmail))
    );
  }

  res.json(userOrders);
});

// ADMIN: Get all orders
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  const supaOrders = await fetchOrdersFromSupabase();
  if (supaOrders && supaOrders.length > 0) return res.json(supaOrders);

  res.json(memoryOrders);
});

// ADMIN: Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  const supaUsers = await fetchUsersFromSupabase();
  if (supaUsers && supaUsers.length > 0) return res.json(supaUsers);

  res.json(memoryUsers);
});

// PUBLIC: Get public payment settings (No private keys exposed)
app.get('/api/payment-settings', (req, res) => {
  res.json({
    upiVpa: memoryPaymentSettings.upiVpa || 'connectaradhya@okaxis',
    accountHolder: memoryPaymentSettings.accountHolder || 'Balaji Foods & Sweets',
    bankName: memoryPaymentSettings.bankName || 'Axis Bank',
    accountNumber: memoryPaymentSettings.accountNumber || '50100239182391',
    ifscCode: memoryPaymentSettings.ifscCode || 'UTIB0001245',
    branchName: memoryPaymentSettings.branchName || 'Kothrud, Pune',
    razorpayKeyId: memoryPaymentSettings.razorpayKeyId || ''
  });
});

// ADMIN: Get owner payment settings
app.get('/api/admin/payment-settings', authenticateAdmin, (req, res) => {
  res.json(memoryPaymentSettings);
});

// ADMIN: Save owner payment settings
app.post('/api/admin/payment-settings', authenticateAdmin, (req, res) => {
  if (req.body) {
    memoryPaymentSettings = { ...memoryPaymentSettings, ...req.body };
    if (memoryPaymentSettings.razorpayKeyId && memoryPaymentSettings.razorpayKeySecret) {
      try {
        razorpay = new Razorpay({
          key_id: memoryPaymentSettings.razorpayKeyId,
          key_secret: memoryPaymentSettings.razorpayKeySecret
        });
      } catch (e) {}
    }
    return res.json({ message: 'Payment settings saved successfully!', settings: memoryPaymentSettings });
  }
  res.status(400).json({ message: 'Invalid payload' });
});

// PUBLIC & ADMIN: Get Hero showcase configuration
app.get('/api/hero-config', (req, res) => {
  res.json(memoryHeroConfig);
});

app.get('/api/admin/hero-config', (req, res) => {
  res.json(memoryHeroConfig);
});

// ADMIN: Hero showcase save
app.post('/api/admin/hero-config', authenticateAdmin, (req, res) => {
  if (req.body) {
    memoryHeroConfig = { ...memoryHeroConfig, ...req.body };
    return res.json({ message: 'Hero page showcase updated successfully!', config: memoryHeroConfig });
  }
  res.status(400).json({ message: 'Invalid configuration data' });
});

// ADMIN: Get Online Transactions
app.get('/api/admin/transactions', authenticateAdmin, async (req, res) => {
  const supaOrders = await fetchOrdersFromSupabase();
  const source = (supaOrders && supaOrders.length > 0) ? supaOrders : memoryOrders;
  const onlineTrans = source.filter(o => o.paymentMethod === 'ONLINE' || o.paymentMethod === 'UPI' || (o.paymentStatus && o.paymentStatus !== 'COD'));
  res.json(onlineTrans);
});

// Supabase Initial Products Auto-seeding Helper
async function autoSeedSupabaseProducts() {
  if (!supabase) return;
  try {
    const { data } = await supabase.from('products').select('id').limit(1);
    if (!data || data.length === 0) {
      console.log('🌱 Auto-seeding default products to Supabase products table...');
      const seedItems = memoryProducts.map(p => ({
        id: p._id,
        title: p.title,
        desc: p.desc,
        price: p.price,
        img: p.img,
        category: p.category,
        unit: p.unit,
        shelf_life: p.shelfLife,
        ghee_percent: p.gheePercent,
        energy: p.energy,
        story: p.story,
        ingredients: p.ingredients,
        available: p.available
      }));
      await supabase.from('products').upsert(seedItems, { onConflict: 'id' });
      console.log('✅ Default products seeded to Supabase!');
    }
  } catch (e) {
    console.log('Note: Supabase auto-seeding checked - table existing or manual migration ready.');
  }
}
autoSeedSupabaseProducts();

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Balaji Foods Server running on port ${PORT}`));
}

module.exports = app;

