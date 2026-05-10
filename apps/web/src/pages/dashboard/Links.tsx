import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linksService, analyticsService } from '@/services/api';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth.context';
import { Topbar } from '@/components/Topbar';

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

type Filter = 'all' | 'active' | 'ai';

export function Links() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await analyticsService.overview();
      return data;
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      await linksService.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  });

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(shortUrl);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = (data?.links ?? []).filter((link: Link) => {
    if (filter === 'active') return link.active;
    if (filter === 'ai') return link.aiGenerated;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Links" subtitle="Gerencie todos os seus links" />

          <div className="flex-1 overflow-y-auto p-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <p className="text-sm font-medium">Todos os links</p>
                <div className="flex gap-2">
                  {(['all', 'active', 'ai'] as Filter[]).map((f) => (
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
                  Nenhum link encontrado
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {filtered.map((link: Link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0">
                        {link.originalUrl.includes('github')
                          ? '🐙'
                          : link.originalUrl.includes('docker')
                            ? '🐳'
                            : link.originalUrl.includes('prisma')
                              ? '📦'
                              : '🔗'}
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
