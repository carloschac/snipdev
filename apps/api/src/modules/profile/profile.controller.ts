import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProfileService } from './profile.service';
import { authMiddleware } from '../../shared/utils/auth.middleware';

const profileService = new ProfileService();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  username: z
    .string()
    .regex(
      /^[a-z0-9-]{3,30}$/,
      'Username deve ter 3–30 caracteres usando apenas letras minúsculas, números e hífens',
    )
    .optional(),
  profileName: z.string().min(1).optional(),
});

export async function profileController(app: FastifyInstance) {
  app.get('/me', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const user = request.user as { id: string };
      const profile = await profileService.getMe(user.id);
      return reply.send(profile);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.patch('/me', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const user = request.user as { id: string };
      const data = updateSchema.parse(request.body);
      const profile = await profileService.updateMe(user.id, data);
      return reply.send(profile);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.get('/u/:username', async (request, reply) => {
    try {
      const { username } = request.params as { username: string };
      const data = await profileService.getByUsername(username);
      return reply.send(data);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });
}
