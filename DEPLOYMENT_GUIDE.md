# 🚀 Balaji Foods — Complete Vercel & Supabase Deployment Guide

This guide provides step-by-step instructions to deploy **Balaji Foods** to **Vercel** with a **Supabase** database, configure security, and manage payments (including options if you do not want to set up Razorpay right now).

---

## 📋 1. Project Requirements & Prerequisites

Before deploying, ensure you have:
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (Free Hobby tier is sufficient).
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com) (Free Tier includes PostgreSQL database & REST API).
3. **GitHub Repository**: (Optional but recommended) Push this project folder to your GitHub account.
4. **Node.js**: Installed locally (v18 or higher) if running local tests.

---

## 🗄️ 2. Setting Up Supabase Database

### Step 2.1: Create a Supabase Project
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, enter project name `balaji-foods`, and set a secure database password.
3. Select your region (e.g. `Mumbai / South Asia` for fastest latency in India).
4. Click **Create new project** and wait 1–2 minutes for provision.

### Step 2.2: Get Supabase Credentials
1. In your Supabase project left sidebar, click **Project Settings** (gear icon) ➔ **API**.
2. Copy the following credentials:
   - **Project URL** (`SUPABASE_URL`) — e.g. `https://xyzcompany.supabase.co`
   - **service_role secret key** (`SUPABASE_SERVICE_ROLE_KEY`) OR **anon public key** (`SUPABASE_KEY`)

### Step 2.3: Run SQL Setup Script
1. In Supabase left sidebar, click **SQL Editor**.
2. Click **New query**, paste the SQL script below, and click **Run**:

```sql
-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "desc" TEXT,
    price NUMERIC NOT NULL,
    img TEXT,
    category TEXT,
    unit TEXT,
    shelf_life TEXT,
    ghee_percent TEXT,
    energy TEXT,
    story TEXT,
    ingredients JSONB,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    delivery_address JSONB NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'Pending',
    payment_id TEXT,
    delivery_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    building TEXT,
    address TEXT,
    landmark TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Seed Initial Products Data
INSERT INTO public.products (id, title, "desc", price, img, category, unit, shelf_life, ghee_percent, energy, story, ingredients, available)
VALUES 
('prod-1', 'Spicy Chivda', 'Crunchy, spicy Maharashtrian chivda roasted to golden perfection.', 120, 'chivda_new.png', 'savory', '250g', '45 Days', 'Pure Groundnut Oil & Ghee', '480 kcal', 'Prepared using traditional thin flattened rice (pohe), roasted peanuts, fried curry leaves, and secret Maharashtrian spices.', '["Poha", "Peanuts", "Cashews", "Curry Leaves", "Spices"]', true),
('prod-2', 'Besan Ladoo', 'Sweet, aromatic, pure ghee roasted besan ladoo topped with almonds.', 150, 'balaji_ladoo_hero.png', 'sweet', '6 pcs', '30 Days', '100% Pure Gir Cow Ghee', '530 kcal', 'Slow roasted gram flour in pure golden ghee until aromatic, rolled gently with cardamom and roasted nuts.', '["Pure Cow Ghee", "Gram Flour", "Sugar", "Cardamom", "Almonds"]', true),
('prod-3', 'Shankarpali', 'Golden bites of joy, crispy & sweet traditional diamond snacks.', 100, 'shankarpali.jpg', 'sweet', '200g', '60 Days', 'Pure Ghee Fry', '490 kcal', 'Crispy flaky diamond-cut delights made with refined flour, milk, and pure ghee.', '["Wheat Flour", "Pure Ghee", "Milk", "Sugar", "Cardamom"]', true),
('prod-4', 'Royal Gift Box', 'Assorted premium faral packed elegantly in a silk festival box.', 850, 'gift_box_new.png', 'gift', '1 Box (1.2kg)', '35 Days', '100% Premium Ghee', '540 kcal', 'The ultimate royal Diwali hamper containing Besan Ladoo, Spicy Chivda, Bhajani Chakli, Shankarpali, and Karanji.', '["Besan Ladoo", "Spicy Chivda", "Bhajani Chakli", "Shankarpali"]', true)
ON CONFLICT (id) DO NOTHING;
```

---

## 🔺 3. Deploying to Vercel

### Option A: Via GitHub (Recommended)
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import your GitHub repository.
4. Framework Preset: Choose **Other** (Root directory `./`).
5. Open **Environment Variables** section and add the following:

| Key | Value Example | Required? |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://yourproject.supabase.co` | **Yes** |
| `SUPABASE_KEY` | `your_supabase_anon_key_or_service_role` | **Yes** |
| `JWT_SECRET` | `your_random_secret_string_2025` | **Yes** |
| `ADMIN_PASSWORD` | `your_admin_secret_password` | **Yes** (Default: `admin123`) |
| `RAZORPAY_KEY_ID` | `rzp_live_xxx` | *Optional* |
| `RAZORPAY_KEY_SECRET` | `secret_xxx` | *Optional* |

6. Click **Deploy**. Vercel will build and deploy your app in seconds!

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 💳 4. Non-Razorpay Payment Options (If You Don't Want Razorpay Right Now)

If you do **not** want to sign up or configure Razorpay right now, **the website is already fully optimized to work without Razorpay!**

### Option 1: Direct Instant UPI QR Code + Bank Transfer (Recommended)
- Customers selecting UPI will see a **dynamic UPI QR Code** generated with the exact order total (scannable via Google Pay, PhonePe, Paytm, BHIM).
- They scan & pay directly into your bank account without any transaction fees!
- You can configure your UPI VPA & Bank details directly in the Admin Panel or environment variables:
  - **UPI VPA**: `connectaradhya@okaxis`
  - **Account Holder**: `Balaji Foods & Sweets`
  - **Bank**: `Axis Bank`
  - **Account No.**: `50100239182391`
  - **IFSC Code**: `UTIB0001245`

### Option 2: Cash on Delivery (COD)
- Customers select **Cash on Delivery** during checkout.
- The order is placed instantly, recorded in your Admin Dashboard, and marked as `COD / Pending`.

### Option 3: Future Razorpay Integration (Whenever You Are Ready)
When you decide to enable Razorpay:
1. Sign up at [razorpay.com](https://razorpay.com).
2. Go to **Settings ➔ API Keys** and generate **Key ID** and **Key Secret**.
3. Enter them in your Vercel Environment Variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) or update them directly inside the Admin Dashboard under **Owner Payment Settings**.

---

## 🔒 5. Security & Protection Features Built-in

1. **Admin Route Protection (`X-Admin-Password`)**:
   All administrative backend endpoints (`/api/admin/*`) require an `X-Admin-Password` header matching your `ADMIN_PASSWORD` environment variable.
2. **Sensitive Secret Isolation**:
   Private API keys (such as `RAZORPAY_KEY_SECRET` or `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly inside backend serverless functions and never exposed to public website clients.
3. **JWT Token Signing**:
   User authentication tokens are signed with a strong `JWT_SECRET`.
4. **Resilient Local Database Fallback**:
   If database connectivity is temporarily interrupted during maintenance, the website automatically falls back to secure memory storage so customer orders are never lost or blocked!

---

## 📱 6. Mobile Responsiveness Polish Highlights

- **Mobile Navigation Drawer**: Sliding touch-friendly navigation menu accessible via hamburger button on mobile header.
- **Responsive Hero Accordion**: Smooth vertical expansion accordion on mobile screens (< 640px) replacing tight horizontal strips.
- **Admin Mobile Card Transformation**: Dense admin data tables convert automatically into clean, readable mobile cards on small screens.
- **Safe Area Inset Support**: Cart and checkout modals respect iPhone/Android swipe navigation bars.

---

🎉 **Your website is 100% prepared, secure, and ready for deployment on Vercel with Supabase!**
