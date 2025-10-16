'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, Stats } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Нет данных для отображения</p>
        </div>
      </Layout>
    );
  }

  // Подготовка данных для графиков
  const dailyData = Object.entries(stats.daily_stats)
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      actions: data.count,
      points: data.points,
    }))
    .slice(-7); // Последние 7 дней

  const categoryData = Object.entries(stats.category_stats).map(([category, data]) => ({
    category: getCategoryName(category),
    count: data.count,
    points: data.points,
  }));

  function getCategoryName(category: string): string {
    const names: Record<string, string> = {
      waste: 'Мусор',
      plastic: 'Пластик',
      transport: 'Транспорт',
      water: 'Вода',
      energy: 'Энергия',
      nature: 'Природа',
      food: 'Еда',
      custom: 'Другое',
    };
    return names[category] || category;
  }

  return (
    <Layout>
      <div className="md:ml-64 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Статистика</h1>
            <p className="text-gray-600">Ваш экологический прогресс</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Всего действий</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total_actions}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Всего очков</p>
                  <p className="text-3xl font-bold text-primary">{stats.total_points}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  🌱
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">CO₂ сэкономлено</p>
                  <p className="text-3xl font-bold text-green-600">{stats.co2_saved.toFixed(1)} кг</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  🌍
                </div>
              </div>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Активность за неделю</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actions"
                  stroke="#3CB371"
                  strokeWidth={3}
                  dot={{ fill: '#3CB371', r: 5 }}
                  name="Действия"
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#32CD32"
                  strokeWidth={3}
                  dot={{ fill: '#32CD32', r: 5 }}
                  name="Очки"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Статистика по категориям</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#3CB371" radius={[8, 8, 0, 0]} name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
