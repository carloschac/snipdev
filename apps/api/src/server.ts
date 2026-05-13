import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { authController } from './modules/auth/auth.controller';
import { linksController } from './modules/links/links.controller';
import { analyticsController } from './modules/analytics/analytics.controller';
import { profileController } from './modules/profile/profile.controller';
import 'dotenv/config';

export const prisma = new PrismaClient();

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
app.register(helmet);
app.register(jwt, { secret: process.env.JWT_SECRET! });
app.register(rateLimit, {
  global: true,
  max: 200,
  timeWindow: '1 minute',
});

// Rotas
app.register(authController);
app.register(linksController);
app.register(analyticsController);
app.register(profileController);

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date() }));

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3333,
      host: '0.0.0.0',
    });
    console.log(`🚀 API rodando em http://localhost:3333`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
