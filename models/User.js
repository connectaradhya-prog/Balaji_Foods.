const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  mobile: { type: String },
  building: { type: String },
  address: { type: String },
  landmark: { type: String },
  city: { type: String },
  pincode: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

