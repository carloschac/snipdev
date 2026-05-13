import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-white font-medium mb-2">Link inválido</p>
          <p className="text-zinc-500 text-sm mb-4">
            Este link de redefinição não é válido ou expirou.
          </p>
          <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300 text-sm">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-zinc-950 font-bold text-lg">S</span>
            </div>
          </div>
          <CardTitle className="text-white text-2xl">Nova senha</CardTitle>
          <CardDescription className="text-zinc-400">
            Defina sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">Nova senha</label>
              <Input
                type="password"
                placeholder="••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                minLength={6}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">Confirmar senha</label>
              <Input
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white mt-2"
            >
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
                Voltar ao login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
