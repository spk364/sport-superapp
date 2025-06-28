const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const kaspiService = require('../services/kaspiService');

const router = express.Router();

// В реальном приложении это должно быть в базе данных
let payments = [];
let userSubscriptions = [];

/**
 * GET /api/v1/payments/packages
 * Получение доступных пакетов тренировок
 */
router.get('/packages', (req, res) => {
  try {
    const packages = kaspiService.getTrainingPackages();
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения пакетов тренировок'
    });
  }
});

/**
 * POST /api/v1/payments/create
 * Создание нового платежа
 */
router.post('/create', [
  body('packageId').notEmpty().withMessage('ID пакета обязателен'),
  body('clientId').notEmpty().withMessage('ID клиента обязателен'),
  body('clientName').notEmpty().withMessage('Имя клиента обязательно'),
  body('clientPhone').optional().isMobilePhone('any').withMessage('Некорректный номер телефона'),
  body('clientEmail').optional().isEmail().withMessage('Некорректный email')
], async (req, res) => {
  try {
    // Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const { packageId, clientId, clientName, clientPhone, clientEmail } = req.body;

    // Получаем информацию о пакете
    const packages = kaspiService.getTrainingPackages();
    const selectedPackage = packages.find(pkg => pkg.id === packageId);

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        error: 'Пакет не найден'
      });
    }

    // Создаем заказ
    const orderId = `order_${uuidv4()}`;
    const paymentData = {
      amount: selectedPackage.price,
      currency: selectedPackage.currency,
      orderId: orderId,
      description: `Оплата: ${selectedPackage.name} - ${selectedPackage.description}`,
      clientId: clientId
    };

    // Создаем QR код через Kaspi
    const qrResult = await kaspiService.createQRPayment(paymentData);

    if (!qrResult.success) {
      return res.status(400).json({
        success: false,
        error: qrResult.error
      });
    }

    // Сохраняем платеж (в реальном приложении - в БД)
    const payment = {
      id: uuidv4(),
      orderId: orderId,
      kaspiPaymentId: qrResult.data.payment_id,
      packageId: packageId,
      package: selectedPackage,
      clientId: clientId,
      clientName: clientName,
      clientPhone: clientPhone,
      clientEmail: clientEmail,
      amount: selectedPackage.price,
      currency: selectedPackage.currency,
      status: 'pending',
      qrData: qrResult.data,
      createdAt: new Date(),
      expiresAt: new Date(qrResult.data.expires_at)
    };

    payments.push(payment);

    res.json({
      success: true,
      data: {
        payment_id: payment.id,
        order_id: orderId,
        amount: payment.amount,
        currency: payment.currency,
        package: selectedPackage,
        qr_code: qrResult.data.qr_code,
        qr_image: qrResult.data.qr_image,
        deeplink: qrResult.data.deeplink,
        expires_at: qrResult.data.expires_at
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания платежа'
    });
  }
});

/**
 * GET /api/v1/payments/:paymentId/status
 * Проверка статуса платежа
 */
router.get('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Находим платеж в нашей системе
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    // Проверяем статус в Kaspi
    const statusResult = await kaspiService.checkPaymentStatus(payment.kaspiPaymentId);

    if (statusResult.success) {
      // Обновляем статус в нашей системе
      payment.status = statusResult.data.payment_status;
      
      if (statusResult.data.payment_status === 'completed') {
        payment.completedAt = new Date(statusResult.data.paid_at);
        payment.transactionId = statusResult.data.transaction_id;

        // Активируем подписку пользователя
        const existingSubscription = userSubscriptions.find(s => s.clientId === payment.clientId);
        if (existingSubscription) {
          // Продлеваем существующую подписку
          existingSubscription.expiresAt = new Date(Date.now() + payment.package.duration * 24 * 60 * 60 * 1000);
          existingSubscription.sessionsRemaining += payment.package.sessions === -1 ? 1000 : payment.package.sessions;
          existingSubscription.packageHistory.push({
            packageId: payment.packageId,
            purchasedAt: new Date(),
            sessions: payment.package.sessions
          });
        } else {
          // Создаем новую подписку
          userSubscriptions.push({
            id: uuidv4(),
            clientId: payment.clientId,
            packageId: payment.packageId,
            packageName: payment.package.name,
            status: 'active',
            sessionsRemaining: payment.package.sessions === -1 ? 1000 : payment.package.sessions,
            isUnlimited: payment.package.sessions === -1,
            activatedAt: new Date(),
            expiresAt: new Date(Date.now() + payment.package.duration * 24 * 60 * 60 * 1000),
            packageHistory: [{
              packageId: payment.packageId,
              purchasedAt: new Date(),
              sessions: payment.package.sessions
            }]
          });
        }
      }

      res.json({
        success: true,
        data: {
          payment_id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          completed_at: payment.completedAt,
          transaction_id: payment.transactionId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: statusResult.error
      });
    }
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка проверки статуса платежа'
    });
  }
});

/**
 * POST /api/v1/payments/:paymentId/cancel
 * Отмена платежа
 */
router.post('/:paymentId/cancel', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Платеж нельзя отменить'
      });
    }

    // Отменяем в Kaspi
    const cancelResult = await kaspiService.cancelPayment(payment.kaspiPaymentId);

    if (cancelResult.success) {
      payment.status = 'cancelled';
      payment.cancelledAt = new Date();

      res.json({
        success: true,
        message: 'Платеж отменен'
      });
    } else {
      res.status(400).json({
        success: false,
        error: cancelResult.error
      });
    }
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отмены платежа'
    });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Webhook для уведомлений от Kaspi
 */
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const signature = req.headers['x-kaspi-signature'];
    const webhookData = JSON.parse(req.body);

    // Верифицируем подпись
    if (!kaspiService.verifyWebhook(webhookData, signature)) {
      return res.status(401).json({
        success: false,
        error: 'Неверная подпись'
      });
    }

    // Обрабатываем webhook
    const { payment_id, status, order_id, transaction_id, paid_at } = webhookData;

    const payment = payments.find(p => p.kaspiPaymentId === payment_id);
    if (payment) {
      payment.status = status;
      
      if (status === 'completed') {
        payment.completedAt = new Date(paid_at);
        payment.transactionId = transaction_id;
        
        // Активируем подписку (дублируем логику из проверки статуса)
        // ...код активации подписки...
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обработки webhook'
    });
  }
});

/**
 * GET /api/v1/payments/user/:clientId
 * Получение истории платежей пользователя
 */
router.get('/user/:clientId', (req, res) => {
  try {
    const { clientId } = req.params;
    const userPayments = payments
      .filter(p => p.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: userPayments.map(p => ({
        id: p.id,
        order_id: p.orderId,
        package: p.package,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        created_at: p.createdAt,
        completed_at: p.completedAt,
        expires_at: p.expiresAt
      }))
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения платежей пользователя'
    });
  }
});

module.exports = router; 