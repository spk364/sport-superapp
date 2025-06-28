const express = require('express');
const router = express.Router();

// Простая заглушка для аутентификации
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: email,
        name: 'Test User'
      }
    }
  });
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: email,
        name: name
      }
    }
  });
});

module.exports = router; 