const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  price: { type: Number, required: true },
  img: { type: String },
  fallback: { type: String },
  category: { type: String, enum: ['savory', 'sweet', 'gift', 'all'], default: 'all' },
  unit: { type: String, default: '250g' },
  shelfLife: { type: String, default: '45 Days' },
  gheePercent: { type: String, default: '100% Pure Gir Cow Ghee' },
  energy: { type: String, default: '500 kcal' },
  story: { type: String },
  ingredients: [{ type: String }],
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
