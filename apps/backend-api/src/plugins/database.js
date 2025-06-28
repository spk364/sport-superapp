import fp from 'fastify-plugin';

const databasePlugin = async (fastify) => {
  // В реальном приложении здесь будет подключение к БД (PostgreSQL, MongoDB, etc.)
  // Пока используем в памяти для прототипа
  
  const database = {
    payments: new Map(),
    subscriptions: new Map(),
    users: new Map(),
    
    // Методы для работы с платежами
    async savePayment(payment) {
      this.payments.set(payment.id, {
        ...payment,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return payment;
    },

    async getPayment(paymentId) {
      return this.payments.get(paymentId);
    },

    async updatePayment(paymentId, updates) {
      const payment = this.payments.get(paymentId);
      if (payment) {
        const updated = {
          ...payment,
          ...updates,
          updatedAt: new Date()
        };
        this.payments.set(paymentId, updated);
        return updated;
      }
      return null;
    },

    async getUserPayments(clientId) {
      return Array.from(this.payments.values())
        .filter(p => p.clientId === clientId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // Методы для работы с подписками
    async saveSubscription(subscription) {
      this.subscriptions.set(subscription.id, {
        ...subscription,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return subscription;
    },

    async getSubscription(subscriptionId) {
      return this.subscriptions.get(subscriptionId);
    },

    async getUserSubscription(clientId) {
      return Array.from(this.subscriptions.values())
        .find(s => s.clientId === clientId && s.status === 'active');
    },

    async updateSubscription(subscriptionId, updates) {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        const updated = {
          ...subscription,
          ...updates,
          updatedAt: new Date()
        };
        this.subscriptions.set(subscriptionId, updated);
        return updated;
      }
      return null;
    }
  };

  // Декорируем fastify instance
  fastify.decorate('db', database);
  
  fastify.log.info('Database plugin registered (in-memory mode)');
};

export default fp(databasePlugin, {
  name: 'database'
}); 