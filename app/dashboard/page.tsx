'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, EcoAction, UserAction } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [todayActions, setTodayActions] = useState<Set<number>>(new Set());
  const [customAction, setCustomAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [actionsData, userActionsData, profile] = await Promise.all([
        api.getActions(),
        api.getUserActions(),
        api.getProfile(),
      ]);

      setActions(actionsData);
      setUserActions(userActionsData);
      setPoints(profile.eco_points);
      setLevel(profile.level);

      // Получить действия за сегодня
      const today = new Date().toISOString().split('T')[0];
      const todaySet = new Set(
        userActionsData
          .filter((a) => a.date.startsWith(today) && a.action_id)
          .map((a) => a.action_id as number)
      );
      setTodayActions(todaySet);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAction = async (actionId: number) => {
    if (todayActions.has(actionId)) {
      return; // Уже выполнено сегодня
    }

    try {
      const result = await api.addUserAction(actionId);
      setTodayActions(new Set([...todayActions, actionId]));
      setPoints(result.user.eco_points);
      setLevel(result.user.level);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      loadData();
    } catch (error) {
      console.error('Ошибка добавления действия:', error);
    }
  };

  const handleAddCustomAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim()) return;

    try {
      const result = await api.addUserAction(undefined, customAction);
      setPoints(result.user.eco_points);
      setLevel(result.user.level);
      setCustomAction('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      loadData();
    } catch (error) {
      console.error('Ошибка добавления действия:', error);
    }
  };

  const todayProgress = (todayActions.size / actions.length) * 100;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:ml-64 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Notification */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎉</span>
                  <span className="font-semibold">Отлично! Очки добавлены!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Мой день</h1>
            <p className="text-gray-600">Отметьте выполненные эко-действия</p>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Прогресс сегодня</h2>
                <p className="text-sm text-gray-600">
                  {todayActions.size} из {actions.length} действий
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(todayProgress)}%</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${todayProgress}%` }}
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
              />
            </div>
          </div>

          {/* Actions List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Эко-действия</h2>
            <div className="space-y-3">
              {actions.map((action) => {
                const isCompleted = todayActions.has(action.id);
                return (
                  <motion.div
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition cursor-pointer ${
                      isCompleted
                        ? 'bg-primary/10 border-primary'
                        : 'bg-gray-50 border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => !isCompleted && handleToggleAction(action.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isCompleted ? 'bg-primary border-primary' : 'border-gray-300'
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isCompleted ? 'text-primary' : 'text-gray-800'}`}>
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">+{action.points} очков</p>
                      </div>
                    </div>
                    <div className="text-2xl">
                      {action.category === 'waste' && '♻️'}
                      {action.category === 'plastic' && '🚫'}
                      {action.category === 'transport' && '🚴'}
                      {action.category === 'water' && '💧'}
                      {action.category === 'energy' && '💡'}
                      {action.category === 'nature' && '🌳'}
                      {action.category === 'food' && '🥗'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Custom Action */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Добавить своё действие</h2>
            <form onSubmit={handleAddCustomAction} className="flex space-x-3">
              <input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="Например: Починил старую вещь"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Добавить
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
