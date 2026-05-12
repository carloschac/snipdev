import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { authController } from './modules/auth/auth.controller';
import { linksController } from './modules/links/links.controller';
import { analyticsController } from './modules/analytics/analytics.controller';
import 'dotenv/config';

export const prisma = new PrismaClient();

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
});
app.register(helmet);
app.register(jwt, { secret: process.env.JWT_SECRET! });

// Rotas
app.register(authController);
app.register(linksController);
app.register(analyticsController);

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date() }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3333 });
    console.log(`🚀 API rodando em http://localhost:3333`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
