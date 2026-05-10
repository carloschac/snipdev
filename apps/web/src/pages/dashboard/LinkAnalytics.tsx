import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/api';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface LinkStats {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    shortUrl: string;
    aiGenerated: boolean;
    active: boolean;
    createdAt: string;
  };
  totalClicks: number;
  clicksByDay: Record<string, number>;
  clicksByBrowser: Record<string, number>;
  clicksByReferer: Record<string, number>;
}

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export function LinkAnalytics() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery<LinkStats>({
    queryKey: ['linkAnalytics', linkId],
    queryFn: async () => {
      const { data } = await analyticsService.linkStats(linkId!);
      return data;
    },
  });

  const chartData = stats
    ? Object.entries(stats.clicksByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, clicks]) => ({
          date: new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          cliques: clicks,
        }))
    : [];

  const browserData = stats
    ? Object.entries(stats.clicksByBrowser)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))
    : [];

  const refererData = stats
    ? Object.entries(stats.clicksByReferer).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="text-base font-medium">Detalhe do Link</h1>
              <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-md">
                {stats?.link.shortUrl.replace(
                  'http://localhost:3333',
                  'snip.dev',
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
            >
              ← Voltar
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 text-sm">Carregando...</p>
              </div>
            ) : (
              <>
                {/* Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">
                        Total de cliques
                      </p>
                      <p className="text-2xl font-medium text-white">
                        {stats?.totalClicks ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">
                        Slug gerado por
                      </p>
                      <p className="text-2xl font-medium text-white">
                        {stats?.link.aiGenerated ? '✦ IA' : 'Convencional'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">Criado em</p>
                      <p className="text-2xl font-medium text-white">
                        {stats
                          ? new Date(stats.link.createdAt).toLocaleDateString(
                              'pt-BR',
                            )
                          : '—'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico de cliques por dia */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="text-sm font-medium mb-5">Cliques por dia</p>
                  {chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
                      Nenhum clique registrado ainda
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorCliques"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#71717a', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#71717a', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          labelStyle={{ color: '#a1a1aa' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cliques"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#colorCliques)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Browser + Referer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <p className="text-sm font-medium mb-4">Por navegador</p>
                    {browserData.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
                        Sem dados
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={browserData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {browserData.map((_, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: '#18181b',
                              border: '1px solid #27272a',
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                            itemStyle={{ color: '#10b981' }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                              <span style={{ color: '#a1a1aa', fontSize: 11 }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-800">
                      <p className="text-sm font-medium">Por origem</p>
                    </div>
                    {refererData.length === 0 ? (
                      <div className="p-5 text-zinc-500 text-sm">Sem dados</div>
                    ) : (
                      <div className="divide-y divide-zinc-800">
                        {refererData.slice(0, 6).map(([referer, count]) => (
                          <div
                            key={referer}
                            className="flex items-center justify-between px-5 py-3"
                          >
                            <p className="text-sm text-zinc-300 truncate max-w-xs">
                              {referer}
                            </p>
                            <span className="text-sm font-medium text-white ml-4">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
