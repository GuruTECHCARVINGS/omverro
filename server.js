const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Dummy users with types
const users = [
  // { email: 'vendor@techcarvings.com', password: 'vendorpass', type: 'vendor' },
  // { email: 'buyer@techcarvings.com', password: 'buyerpass', type: 'buyer' }
  {email:'anshika@omverro.com', password:'anshika123'},
   {email:'rithesh@omverro.com', password:'rithesh123'},
    {email:'gurudatt@omverro.com', password:'gurudatt123'},
     {email:'shashidhar@omverro.com', password:'shashi123'},
];

// Login endpoint
app.post('/login', (req, res) => {
  // const { email, password, type } = req.body;
  // const user = users.find(u => u.email === email && u.password === password && u.type === type);
const { email, password } = req.body;
const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: `Login successful`, status: 'success' });
  } else {
    res.status(401).json({ message: 'Invalid credentials or user type', status: 'fail' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
