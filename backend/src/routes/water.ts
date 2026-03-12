import { Router, Response } from 'express';
import db from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Get today's entries
router.get('/today', (req: AuthRequest, res: Response) => {
  const entries = db
    .prepare(
      `SELECT id, amount_ml, logged_at, note FROM water_entries
       WHERE user_id = ? AND date(logged_at) = date('now')
       ORDER BY logged_at DESC`,
    )
    .all(req.userId!);
  res.json({ entries });
});

// Get weekly summary (last 7 days)
router.get('/weekly', (req: AuthRequest, res: Response) => {
  const rows = db
    .prepare(
      `SELECT date(logged_at) as date, SUM(amount_ml) as total_ml
       FROM water_entries
       WHERE user_id = ? AND date(logged_at) >= date('now', '-6 days')
       GROUP BY date(logged_at)
       ORDER BY date(logged_at) ASC`,
    )
    .all(req.userId!) as { date: string; total_ml: number }[];

  // Fill in missing days with 0
  const result: { date: string; total_ml: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = rows.find((r) => r.date === dateStr);
    result.push({ date: dateStr, total_ml: found ? found.total_ml : 0 });
  }

  res.json({ weekly: result });
});

// Get streak count
router.get('/streak', (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT daily_goal_ml FROM users WHERE id = ?').get(req.userId!) as {
    daily_goal_ml: number;
  };

  const days = db
    .prepare(
      `SELECT date(logged_at) as date, SUM(amount_ml) as total_ml
       FROM water_entries
       WHERE user_id = ?
       GROUP BY date(logged_at)
       ORDER BY date(logged_at) DESC`,
    )
    .all(req.userId!) as { date: string; total_ml: number }[];

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];

    if (days[i].date === expectedStr && days[i].total_ml >= user.daily_goal_ml) {
      streak++;
    } else if (i === 0 && days[i].date !== expectedStr) {
      // Today has no entries yet — check if yesterday started the streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (days[i].date === yesterdayStr && days[i].total_ml >= user.daily_goal_ml) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  res.json({ streak });
});

// Add a water entry
router.post('/', (req: AuthRequest, res: Response) => {
  const { amount_ml, note } = req.body;

  if (!amount_ml || typeof amount_ml !== 'number' || amount_ml <= 0) {
    res.status(400).json({ error: 'amount_ml must be a positive number' });
    return;
  }

  const result = db
    .prepare('INSERT INTO water_entries (user_id, amount_ml, note) VALUES (?, ?, ?)')
    .run(req.userId!, amount_ml, note || null);

  const entry = db
    .prepare('SELECT id, amount_ml, logged_at, note FROM water_entries WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json({ entry });
});

// Get reminder settings
router.get('/reminders', (req: AuthRequest, res: Response) => {
  const settings = db
    .prepare(
      'SELECT enabled, interval_minutes, quiet_start, quiet_end FROM reminder_settings WHERE user_id = ?',
    )
    .get(req.userId!) as
    | { enabled: number; interval_minutes: number; quiet_start: string; quiet_end: string }
    | undefined;

  if (settings) {
    res.json({
      enabled: !!settings.enabled,
      interval_minutes: settings.interval_minutes,
      quiet_start: settings.quiet_start,
      quiet_end: settings.quiet_end,
    });
  } else {
    res.json({ enabled: false, interval_minutes: 60, quiet_start: '22:00', quiet_end: '08:00' });
  }
});

// Update reminder settings
router.put('/reminders', (req: AuthRequest, res: Response) => {
  const { enabled, interval_minutes, quiet_start, quiet_end } = req.body;

  if (typeof enabled !== 'boolean') {
    res.status(400).json({ error: 'enabled must be a boolean' });
    return;
  }
  if (
    !interval_minutes ||
    typeof interval_minutes !== 'number' ||
    interval_minutes < 15 ||
    interval_minutes > 240
  ) {
    res.status(400).json({ error: 'interval_minutes must be between 15 and 240' });
    return;
  }
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(quiet_start) || !timeRegex.test(quiet_end)) {
    res.status(400).json({ error: 'quiet_start and quiet_end must be in HH:MM format' });
    return;
  }

  db.prepare(
    `INSERT INTO reminder_settings (user_id, enabled, interval_minutes, quiet_start, quiet_end)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET enabled = ?, interval_minutes = ?, quiet_start = ?, quiet_end = ?`,
  ).run(
    req.userId!,
    enabled ? 1 : 0,
    interval_minutes,
    quiet_start,
    quiet_end,
    enabled ? 1 : 0,
    interval_minutes,
    quiet_start,
    quiet_end,
  );

  res.json({ enabled, interval_minutes, quiet_start, quiet_end });
});

// Update daily goal (must be before /:id to avoid param capture)
router.put('/goal', (req: AuthRequest, res: Response) => {
  const { daily_goal_ml } = req.body;

  if (!daily_goal_ml || typeof daily_goal_ml !== 'number' || daily_goal_ml <= 0) {
    res.status(400).json({ error: 'daily_goal_ml must be a positive number' });
    return;
  }

  db.prepare('UPDATE users SET daily_goal_ml = ? WHERE id = ?').run(daily_goal_ml, req.userId!);
  res.json({ daily_goal_ml });
});

// Update an entry (today only)
router.put('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount_ml, note } = req.body;

  const entry = db
    .prepare(
      `SELECT id FROM water_entries
       WHERE id = ? AND user_id = ? AND date(logged_at) = date('now')`,
    )
    .get(id, req.userId!);

  if (!entry) {
    res.status(404).json({ error: 'Entry not found or not editable' });
    return;
  }

  if (!amount_ml || typeof amount_ml !== 'number' || amount_ml <= 0) {
    res.status(400).json({ error: 'amount_ml must be a positive number' });
    return;
  }

  db.prepare('UPDATE water_entries SET amount_ml = ?, note = ? WHERE id = ?').run(
    amount_ml,
    note || null,
    id,
  );
  const updated = db
    .prepare('SELECT id, amount_ml, logged_at, note FROM water_entries WHERE id = ?')
    .get(id);
  res.json({ entry: updated });
});

// Delete an entry (today only)
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const entry = db
    .prepare(
      `SELECT id FROM water_entries
       WHERE id = ? AND user_id = ? AND date(logged_at) = date('now')`,
    )
    .get(id, req.userId!);

  if (!entry) {
    res.status(404).json({ error: 'Entry not found or not deletable' });
    return;
  }

  db.prepare('DELETE FROM water_entries WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
