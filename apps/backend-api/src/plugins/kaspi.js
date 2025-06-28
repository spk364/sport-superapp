import fp from 'fastify-plugin';
import crypto from 'crypto';
import axios from 'axios';

const kaspiPlugin = async (fastify) => {
  const kaspiService = {
    /**
     * Создание QR кода для оплаты
     */
    async createQRPayment(paymentData) {
      try {
        const payload = {
          merchant_id: fastify.config.KASPI_MERCHANT_ID,
          amount: paymentData.amount,
          currency: paymentData.currency || 'KZT',
          order_id: paymentData.orderId,
          description: paymentData.description,
          client_id: paymentData.clientId,
          success_url: fastify.config.KASPI_SUCCESS_URL,
          failure_url: fastify.config.KASPI_FAILURE_URL,
          timestamp: Date.now()
        };

        // Генерируем подпись
        const signature = this.generateSignature(payload);
        payload.signature = signature;

        const response = await axios.post(`${fastify.config.KASPI_API_URL}/payment/create`, payload, {
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
        fastify.log.error('Kaspi QR API Error:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * Проверка статуса платежа
     */
    async checkPaymentStatus(paymentId) {
      try {
        const payload = {
          merchant_id: fastify.config.KASPI_MERCHANT_ID,
          payment_id: paymentId,
          timestamp: Date.now()
        };

        const signature = this.generateSignature(payload);
        payload.signature = signature;

        const response = await axios.post(`${fastify.config.KASPI_API_URL}/payment/status`, payload, {
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
              payment_status: response.data.payment_status,
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
        fastify.log.error('Kaspi Status Check Error:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * Отмена платежа
     */
    async cancelPayment(paymentId) {
      try {
        const payload = {
          merchant_id: fastify.config.KASPI_MERCHANT_ID,
          payment_id: paymentId,
          timestamp: Date.now()
        };

        const signature = this.generateSignature(payload);
        payload.signature = signature;

        const response = await axios.post(`${fastify.config.KASPI_API_URL}/payment/cancel`, payload, {
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
        fastify.log.error('Kaspi Cancel Error:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * Генерация подписи для запроса
     */
    generateSignature(payload) {
      // Сортируем параметры по ключу
      const sortedParams = Object.keys(payload)
        .filter(key => key !== 'signature')
        .sort()
        .map(key => `${key}=${payload[key]}`)
        .join('&');

      // Добавляем секретный ключ
      const stringToSign = sortedParams + fastify.config.KASPI_SECRET_KEY;

      // Генерируем SHA256 хэш
      return crypto.createHash('sha256').update(stringToSign).digest('hex');
    },

    /**
     * Верификация webhook от Kaspi
     */
    verifyWebhook(webhookData, receivedSignature) {
      const expectedSignature = this.generateSignature(webhookData);
      return expectedSignature === receivedSignature;
    },

    /**
     * Получение доступных пакетов тренировок
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
          duration: 30
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
          sessions: -1,
          duration: 30
        }
      ];
    }
  };

  // Декорируем fastify instance
  fastify.decorate('kaspi', kaspiService);
};

export default fp(kaspiPlugin, {
  name: 'kaspi-service'
}); 