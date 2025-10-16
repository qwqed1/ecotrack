const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (для быстрого старта)
// В продакшене замените на PostgreSQL
let users = [];
let ecoActions = [
  { id: 1, title: 'Сортировка мусора', category: 'waste', points: 10 },
  { id: 2, title: 'Отказ от пластика', category: 'plastic', points: 15 },
  { id: 3, title: 'Поездка на велосипеде', category: 'transport', points: 20 },
  { id: 4, title: 'Использование многоразовой бутылки', category: 'plastic', points: 10 },
  { id: 5, title: 'Покупка местных продуктов', category: 'food', points: 15 },
  { id: 6, title: 'Экономия воды', category: 'water', points: 10 },
  { id: 7, title: 'Выключение света', category: 'energy', points: 5 },
  { id: 8, title: 'Посадка дерева', category: 'nature', points: 50 },
  { id: 9, title: 'Общественный транспорт', category: 'transport', points: 15 },
  { id: 10, title: 'Вегетарианский день', category: 'food', points: 20 }
];
let userActions = [];
let nextUserId = 1;
let nextActionId = userActions.length + 1;

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверка существующего пользователя
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3CB371&color=fff`,
      eco_points: 0,
      level: 1,
      created_at: new Date().toISOString()
    };

    users.push(user);

    // Создание токена
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        eco_points: user.eco_points,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверные учетные данные' });
    }

    // Создание токена
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        eco_points: user.eco_points,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить профиль пользователя
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    eco_points: user.eco_points,
    level: user.level,
    created_at: user.created_at
  });
});

// Получить все эко-действия
app.get('/api/actions', authenticateToken, (req, res) => {
  res.json(ecoActions);
});

// Добавить выполненное действие
app.post('/api/user/actions', authenticateToken, (req, res) => {
  const { action_id, custom_action } = req.body;
  const userId = req.user.id;

  let points = 0;
  let actionTitle = '';

  if (action_id) {
    const action = ecoActions.find(a => a.id === action_id);
    if (!action) {
      return res.status(404).json({ error: 'Действие не найдено' });
    }
    points = action.points;
    actionTitle = action.title;
  } else if (custom_action) {
    points = 10; // Базовые очки за кастомное действие
    actionTitle = custom_action;
  }

  const userAction = {
    id: nextActionId++,
    user_id: userId,
    action_id: action_id || null,
    custom_action: custom_action || null,
    date: new Date().toISOString(),
    points
  };

  userActions.push(userAction);

  // Обновить очки пользователя
  const user = users.find(u => u.id === userId);
  if (user) {
    user.eco_points += points;
    user.level = Math.floor(user.eco_points / 100) + 1;
  }

  res.status(201).json({
    ...userAction,
    title: actionTitle,
    user: {
      eco_points: user.eco_points,
      level: user.level
    }
  });
});

// Получить действия пользователя
app.get('/api/user/actions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const actions = userActions
    .filter(a => a.user_id === userId)
    .map(a => {
      const action = ecoActions.find(ea => ea.id === a.action_id);
      return {
        ...a,
        title: action ? action.title : a.custom_action,
        category: action ? action.category : 'custom'
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(actions);
});

// Получить статистику пользователя
app.get('/api/user/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const actions = userActions.filter(a => a.user_id === userId);

  // Статистика по дням
  const dailyStats = {};
  actions.forEach(action => {
    const date = new Date(action.date).toISOString().split('T')[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { count: 0, points: 0 };
    }
    dailyStats[date].count++;
    dailyStats[date].points += action.points;
  });

  // Статистика по категориям
  const categoryStats = {};
  actions.forEach(action => {
    const ecoAction = ecoActions.find(a => a.id === action.action_id);
    const category = ecoAction ? ecoAction.category : 'custom';
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, points: 0 };
    }
    categoryStats[category].count++;
    categoryStats[category].points += action.points;
  });

  // CO2 сэкономлено (примерная формула)
  const co2Saved = actions.length * 2.5; // кг CO2

  res.json({
    total_actions: actions.length,
    total_points: actions.reduce((sum, a) => sum + a.points, 0),
    co2_saved: co2Saved,
    daily_stats: dailyStats,
    category_stats: categoryStats
  });
});

// Таблица лидеров
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  const leaderboard = users
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar_url: u.avatar_url,
      eco_points: u.eco_points,
      level: u.level
    }))
    .sort((a, b) => b.eco_points - a.eco_points)
    .slice(0, 10);

  res.json(leaderboard);
});

// Достижения пользователя
app.get('/api/user/achievements', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const user = users.find(u => u.id === userId);
  const actions = userActions.filter(a => a.user_id === userId);

  const achievements = [];

  // Проверка достижений
  if (actions.length >= 10) {
    achievements.push({
      id: 1,
      title: 'Первые шаги',
      description: '10 эко-действий выполнено',
      icon: '🌱',
      unlocked: true
    });
  }

  if (actions.length >= 50) {
    achievements.push({
      id: 2,
      title: 'Эко-воин',
      description: '50 эко-действий выполнено',
      icon: '🌿',
      unlocked: true
    });
  }

  if (user.eco_points >= 100) {
    achievements.push({
      id: 3,
      title: 'Сотня очков',
      description: 'Заработано 100 экопоинтов',
      icon: '💯',
      unlocked: true
    });
  }

  // Проверка недели без пластика
  const plasticActions = actions.filter(a => {
    const action = ecoActions.find(ea => ea.id === a.action_id);
    return action && action.category === 'plastic';
  });

  if (plasticActions.length >= 7) {
    achievements.push({
      id: 4,
      title: 'Неделя без пластика',
      description: '7 дней отказа от пластика',
      icon: '♻️',
      unlocked: true
    });
  }

  // Велосипед
  const bikeActions = actions.filter(a => a.action_id === 3);
  const totalBikeKm = bikeActions.length * 5; // Предполагаем 5 км за поездку

  if (totalBikeKm >= 100) {
    achievements.push({
      id: 5,
      title: '100 км на велосипеде',
      description: 'Проехано 100 км на велосипеде',
      icon: '🚴',
      unlocked: true
    });
  }

  res.json(achievements);
});

app.listen(PORT, () => {
  console.log(`🌍 EcoTrack API запущен на http://localhost:${PORT}`);
});
