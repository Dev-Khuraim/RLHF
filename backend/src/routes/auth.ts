import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashed);
  const token = generateToken(result.lastInsertRowid as number);

  res.status(201).json({ token, user: { id: result.lastInsertRowid, email, daily_goal_ml: 2000 } });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db
    .prepare('SELECT id, email, password, daily_goal_ml FROM users WHERE email = ?')
    .get(email) as
    | { id: number; email: string; password: string; daily_goal_ml: number }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email, daily_goal_ml: user.daily_goal_ml } });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db
    .prepare('SELECT id, email, daily_goal_ml FROM users WHERE id = ?')
    .get(req.userId!) as { id: number; email: string; daily_goal_ml: number } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

export default router;
