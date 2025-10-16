'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, User, Achievement, UserAction } from '@/lib/api';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActions, setRecentActions] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, achievementsData, actionsData] = await Promise.all([
        api.getProfile(),
        api.getAchievements(),
        api.getUserActions(),
      ]);

      setUser(userData);
      setAchievements(achievementsData);
      setRecentActions(actionsData.slice(0, 10));
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
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

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Не удалось загрузить профиль</p>
        </div>
      </Layout>
    );
  }

  const nextLevelPoints = user.level * 100;
  const currentLevelProgress = ((user.eco_points % 100) / 100) * 100;

  return (
    <Layout>
      <div className="md:ml-64 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Профиль</h1>
            <p className="text-gray-600">Ваши достижения и прогресс</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-primary"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-primary/10 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">Уровень</p>
                    <p className="text-2xl font-bold text-primary">{user.level}</p>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">Экопоинты</p>
                    <p className="text-2xl font-bold text-green-600">{user.eco_points}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Прогресс до уровня {user.level + 1}</span>
                <span className="text-sm text-gray-600">{user.eco_points % 100} / 100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentLevelProgress}%` }}
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Достижения</h2>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20"
                  >
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Пока нет достижений. Продолжайте выполнять эко-действия!</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Последние действия</h2>
            {recentActions.length > 0 ? (
              <div className="space-y-3">
                {recentActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{action.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(action.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-primary font-semibold">+{action.points} 🌱</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Нет выполненных действий</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
