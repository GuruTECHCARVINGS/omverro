const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const prRoutes = require('./routes/prRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware
app.use(cors({
  origin: [
    "http://127.0.0.1:5500/index.html",
    "http://localhost:5500",
    "https://omverro.vercel.app",
    "https://https://omverro.vercel.app/index.html#"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor_portal';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/prs', prRoutes);
app.use('/api', dashboardRoutes);

// Dummy users with roles (buyer or vendor)
const users = [
  { email: 'anshika@omverro.com', password: 'anshika123', role: 'buyer' },
  { email: 'rithesh@omverro.com', password: 'rithesh123', role: 'vendor' },
  { email: 'gurudatt@omverro.com', password: 'gurudatt123', role: 'vendor' },
  { email: 'shashidhar@omverro.com', password: 'shashi123', role: 'buyer' },
   { email: 'vendor@omverro.com', password: 'vendor123', role: 'vendor' },
    { email: 'buyer@omverro.com', password: 'buyer123', role: 'buyer' },
];

// Login endpoint
app.post('/login', (req, res) => {
  // Expect { email, password, role }
  const { email, password, role } = req.body;

  // If role provided, require role match; otherwise allow match by email/password only (backward compatible)
  const user = users.find(u => u.email === email && u.password === password && (!role || u.role === role));

  if (user) {
    // simple token for demo purposes (not a real JWT)
    const token = Buffer.from(`${user.email}:${user.role}:${Date.now()}`).toString('base64');
    res.json({ message: 'Login successful', status: 'success', token, role: user.role, email: user.email });
  } else {
    res.status(401).json({ message: 'Invalid credentials or role', status: 'fail' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
//   console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor_portal'}`);
// });

module.exports = app; // Export app for testing or serverless deployment
