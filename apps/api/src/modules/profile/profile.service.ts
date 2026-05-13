import { prisma } from '../../server';

export class ProfileService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, username: true, profileName: true },
    });
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  }

  async updateMe(
    userId: string,
    data: { name?: string; username?: string; profileName?: string },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    if (data.username !== undefined) {
      if (user.username !== null) {
        throw new Error('Username não pode ser alterado após definido');
      }
      const taken = await prisma.user.findUnique({ where: { username: data.username } });
      if (taken) throw new Error('Este username já está em uso');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.username !== undefined && { username: data.username }),
        ...(data.profileName !== undefined && { profileName: data.profileName }),
      },
      select: { id: true, email: true, name: true, username: true, profileName: true },
    });
  }

  async getByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, name: true, profileName: true, username: true },
    });
    if (!user) throw new Error('Perfil não encontrado');

    const links = await prisma.link.findMany({
      where: { userId: user.id, public: true, active: true },
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
      user: {
        username: user.username,
        name: user.profileName || user.name,
      },
      links: links.map((link) => ({
        ...link,
        clicks: link._count.clicks,
        shortUrl: `${process.env.API_URL || 'http://localhost:3333'}/r/${link.slug}`,
      })),
    };
  }
}
