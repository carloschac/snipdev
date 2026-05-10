import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Topbar } from '@/components/Topbar';

export function Settings() {
  const aiEnabled = import.meta.env.VITE_AI_ENABLED === 'true';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Ajustes" subtitle="Configurações da aplicação" />
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 max-w-lg">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Geração de slug por IA
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Usa a API da Anthropic para gerar slugs inteligentes
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      aiEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {aiEnabled ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Configurar chave da API
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Defina ANTHROPIC_API_KEY no arquivo .env
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
