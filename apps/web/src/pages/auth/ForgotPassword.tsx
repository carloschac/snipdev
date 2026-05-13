import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.forgotPassword(email);
      setMessage(data.message);
      if (data.token) setDevToken(data.token);
    } catch {
      setMessage('Se este e-mail estiver cadastrado, você receberá as instruções.');
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
          <CardTitle className="text-white text-2xl">Recuperar senha</CardTitle>
          <CardDescription className="text-zinc-400">
            Informe seu e-mail para receber as instruções
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="flex flex-col gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg">
                {message}
              </div>
              {devToken && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-zinc-500">Token de desenvolvimento:</p>
                  <code className="text-xs bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg break-all">
                    {devToken}
                  </code>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 mt-1"
                  >
                    → Redefinir senha agora
                  </Link>
                </div>
              )}
              <Link
                to="/login"
                className="text-center text-sm text-zinc-500 hover:text-zinc-300"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-400">E-mail</label>
                <Input
                  type="email"
                  placeholder="carlos@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white mt-2"
              >
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </Button>
              <p className="text-center text-sm text-zinc-500">
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
