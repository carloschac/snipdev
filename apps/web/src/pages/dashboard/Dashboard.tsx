import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linksService, analyticsService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  aiGenerated: boolean;
  active: boolean;
  public: boolean;
  clicks: number;
  createdAt: string;
}

interface Overview {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  links: Link[];
}

function getFavicon(url: string) {
  if (url.includes('github')) return '🐙';
  if (url.includes('docker')) return '🐳';
  if (url.includes('prisma')) return '📦';
  if (url.includes('notion')) return '📝';
  if (url.includes('youtube')) return '▶️';
  if (url.includes('figma')) return '🎨';
  if (url.includes('twitter') || url.includes('x.com')) return '🐦';
  if (url.includes('linkedin')) return '💼';
  if (url.includes('reddit')) return '🤖';
  if (url.includes('google')) return '🔍';
  return '🔗';
}

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'ai'>('all');

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

  const togglePublic = useMutation({
    mutationFn: async (id: string) => {
      const result = await linksService.togglePublic(id);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['analytics'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          links: old.links.map((link: Link) =>
            link.id === data.id ? { ...link, public: data.public } : link,
          ),
        };
      });
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

  const filtered = (overview?.links ?? []).filter((link) => {
    if (filter === 'active') return link.active;
    if (filter === 'ai') return link.aiGenerated;
    return true;
  });

  const avgClicks = overview?.totalLinks
    ? (overview.totalClicks / overview.totalLinks).toFixed(1)
    : '0';

  const activePercent = overview?.totalLinks
    ? Math.round((overview.activeLinks / overview.totalLinks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Dashboard" />

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 mb-3">Encurtar novo link</p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com/seu-link-longo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <div
                  className={`flex items-center gap-1.5 px-3 h-9 rounded-md border text-xs font-medium select-none ${
                    import.meta.env.VITE_AI_ENABLED === 'true'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      import.meta.env.VITE_AI_ENABLED === 'true'
                        ? 'bg-emerald-400'
                        : 'bg-red-400'
                    }`}
                  />
                  Slug por IA
                </div>
                <Button
                  type="submit"
                  disabled={createLink.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5"
                >
                  {createLink.isPending ? 'Encurtando...' : 'Encurtar'}
                </Button>
              </form>
              <p className="text-zinc-600 text-xs mt-2">
                A IA gera um slug legível baseado no conteúdo da URL — nada de{' '}
                <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">
                  xB3k9
                </code>
              </p>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-500 mb-1">Total de links</p>
                  <p className="text-2xl font-medium text-white">
                    {isLoading ? '—' : (overview?.totalLinks ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    {overview?.totalLinks
                      ? `${overview.totalLinks} criados no total`
                      : 'Nenhum link ainda'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-500 mb-1">Cliques totais</p>
                  <p className="text-2xl font-medium text-white">
                    {isLoading ? '—' : (overview?.totalClicks ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    média de {avgClicks} por link
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-500 mb-1">Links ativos</p>
                  <p className="text-2xl font-medium text-white">
                    {isLoading ? '—' : (overview?.activeLinks ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    {activePercent}% do total
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <p className="text-sm font-medium">Links recentes</p>
                <div className="flex gap-2">
                  {(['all', 'active', 'ai'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        filter === f
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {f === 'all'
                        ? 'Todos'
                        : f === 'active'
                          ? 'Ativos'
                          : 'Com IA'}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Nenhum link encontrado.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {filtered.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0">
                        {getFavicon(link.originalUrl)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
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
                          onClick={() => togglePublic.mutate(link.id)}
                          className={`border-zinc-700 text-xs hover:bg-zinc-800 ${
                            link.public
                              ? 'text-emerald-400 hover:text-emerald-300'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {link.public ? '🌐 Público' : '🔒 Privado'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/analytics/${link.id}`)}
                          className="border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 text-xs"
                        >
                          Analytics
                        </Button>
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
