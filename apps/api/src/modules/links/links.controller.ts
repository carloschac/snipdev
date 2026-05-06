import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { LinksService } from './links.service';
import { authMiddleware } from '../../shared/utils/auth.middleware';

const linksService = new LinksService();

const createSchema = z.object({
  url: z.string().url(),
});

export async function linksController(app: FastifyInstance) {
  // Redirecionar — rota pública
  app.get('/r/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const originalUrl = await linksService.redirect(slug, {
        ip: request.ip,
        referer: request.headers.referer,
        userAgent: request.headers['user-agent'],
      });
      return reply.redirect(originalUrl);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });

  // Rotas protegidas
  app.post('/links', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { url } = createSchema.parse(request.body);
      const user = request.user as { id: string };
      const link = await linksService.create(user.id, url);
      return reply.status(201).send(link);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.get('/links', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const user = request.user as { id: string };
      const links = await linksService.findByUser(user.id);
      return reply.send(links);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.delete(
    '/links/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = request.user as { id: string };
        const result = await linksService.delete(id, user.id);
        return reply.send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
}
