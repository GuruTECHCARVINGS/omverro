const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Dummy users with roles (buyer or vendor)
const users = [
  { email: 'anshika@omverro.com', password: 'anshika123', role: 'buyer' },
  { email: 'rithesh@omverro.com', password: 'rithesh123', role: 'vendor' },
  { email: 'gurudatt@omverro.com', password: 'gurudatt123', role: 'vendor' },
  { email: 'shashidhar@omverro.com', password: 'shashi123', role: 'buyer' },
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
