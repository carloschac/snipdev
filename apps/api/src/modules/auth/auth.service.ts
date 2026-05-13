import { createHash, randomBytes } from 'crypto';
import { prisma } from '../../server';
import { hashPassword, comparePassword } from '../../shared/utils/hash';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('E-mail já cadastrado');

    const user = await prisma.user.create({
      data: { email, password: hashPassword(password), name },
      select: { id: true, email: true, name: true, username: true, profileName: true, createdAt: true },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciais inválidas');

    const valid = comparePassword(password, user.password);
    if (!valid) throw new Error('Credenciais inválidas');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      profileName: user.profileName,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const valid = comparePassword(currentPassword, user.password);
    if (!valid) throw new Error('Senha atual incorreta');

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword(newPassword) },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  async forgotPassword(email: string) {
    const message = 'Se este e-mail estiver cadastrado, você receberá as instruções.';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message };

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    if (process.env.NODE_ENV !== 'production') {
      return { message, token };
    }

    return { message };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new Error('Token inválido ou expirado');
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashPassword(newPassword) },
    });

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Senha redefinida com sucesso' };
  }
}
