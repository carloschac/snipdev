import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth.context';
import { Topbar } from '@/components/Topbar';
import { profileService, authService } from '@/services/api';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  profileName: string | null;
}

export function Profile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [username, setUsername] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await profileService.getMe();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setProfileName(profile.profileName || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: { name?: string; username?: string; profileName?: string }) => {
      const { data: res } = await profileService.updateMe(data);
      return res as ProfileData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      if (user) updateUser({ ...user, ...data });
      setProfileError('');
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err: any) => {
      setProfileError(err.response?.data?.error || 'Erro ao salvar perfil');
    },
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const { data } = await authService.changePassword(currentPassword, newPassword);
      return data;
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.error || 'Erro ao alterar senha');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    const data: { name?: string; username?: string; profileName?: string } = {
      name: name || undefined,
      profileName: profileName || undefined,
    };
    if (!profile?.username && username) {
      data.username = username;
    }
    updateProfile.mutate(data);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('As novas senhas não coincidem');
      return;
    }
    changePassword.mutate();
  };

  const displayName = profile?.profileName || profile?.name || user?.email?.split('@')[0] || '';
  const initial = displayName[0]?.toUpperCase() || '?';
  const hasUsername = !!profile?.username;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Perfil" subtitle="Gerencie suas informações pessoais" />
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-5 max-w-lg">

            {/* Identidade pública */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-medium text-xl flex-shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="text-white font-medium">{displayName}</p>
                    <p className="text-zinc-500 text-sm">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">
                      Nome público{' '}
                      <span className="text-zinc-600">— exibido no seu perfil e links</span>
                    </label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Ex: Carlos Henrique"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">
                      Username{' '}
                      <span className="text-zinc-600">— usado na URL pública /u/seu-username</span>
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ex: carlos-dev"
                      disabled={hasUsername}
                      className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 ${
                        hasUsername ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {hasUsername && (
                      <p className="text-xs text-zinc-600">
                        O username não pode ser alterado após definido.
                      </p>
                    )}
                    {!hasUsername && (
                      <p className="text-xs text-zinc-600">
                        Apenas letras minúsculas, números e hífens (3–30 caracteres). Não pode ser alterado depois.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">
                      Nome da conta{' '}
                      <span className="text-zinc-600">— nome interno, distinto do nome público</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">E-mail</label>
                    <Input
                      value={user?.email}
                      disabled
                      className="bg-zinc-800 border-zinc-700 text-zinc-500 opacity-50 cursor-not-allowed"
                    />
                  </div>

                  {profileError && (
                    <p className="text-xs text-red-400">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="text-xs text-emerald-400">Perfil salvo com sucesso.</p>
                  )}

                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
                  >
                    {updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Alterar senha */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6 flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Alterar senha</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Máximo de 3 tentativas por hora.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">Senha atual</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">Nova senha</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">Confirmar nova senha</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-400">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-xs text-emerald-400">Senha alterada com sucesso.</p>
                  )}

                  <Button
                    type="submit"
                    disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white w-full"
                  >
                    {changePassword.isPending ? 'Alterando...' : 'Alterar senha'}
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
