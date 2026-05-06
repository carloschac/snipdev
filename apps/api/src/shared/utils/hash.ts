import { createHmac } from 'crypto';

const SECRET = process.env.JWT_SECRET!;

export function hashPassword(password: string): string {
  return createHmac('sha256', SECRET).update(password).digest('hex');
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
