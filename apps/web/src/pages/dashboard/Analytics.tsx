import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/api';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Card, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
const RANGES = [7, 30, 90];

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

export function Analytics() {
  const navigate = useNavigate();
  const [range, setRange] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await analyticsService.overview();
      return data;
    },
  });

  const links: Link[] = data?.links ?? [];

  // Métricas gerais
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const avgClicks = links.length ? (totalClicks / links.length).toFixed(1) : 0;
  const topLink = links.reduce(
    (a, b) => (a.clicks > b.clicks ? a : b),
    links[0],
  );
  const aiCount = links.filter((l) => l.aiGenerated).length;
  const conventionalCount = links.length - aiCount;

  // Gráfico de cliques por dia — simula distribuição baseada nos dados reais
  const { data: clicksData } = useQuery({
    queryKey: ['clicksByDay', range],
    queryFn: async () => {
      const { data } = await analyticsService.clicksByDay(range);
      return data;
    },
  });

  const chartData = (clicksData ?? []).map(
    (item: { date: string; clicks: number }) => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      cliques: item.clicks,
    }),
  );

  // Top 5 links mais clicados
  const topLinks = [...links]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
    .map((l) => ({
      name: l.slug.length > 20 ? l.slug.slice(0, 20) + '...' : l.slug,
      cliques: l.clicks,
      id: l.id,
    }));

  // Pizza IA vs Convencional
  const pieData = [
    { name: 'Gerado por IA', value: aiCount },
    { name: 'Convencional', value: conventionalCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            title="Analytics"
            subtitle="Visão geral de performance dos seus links"
          />

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 text-sm">Carregando...</p>
              </div>
            ) : (
              <>
                {/* Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">
                        Total de cliques
                      </p>
                      <p className="text-2xl font-medium text-white">
                        {totalClicks}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">
                        {links.length} links no total
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">
                        Média por link
                      </p>
                      <p className="text-2xl font-medium text-white">
                        {avgClicks}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">
                        cliques/link
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">
                        Link mais clicado
                      </p>
                      <p className="text-sm font-medium text-white truncate">
                        {topLink?.slug ?? '—'}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">
                        {topLink?.clicks ?? 0} cliques
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-500 mb-1">Uso de IA</p>
                      <p className="text-2xl font-medium text-white">
                        {links.length
                          ? Math.round((aiCount / links.length) * 100)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">
                        {aiCount} links com IA
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico de área — cliques por dia */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-medium">Cliques por dia</p>
                    <div className="flex gap-2">
                      {RANGES.map((r) => (
                        <button
                          key={r}
                          onClick={() => setRange(r)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            range === r
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {r}d
                        </button>
                      ))}
                    </div>
                  </div>
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
                        interval={Math.floor(range / 7)}
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
                </div>

                {/* Top links + Pizza */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Barras — top 5 links */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <p className="text-sm font-medium mb-5">
                      Top 5 links mais clicados
                    </p>
                    {topLinks.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
                        Sem dados
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={topLinks} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#27272a"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
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
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                          />
                          <Bar
                            dataKey="cliques"
                            fill="#10b981"
                            radius={[0, 4, 4, 0]}
                            onClick={(data) =>
                              navigate(`/analytics/${data.id}`)
                            }
                            style={{ cursor: 'pointer' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Pizza — IA vs Convencional */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <p className="text-sm font-medium mb-5">
                      IA vs Convencional
                    </p>
                    {pieData.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
                        Sem dados
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((_, index) => (
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
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
