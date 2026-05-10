import { useAuth } from '@/contexts/auth.context';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-base font-medium text-white">{title}</h1>
        <p className="text-zinc-500 text-xs mt-0.5">
          {subtitle || capitalize(today)}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-medium text-sm select-none">
        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
      </div>
    </div>
  );
}
