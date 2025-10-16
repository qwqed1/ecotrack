'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, User } from '@/lib/api';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leaderboardData, userData] = await Promise.all([
        api.getLeaderboard(),
        api.getProfile(),
      ]);

      setLeaderboard(leaderboardData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Ошибка загрузки рейтинга:', error);
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

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <Layout>
      <div className="md:ml-64 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Таблица лидеров</h1>
            <p className="text-gray-600">Топ эко-героев</p>
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-end justify-center space-x-4">
                {/* Second Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <img
                    src={leaderboard[1].avatar_url}
                    alt={leaderboard[1].name}
                    className="w-20 h-20 rounded-full border-4 border-gray-400 mb-2"
                  />
                  <div className="text-3xl mb-2">🥈</div>
                  <h3 className="font-semibold text-gray-800 text-center">{leaderboard[1].name}</h3>
                  <p className="text-sm text-gray-600">{leaderboard[1].eco_points} очков</p>
                  <div className="w-24 h-20 bg-gray-400 rounded-t-lg mt-4 flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                </motion.div>

                {/* First Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center -mt-8"
                >
                  <img
                    src={leaderboard[0].avatar_url}
                    alt={leaderboard[0].name}
                    className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-2"
                  />
                  <div className="text-4xl mb-2">🥇</div>
                  <h3 className="font-semibold text-gray-800 text-center">{leaderboard[0].name}</h3>
                  <p className="text-sm text-gray-600">{leaderboard[0].eco_points} очков</p>
                  <div className="w-24 h-28 bg-yellow-400 rounded-t-lg mt-4 flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                </motion.div>

                {/* Third Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <img
                    src={leaderboard[2].avatar_url}
                    alt={leaderboard[2].name}
                    className="w-20 h-20 rounded-full border-4 border-orange-400 mb-2"
                  />
                  <div className="text-3xl mb-2">🥉</div>
                  <h3 className="font-semibold text-gray-800 text-center">{leaderboard[2].name}</h3>
                  <p className="text-sm text-gray-600">{leaderboard[2].eco_points} очков</p>
                  <div className="w-24 h-16 bg-orange-400 rounded-t-lg mt-4 flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Полный рейтинг</h2>
            <div className="space-y-3">
              {leaderboard.map((user, index) => {
                const isCurrentUser = currentUser && user.id === currentUser.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg transition ${
                      isCurrentUser
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 text-center">
                        <span className="text-xl font-bold text-gray-600">
                          {getMedalEmoji(index + 1)}
                        </span>
                      </div>
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                              Вы
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">Уровень {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{user.eco_points}</p>
                      <p className="text-xs text-gray-500">очков</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
