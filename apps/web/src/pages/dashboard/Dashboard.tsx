import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linksService, analyticsService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  aiGenerated: boolean;
  active: boolean;
  clicks: number;
  createdAt: string;
}

interface Overview {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  links: Link[];
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const { data: overview, isLoading } = useQuery<Overview>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await analyticsService.overview();
      return data;
    },
  });

  const createLink = useMutation({
    mutationFn: async (url: string) => {
      const { data } = await linksService.create(url);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setUrl('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'URL inválida');
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      await linksService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    createLink.mutate(url);
  };

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(shortUrl);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-52 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-zinc-800">
            {/* Logo — não clicável */}
            <div className="flex items-center gap-2 select-none">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="#052e16"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M8 2.5L11.5 6 8 9.5M3 6h8.5" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">snip.dev</p>
                <p className="text-zinc-500 text-xs tracking-widest">
                  LINK TRACKER
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 flex flex-col gap-1">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm w-full text-left">
              Dashboard
            </button>
          </nav>
          <div className="p-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2 truncate">{user?.email}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Sair
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <div>
              <h1 className="text-base font-medium">Dashboard</h1>
              <p className="text-zinc-500 text-xs mt-0.5">
                Bem-vindo, {user?.name || user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
            >
              ← Início
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            {/* Encurtar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 mb-3">Encurtar novo link</p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com/seu-link-longo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <Button
                  type="submit"
                  disabled={createLink.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5"
                >
                  {createLink.isPending ? 'Encurtando...' : 'Encurtar'}
                </Button>
              </form>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            {/* Cards de métricas */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-500 mb-1">Total de links</p>
                  <p className="text-2xl font-medium text-white">
                    {isLoading ? '—' : (overview?.totalLinks ?? 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-500 mb-1">Cliques totais</p>
                  <p className="text-2xl font-medium text-white">
                    {isLoading ? '—' : (overview?.totalClicks ?? 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-500 mb-1">Links ativos</p>
                  <p className="text-2xl font-medium text-white">
                    {isLoading ? '—' : (overview?.activeLinks ?? 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de links */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-zinc-800">
                <p className="text-sm font-medium">Links recentes</p>
              </div>
              {isLoading ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Carregando...
                </div>
              ) : overview?.links.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Nenhum link ainda. Encurte o primeiro acima!
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {overview?.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {/* Link clicável com _blank */}
                          <a
                            href={link.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
                          >
                            {link.shortUrl.replace(
                              'http://localhost:3333',
                              'snip.dev',
                            )}
                          </a>
                          {link.aiGenerated && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-1.5">
                              IA
                            </Badge>
                          )}
                        </div>
                        <p className="text-zinc-500 text-xs truncate">
                          {link.originalUrl}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium text-white">
                          {link.clicks}
                        </p>
                        <p className="text-xs text-zinc-500">cliques</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(link.shortUrl)}
                          className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                        >
                          {copied === link.shortUrl ? 'Copiado!' : 'Copiar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteLink.mutate(link.id)}
                          className="border-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 text-xs"
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
