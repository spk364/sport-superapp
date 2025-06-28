import Fastify from 'fastify';

// Создаем Fastify instance с продвинутыми настройками
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname'
      }
    } : undefined
  },
  ajv: {
    customOptions: {
      strict: 'log',
      keywords: ['kind', 'modifier']
    }
  }
});

// Environment variables
await fastify.register(import('@fastify/env'), {
  confKey: 'config',
  schema: {
    type: 'object',
    required: ['PORT'],
    properties: {
      PORT: { type: 'string', default: '4000' },
      NODE_ENV: { type: 'string', default: 'development' },
      KASPI_API_URL: { type: 'string', default: 'https://kaspi.kz/qr/api/v1' },
      KASPI_MERCHANT_ID: { type: 'string' },
      KASPI_SECRET_KEY: { type: 'string' },
      KASPI_SUCCESS_URL: { type: 'string', default: 'http://localhost:3000/payments/success' },
      KASPI_FAILURE_URL: { type: 'string', default: 'http://localhost:3000/payments/failure' }
    }
  },
  dotenv: true
});

// Security
await fastify.register(import('@fastify/helmet'), {
  contentSecurityPolicy: false
});

// CORS
await fastify.register(import('@fastify/cors'), {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : true,
  credentials: true
});

// Rate limiting для платежей
await fastify.register(import('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: false
});

// Swagger документация
await fastify.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Trainer Mini App API',
      description: 'API для фитнес приложения с Kaspi QR оплатой',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'payments', description: 'Kaspi QR платежи' },
      { name: 'subscriptions', description: 'Подписки пользователей' },
      { name: 'auth', description: 'Аутентификация' }
    ]
  }
});

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

// Регистрируем плагины
await fastify.register(import('./plugins/kaspi.js'));
await fastify.register(import('./plugins/database.js'));

// API routes
await fastify.register(import('./routes/payments.js'), { prefix: '/api/v1/payments' });
await fastify.register(import('./routes/subscriptions.js'), { prefix: '/api/v1/subscriptions' });
await fastify.register(import('./routes/auth.js'), { prefix: '/api/v1/auth' });
await fastify.register(import('./routes/users.js'), { prefix: '/api/v1/users' });
await fastify.register(import('./routes/workouts.js'), { prefix: '/api/v1/workouts' });

// Health check
fastify.get('/health', {
  schema: {
    description: 'Health check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' },
          version: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
});

// Root endpoint
fastify.get('/', {
  schema: {
    description: 'API информация',
    tags: ['info'],
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          version: { type: 'string' },
          documentation: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  return {
    message: 'Trainer Mini App Backend API',
    version: '1.0.0',
    documentation: '/docs'
  };
});

// Error handler
fastify.setErrorHandler(async (error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Ошибка валидации',
      details: error.validation
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message
    });
  }

  return reply.status(500).send({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Внутренняя ошибка сервера'
  });
});

// 404 handler
fastify.setNotFoundHandler(async (request, reply) => {
  return reply.status(404).send({
    success: false,
    error: 'Эндпоинт не найден',
    path: request.url
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Получен сигнал ${signal}, завершение работы...`);
  try {
    await fastify.close();
    process.exit(0);
  } catch (err) {
    fastify.log.error('Ошибка при завершении:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Запуск сервера
const start = async () => {
  try {
    const PORT = fastify.config.PORT;
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    
    fastify.log.info(`🚀 Fastify Backend API запущен на порту ${PORT}`);
    fastify.log.info(`📍 URL: http://localhost:${PORT}`);
    fastify.log.info(`❤️ Health check: http://localhost:${PORT}/health`);
    fastify.log.info(`📚 API Docs: http://localhost:${PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 