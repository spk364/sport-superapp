const express = require('express');
const router = express.Router();

// Заглушка для получения тренировок пользователя
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Силовая тренировка',
        type: 'strength',
        date: new Date(),
        duration: 90,
        status: 'scheduled'
      }
    ]
  });
});

router.post('/', (req, res) => {
  const workoutData = req.body;
  
  res.json({
    success: true,
    data: {
      id: Math.random().toString(36).substr(2, 9),
      ...workoutData,
      created_at: new Date()
    }
  });
});

module.exports = router; 