import { prisma } from '../../server';
import { generateSlug } from '../../shared/utils/slug';

export class LinksService {
  async create(userId: string, originalUrl: string) {
    const aiEnabled = process.env.AI_ENABLED === 'true';
    let slug: string;
    let aiGenerated = false;

    if (aiEnabled) {
      slug = await this.generateAISlug(originalUrl);
      aiGenerated = true;
    } else {
      slug = generateSlug(originalUrl);
    }

    const link = await prisma.link.create({
      data: { slug, originalUrl, userId, aiGenerated, public: true },
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        aiGenerated: true,
        active: true,
        public: true,
        createdAt: true,
      },
    });

    return {
      ...link,
      shortUrl: `${process.env.API_URL || 'http://localhost:3333'}/r/${link.slug}`,
    };
  }

  async findByUser(userId: string) {
    const links = await prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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

    return links.map((link) => ({
      ...link,
      clicks: link._count.clicks,
      shortUrl: `${process.env.API_URL || 'http://localhost:3333'}/r/${link.slug}`,
    }));
  }

  async togglePublic(linkId: string, userId: string) {
    const link = await prisma.link.findUnique({ where: { id: linkId } });
    if (!link) throw new Error('Link não encontrado');
    if (link.userId !== userId) throw new Error('Sem permissão');

    const updated = await prisma.link.update({
      where: { id: linkId },
      data: { public: !link.public },
      select: { id: true, public: true },
    });

    return updated;
  }

  async getPublicLinks(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) throw new Error('Usuário não encontrado');

    const links = await prisma.link.findMany({
      where: { userId, public: true, active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        aiGenerated: true,
        createdAt: true,
        _count: { select: { clicks: true } },
      },
    });

    return {
      user: { name: user.name, email: user.email },
      links: links.map((link) => ({
        ...link,
        clicks: link._count.clicks,
        shortUrl: `${process.env.API_URL || 'http://localhost:3333'}/r/${link.slug}`,
      })),
    };
  }

  async delete(linkId: string, userId: string) {
    const link = await prisma.link.findUnique({ where: { id: linkId } });
    if (!link) throw new Error('Link não encontrado');
    if (link.userId !== userId) throw new Error('Sem permissão');
    await prisma.link.delete({ where: { id: linkId } });
    return { message: 'Link removido com sucesso' };
  }

  async redirect(
    slug: string,
    meta: {
      ip?: string;
      referer?: string;
      userAgent?: string;
    },
  ) {
    const link = await prisma.link.findUnique({
      where: { slug, active: true },
    });
    if (!link) throw new Error('Link não encontrado');

    await prisma.click.create({
      data: {
        linkId: link.id,
        ip: meta.ip,
        referer: meta.referer,
        browser: meta.userAgent,
      },
    });

    return link.originalUrl;
  }

  private async generateAISlug(url: string): Promise<string> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: `Generate a short, readable URL slug (max 30 chars, lowercase, hyphens only) for this URL: ${url}. Reply with ONLY the slug, nothing else.`,
        },
      ],
    });

    const slug = (message.content[0] as { text: string }).text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .slice(0, 30);

    const existing = await prisma.link.findUnique({ where: { slug } });
    if (existing) return slug + '-' + Math.random().toString(36).slice(2, 5);

    return slug;
  }
}
