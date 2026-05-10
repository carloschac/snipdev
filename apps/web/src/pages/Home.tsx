import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 border-b border-zinc-800 flex items-center justify-between">
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
          <span className="text-white text-sm font-medium">snip.dev</span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Entrar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/register')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Criar conta
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 14 14"
            fill="none"
            stroke="#052e16"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M8 2.5L11.5 6 8 9.5M3 6h8.5" />
          </svg>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight max-w-lg">
          Encurte links.{' '}
          <span className="text-emerald-400">Analise resultados.</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-md">
          Gere slugs inteligentes com IA, rastreie cliques em tempo real e
          entenda de onde vem seu tráfego.
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            onClick={() => navigate('/register')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6"
          >
            Começar gratuitamente
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/login')}
            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 px-6"
          >
            Já tenho conta
          </Button>
        </div>
      </main>

      {/* Features */}
      <section className="px-8 py-16 grid grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {[
          {
            icon: '⚡',
            title: 'Slug por IA',
            desc: 'Gera automaticamente slugs legíveis baseados no conteúdo da URL.',
          },
          {
            icon: '📊',
            title: 'Analytics em tempo real',
            desc: 'Acompanhe cliques, origem do tráfego e navegadores utilizados.',
          },
          {
            icon: '🔒',
            title: 'Seguro e confiável',
            desc: 'Autenticação JWT, senhas criptografadas e dados protegidos.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <p className="text-white font-medium mb-1">{f.title}</p>
            <p className="text-zinc-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-zinc-800 text-center">
        <p className="text-zinc-600 text-xs">
          snip.dev — construído com Node.js, React, Prisma e IA
        </p>
      </footer>
    </div>
  );
}
