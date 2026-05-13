import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/api';

interface PublicLink {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  aiGenerated: boolean;
  clicks: number;
  createdAt: string;
}

interface UsernameProfileData {
  user: {
    username: string | null;
    name: string | null;
  };
  links: PublicLink[];
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
  return '🔗';
}

export function UsernameProfile() {
  const { username } = useParams<{ username: string }>();

  const { data, isLoading, isError } = useQuery<UsernameProfileData>({
    queryKey: ['usernameProfile', username],
    queryFn: async () => {
      const { data } = await profileService.getByUsername(username!);
      return data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-2">Perfil não encontrado</p>
          <p className="text-zinc-500 text-sm">
            O username <span className="text-zinc-300">@{username}</span> não existe.
          </p>
        </div>
      </div>
    );
  }

  const displayName = data.user.name || data.user.username || username || '';
  const initial = displayName[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-medium text-2xl mx-auto mb-4">
            {initial}
          </div>
          <h1 className="text-xl font-medium text-white">{displayName}</h1>
          {data.user.username && (
            <p className="text-zinc-500 text-sm mt-0.5">@{data.user.username}</p>
          )}
          <p className="text-zinc-600 text-sm mt-1">
            {data.links.length} {data.links.length === 1 ? 'link público' : 'links públicos'}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 14 14"
                fill="none"
                stroke="#052e16"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M8 2.5L11.5 6 8 9.5M3 6h8.5" />
              </svg>
            </div>
            <span className="text-zinc-500 text-xs">snip.dev</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-3">
        {data.links.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">Nenhum link público ainda.</p>
          </div>
        ) : (
          data.links.map((link) => (
            <a
              key={link.id}
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 hover:border-emerald-500/30 hover:bg-zinc-800/50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-base flex-shrink-0">
                {getFavicon(link.originalUrl)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
                  {link.shortUrl.replace('http://localhost:3333', 'snip.dev')}
                </p>
                <p className="text-zinc-500 text-xs truncate mt-0.5">
                  {link.originalUrl}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-white">{link.clicks}</p>
                <p className="text-xs text-zinc-600">cliques</p>
              </div>
            </a>
          ))
        )}
      </div>

      <div className="text-center py-8">
        <p className="text-zinc-700 text-xs">
          Criado com <span className="text-emerald-600">snip.dev</span>
        </p>
      </div>
    </div>
  );
}
