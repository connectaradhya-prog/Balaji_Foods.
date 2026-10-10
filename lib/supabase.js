const dotenv = require('dotenv');
dotenv.config();

let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  // Package optional fallback
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

const isValidUrl = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('example.supabase.co');
const isValidKey = supabaseKey && (supabaseKey.startsWith('eyJ') || supabaseKey.startsWith('sb_') || supabaseKey.length > 15);

if (createClient && isValidUrl && isValidKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client Connected Successfully');
  } catch (err) {
    console.error('⚠️ Error initializing Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not configured or key invalid - running in resilient local database mode.');
}

module.exports = supabase;

