const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  { title: 'Spicy Chivda', desc: 'Crunchy, spicy, perfect for evenings.', price: 120, img: 'chivda_new.png', category: 'savory', fallback: 'chivda.jpg', unit: '250g' },
  { title: 'Besan Ladoo', desc: 'Sweet, aromatic, pure ghee roasted.', price: 150, img: 'ladoo.jpg', category: 'sweet', fallback: 'ladoo.jpg', unit: '6 pcs' },
  { title: 'Shankarpali', desc: 'Golden bites of joy, crispy & sweet.', price: 100, img: 'shankarpali.jpg', category: 'sweet', fallback: 'shankarpali.jpg', unit: '200g' },
  { title: 'Royal Gift Box', desc: 'Assorted premium faral in a silk box.', price: 850, img: 'gift_box_new.png', category: 'gift', fallback: 'faral.jpg', unit: '1 Box' },
  { title: 'Bhajani Chakli', desc: 'Crispy authentic spiked chakli.', price: 140, img: 'faral.jpg', category: 'savory', fallback: 'faral.jpg', unit: '200g' },
  { title: 'Chocolate', desc: 'Sweet treats for everyone.', price: 5, img: 'Chocolate.jpg', category: 'sweet', fallback: 'Chocolate.jpg', unit: '1 pc' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    
    await Product.deleteMany({});
    console.log('Cleared existing products.');
    
    await Product.insertMany(products);
    console.log('Seeded initial products successfully!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

seedDB();
