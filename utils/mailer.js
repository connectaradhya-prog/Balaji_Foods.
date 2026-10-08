const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use host/port for other services
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Balaji Foods" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Faral Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #8A1C14;">🪔 Balaji Foods Login 🪔</h2>
        <p>Use the One-Time Password (OTP) below to log in to your account. This code is valid for 10 minutes.</p>
        <div style="font-size: 2rem; font-weight: bold; color: #E37340; margin: 20px 0; letter-spacing: 5px;">${otp}</div>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 0.8rem; color: #777;">Celebrating Diwali with Royal Flavours</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

const sendOrderConfirmation = async (email, order) => {
    const itemsList = order.items.map(i => `<li>${i.qty}x ${i.title} - ₹${i.price * i.qty}</li>`).join('');
    
    const mailOptions = {
      from: `"Balaji Foods" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmed - ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #8A1C14;">Order Confirmed! 🪔</h2>
          <p>Hi, your order <strong>${order.orderId}</strong> has been successfully placed.</p>
          <h3>Order Details:</h3>
          <ul>${itemsList}</ul>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Status:</strong> ${order.paymentStatus === 'Paid' ? 'Paid - We are preparing your snacks!' : 'Pending - COD Selected'}</p>
          <hr>
          <p>You can track your order live on our website using ID: <strong>${order.orderId}</strong></p>
          <p>Thank you for choosing Balaji Foods!</p>
        </div>
      `
    };
    return transporter.sendMail(mailOptions);
  };

module.exports = { sendOTP, sendOrderConfirmation };
