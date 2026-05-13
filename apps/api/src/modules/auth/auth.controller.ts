import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service';

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
}
