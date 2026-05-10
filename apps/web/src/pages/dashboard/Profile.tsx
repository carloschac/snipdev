import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth.context';
import { Topbar } from '@/components/Topbar';

export function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            title="Perfil"
            subtitle="Gerencie suas informações pessoais"
          />
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 max-w-lg">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-medium text-xl">
                    {user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.name || 'Sem nome'}
                    </p>
                    <p className="text-zinc-500 text-sm">{user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-400">Nome</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-400">E-mail</label>
                  <Input
                    value={user?.email}
                    disabled
                    className="bg-zinc-800 border-zinc-700 text-zinc-500"
                  />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
