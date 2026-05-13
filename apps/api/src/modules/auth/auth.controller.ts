import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { authMiddleware } from '../../shared/utils/auth.middleware';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

export async function authController(app: FastifyInstance) {
  app.post(
    '/auth/register',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
      try {
        const { email, password, name } = registerSchema.parse(request.body);
        const user = await authService.register(email, password, name);
        const token = app.jwt.sign({ id: user.id, email: user.email });
        return reply.status(201).send({ user, token });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      try {
        const { email, password } = loginSchema.parse(request.body);
        const user = await authService.login(email, password);
        const token = app.jwt.sign({ id: user.id, email: user.email });
        return reply.status(200).send({ user, token });
      } catch (err: any) {
        return reply.status(401).send({ error: err.message });
      }
    },
  );

  app.post(
    '/auth/change-password',
    {
      preHandler: authMiddleware,
      config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
    },
    async (request, reply) => {
      try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(request.body);
        const user = request.user as { id: string };
        const result = await authService.changePassword(user.id, currentPassword, newPassword);
        return reply.send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post(
    '/auth/forgot-password',
    { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } },
    async (request, reply) => {
      try {
        const { email } = forgotPasswordSchema.parse(request.body);
        const result = await authService.forgotPassword(email);
        return reply.send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post('/auth/reset-password', async (request, reply) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(request.body);
      const result = await authService.resetPassword(token, newPassword);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
