const crypto = require('crypto');
const axios = require('axios');

class KaspiService {
  constructor() {
    this.baseURL = process.env.KASPI_API_URL || 'https://kaspi.kz/qr/api/v1';
    this.merchantId = process.env.KASPI_MERCHANT_ID;
    this.secretKey = process.env.KASPI_SECRET_KEY;
    this.successUrl = process.env.KASPI_SUCCESS_URL || 'http://localhost:3000/payments/success';
    this.failureUrl = process.env.KASPI_FAILURE_URL || 'http://localhost:3000/payments/failure';
  }

  /**
   * Создание QR кода для оплаты
   * @param {Object} paymentData - Данные платежа
   * @param {string} paymentData.amount - Сумма платежа
   * @param {string} paymentData.currency - Валюта (KZT)
   * @param {string} paymentData.orderId - ID заказа
   * @param {string} paymentData.description - Описание платежа
   * @param {string} paymentData.clientId - ID клиента
   * @returns {Promise<Object>} Данные QR кода
   */
  async createQRPayment(paymentData) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'KZT',
        order_id: paymentData.orderId,
        description: paymentData.description,
        client_id: paymentData.clientId,
        success_url: this.successUrl,
        failure_url: this.failureUrl,
        timestamp: Date.now()
      };

      // Генерируем подпись
      const signature = this.generateSignature(payload);
      payload.signature = signature;

      const response = await axios.post(`${this.baseURL}/payment/create`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            qr_code: response.data.qr_code,
            qr_image: response.data.qr_image,
            payment_id: response.data.payment_id,
            deeplink: response.data.deeplink,
            expires_at: response.data.expires_at
          }
        };
      } else {
        throw new Error(response.data.message || 'Ошибка создания QR кода');
      }
    } catch (error) {
      console.error('Kaspi QR API Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Проверка статуса платежа
   * @param {string} paymentId - ID платежа в Kaspi
   * @returns {Promise<Object>} Статус платежа
   */
  async checkPaymentStatus(paymentId) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        payment_id: paymentId,
        timestamp: Date.now()
      };

      const signature = this.generateSignature(payload);
      payload.signature = signature;

      const response = await axios.post(`${this.baseURL}/payment/status`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            payment_status: response.data.payment_status, // pending, completed, failed, expired
            amount: response.data.amount,
            currency: response.data.currency,
            order_id: response.data.order_id,
            transaction_id: response.data.transaction_id,
            paid_at: response.data.paid_at
          }
        };
      } else {
        throw new Error(response.data.message || 'Ошибка проверки статуса');
      }
    } catch (error) {
      console.error('Kaspi Status Check Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Отмена платежа
   * @param {string} paymentId - ID платежа в Kaspi
   * @returns {Promise<Object>} Результат отмены
   */
  async cancelPayment(paymentId) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        payment_id: paymentId,
        timestamp: Date.now()
      };

      const signature = this.generateSignature(payload);
      payload.signature = signature;

      const response = await axios.post(`${this.baseURL}/payment/cancel`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: response.data.status === 'success',
        message: response.data.message
      };
    } catch (error) {
      console.error('Kaspi Cancel Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Генерация подписи для запроса
   * @param {Object} payload - Данные запроса
   * @returns {string} Подпись
   */
  generateSignature(payload) {
    // Сортируем параметры по ключу
    const sortedParams = Object.keys(payload)
      .filter(key => key !== 'signature')
      .sort()
      .map(key => `${key}=${payload[key]}`)
      .join('&');

    // Добавляем секретный ключ
    const stringToSign = sortedParams + this.secretKey;

    // Генерируем SHA256 хэш
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
  }

  /**
   * Верификация webhook от Kaspi
   * @param {Object} webhookData - Данные webhook
   * @param {string} receivedSignature - Полученная подпись
   * @returns {boolean} Результат верификации
   */
  verifyWebhook(webhookData, receivedSignature) {
    const expectedSignature = this.generateSignature(webhookData);
    return expectedSignature === receivedSignature;
  }

  /**
   * Получение доступных пакетов тренировок
   * @returns {Array} Список пакетов
   */
  getTrainingPackages() {
    return [
      {
        id: 'basic',
        name: 'Базовый пакет',
        description: '4 тренировки в месяц',
        price: 15000,
        currency: 'KZT',
        sessions: 4,
        duration: 30 // дней
      },
      {
        id: 'standard',
        name: 'Стандартный пакет',
        description: '8 тренировок в месяц',
        price: 25000,
        currency: 'KZT',
        sessions: 8,
        duration: 30
      },
      {
        id: 'premium',
        name: 'Премиум пакет',
        description: '12 тренировок в месяц + персональный план питания',
        price: 35000,
        currency: 'KZT',
        sessions: 12,
        duration: 30
      },
      {
        id: 'unlimited',
        name: 'Безлимитный пакет',
        description: 'Неограниченные тренировки в месяц',
        price: 45000,
        currency: 'KZT',
        sessions: -1, // unlimited
        duration: 30
      }
    ];
  }
}

module.exports = new KaspiService(); 