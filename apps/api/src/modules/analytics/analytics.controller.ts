import { FastifyInstance } from 'fastify';
import { AnalyticsService } from './analytics.service';
import { authMiddleware } from '../../shared/utils/auth.middleware';

const analyticsService = new AnalyticsService();

export async function analyticsController(app: FastifyInstance) {
  app.get(
    '/analytics',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const user = request.user as { id: string };
        const overview = await analyticsService.getOverview(user.id);
        return reply.send(overview);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.get(
    '/analytics/:linkId',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { linkId } = request.params as { linkId: string };
        const user = request.user as { id: string };
        const stats = await analyticsService.getLinkStats(linkId, user.id);
        return reply.send(stats);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
  app.get(
    '/analytics/clicks-by-day',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const user = request.user as { id: string };
        const { days } = request.query as { days?: string };
        const result = await analyticsService.getClicksByDay(
          user.id,
          Number(days) || 30,
        );
        return reply.send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
}
