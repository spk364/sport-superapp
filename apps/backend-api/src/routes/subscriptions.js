const express = require('express');
const router = express.Router();

// В реальном приложении это должно быть в базе данных
// Временно импортируем из payments.js
let userSubscriptions = [];

/**
 * GET /api/v1/subscriptions/user/:clientId
 * Получение активной подписки пользователя
 */
router.get('/user/:clientId', (req, res) => {
  try {
    const { clientId } = req.params;
    
    const subscription = userSubscriptions.find(s => 
      s.clientId === clientId && s.status === 'active'
    );

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'Активная подписка не найдена'
      });
    }

    // Проверяем, не истекла ли подписка
    const now = new Date();
    if (subscription.expiresAt < now) {
      subscription.status = 'expired';
      return res.json({
        success: true,
        data: null,
        message: 'Подписка истекла'
      });
    }

    res.json({
      success: true,
      data: {
        id: subscription.id,
        package_id: subscription.packageId,
        package_name: subscription.packageName,
        status: subscription.status,
        sessions_remaining: subscription.sessionsRemaining,
        is_unlimited: subscription.isUnlimited,
        activated_at: subscription.activatedAt,
        expires_at: subscription.expiresAt,
        days_remaining: Math.ceil((subscription.expiresAt - now) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения подписки'
    });
  }
});

/**
 * POST /api/v1/subscriptions/:subscriptionId/use-session
 * Использование сессии из подписки
 */
router.post('/:subscriptionId/use-session', (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = userSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Подписка не найдена'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Подписка неактивна'
      });
    }

    // Проверяем, не истекла ли подписка
    if (subscription.expiresAt < new Date()) {
      subscription.status = 'expired';
      return res.status(400).json({
        success: false,
        error: 'Подписка истекла'
      });
    }

    // Проверяем, есть ли доступные сессии
    if (!subscription.isUnlimited && subscription.sessionsRemaining <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Нет доступных сессий'
      });
    }

    // Списываем сессию
    if (!subscription.isUnlimited) {
      subscription.sessionsRemaining -= 1;
    }

    res.json({
      success: true,
      data: {
        sessions_remaining: subscription.sessionsRemaining,
        is_unlimited: subscription.isUnlimited
      },
      message: 'Сессия использована'
    });
  } catch (error) {
    console.error('Use session error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка использования сессии'
    });
  }
});

/**
 * GET /api/v1/subscriptions/user/:clientId/history
 * История покупок пакетов пользователя
 */
router.get('/user/:clientId/history', (req, res) => {
  try {
    const { clientId } = req.params;
    
    const subscription = userSubscriptions.find(s => s.clientId === clientId);
    
    if (!subscription || !subscription.packageHistory) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: subscription.packageHistory.map(history => ({
        package_id: history.packageId,
        purchased_at: history.purchasedAt,
        sessions: history.sessions
      }))
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения истории подписок'
    });
  }
});

module.exports = router; 