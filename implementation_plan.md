# Faral Website Upgrade - Implementation Plan

This project involves transforming the static "Balaji Foods" (Faral) landing page into a fully functional, mobile-optimized festive food store with a robust backend, database, and real-time order tracking.

## User Review Required

> [!IMPORTANT]
> To make the site fully functional for your clients, we need to decide on a few external tools. I have recommended the best options for an Indian food business below:
>
> 1. **Payment Gateway**: I recommend **Razorpay** as it handles UPI (GPay, PhonePe) extremely well in India. Do you have a Razorpay account/API keys, or should I use a different one (like Stripe or PayPal)?
> 2. **Email Service**: For sending order confirmations, should I use **Nodemailer with Gmail** (simpler for start) or a professional service like **SendGrid**?
> 3. **Database**: I will use **MongoDB Atlas** (Cloud). I can set up the schema, but you will eventually need to provide your own connection string for production.
> 4. **Admin Dashboard**: I will create a simple password-protected path (e.g., `/admin`) for your team to update order statuses. Is this acceptable?

## Proposed Changes

### Backend & API Infrastructure

I will create a standard Node.js/Express backend to handle sensitive operations and data persistence.

#### [NEW] [server.js](file:///d:/Website%20making/Faral/server.js)
- Express server setup.
- API endpoints:
  - `GET /api/products`: Fetch menu from MongoDB.
  - `POST /api/orders`: Create a new order (saves to DB, returns Order ID).
  - `GET /api/orders/:id`: Fetch order status for tracking.
  - `POST /api/payment/verify`: Confirm Razorpay payment success.
  - `PATCH /api/admin/orders/:id`: Update status (Preparing, Dispatched, etc.).

#### [NEW] `models/Product.js`, `models/Order.js`
- MongoDB schemas for products and orders.

#### [NEW] [.env](file:///d:/Website%20making/Faral/.env)
- Storage for API keys (Razorpay ID, Secret, DB URI, Email credentials).

---

### Frontend Enhancements

I will update the current `index.html` and logic to interact with the new backend.

#### [MODIFY] [index.html](file:///d:/Website%20making/Faral/index.html)
- **Menu System**: Replace hardcoded array with an `API fetch` call.
- **Skeleton Screens**: Add CSS animations for placeholder cards while menu/tracking loads.
- **Micro-interactions**: Enhanced button feedback (loading spinners during "Add to Cart" and "Checkout").
- **Mobile Optimizations**: 
  - Add `touch-action: manipulation` to buttons for faster taps.
  - Fix horizontal overflow issues.
  - Increase padding/size for mobile tap targets.
- **Toast Notifications**: Implement a non-intrusive toast system for "Item Added", "Payment Successful", etc.
- **Real Tracking**: Connect the existing tracking modal to the `GET /api/orders/:id` endpoint.
- **PDF Receipt**: Implement `jsPDF` for immediate high-quality receipt downloads on the success page.

---

### Advanced Features

#### [NEW] `success.html`
- A dedicated page users see after a successful transaction.
- Prominent "Download Receipt" button.
- "WhatsApp Order Reference" shortcut.

#### [NEW] `admin.html`
- A simple table showing all orders.
- Dropdown to change status (Pending -> Preparing -> Dispatched -> Delivered).

---

## Open Questions

> [!QUESTION]
> 1. Should the "Download Receipt" be a PDF generated on the server and emailed, or just a client-side download? (I recommend both for better reliability).
> 2. For the WhatsApp integration, should I use the pre-filled message format we already have, or try to integrate with a WhatsApp Business API (more complex/costly)?

## Verification Plan

### Automated Tests
- Basic integration tests for API routes.
- Browser test: Simulate a full order flow (Add to cart -> Checkout -> Mock Payment -> Receipt Download).

### Manual Verification
1. Verify mobile responsiveness on Chrome DevTools (iPhone/Pixel presets).
2. Check email delivery to a test mailbox.
3. Verify MongoDB data persistence after each order.
4. Test "Invalid Order ID" handles in the tracking modal.
