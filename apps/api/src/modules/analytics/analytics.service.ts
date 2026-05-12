import { prisma } from '../../server';

export class AnalyticsService {
  async getOverview(userId: string) {
    const links = await prisma.link.findMany({
      where: { userId },
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        aiGenerated: true,
        active: true,
        public: true,
        createdAt: true,
        _count: { select: { clicks: true } },
      },
    });

    const totalLinks = links.length;
    const totalClicks = links.reduce(
      (sum, link) => sum + link._count.clicks,
      0,
    );
    const activeLinks = links.filter((link) => link.active).length;

    return {
      totalLinks,
      totalClicks,
      activeLinks,
      links: links.map((link) => ({
        ...link,
        clicks: link._count.clicks,
        shortUrl: `${process.env.API_URL || 'http://localhost:3333'}/r/${link.slug}`,
      })),
    };
  }

  async getLinkStats(linkId: string, userId: string) {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { clicks: true },
    });

    if (!link) throw new Error('Link não encontrado');
    if (link.userId !== userId) throw new Error('Sem permissão');

    const clicksByDay = link.clicks.reduce(
      (acc: Record<string, number>, click) => {
        const day = click.createdAt.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {},
    );

    const clicksByBrowser = link.clicks.reduce(
      (acc: Record<string, number>, click) => {
        const browser = click.browser || 'Desconhecido';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      },
      {},
    );

    const clicksByReferer = link.clicks.reduce(
      (acc: Record<string, number>, click) => {
        const referer = click.referer || 'Direto';
        acc[referer] = (acc[referer] || 0) + 1;
        return acc;
      },
      {},
    );

    return {
      link: {
        id: link.id,
        slug: link.slug,
        originalUrl: link.originalUrl,
        aiGenerated: link.aiGenerated,
        active: link.active,
        createdAt: link.createdAt,
        shortUrl: `${process.env.API_URL || 'http://localhost:3333'}/r/${link.slug}`,
      },
      totalClicks: link.clicks.length,
      clicksByDay,
      clicksByBrowser,
      clicksByReferer,
    };
  }

  async getClicksByDay(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const clicks = await prisma.click.findMany({
      where: {
        link: { userId },
        createdAt: { gte: since },
      },
      select: { createdAt: true },
    });

    const grouped: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const key = date.toISOString().split('T')[0];
      grouped[key] = 0;
    }

    clicks.forEach((click) => {
      const key = click.createdAt.toISOString().split('T')[0];
      if (grouped[key] !== undefined) grouped[key]++;
    });

    return Object.entries(grouped).map(([date, clicks]) => ({ date, clicks }));
  }
}
