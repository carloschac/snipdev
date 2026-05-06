import { prisma } from '../../server';
import { hashPassword, comparePassword } from '../../shared/utils/hash';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('E-mail já cadastrado');

    const user = await prisma.user.create({
      data: { email, password: hashPassword(password), name },
      select: { id: true, email: true, name: true, createdAt: true },
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
    };
  }
}
