const express = require('express');
const router = express.Router();

// Заглушка для получения профиля пользователя
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    data: {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      phone: '+7 777 123 45 67',
      created_at: new Date()
    }
  });
});

router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  res.json({
    success: true,
    data: {
      id: userId,
      ...updateData,
      updated_at: new Date()
    }
  });
});

module.exports = router; 