const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export interface User {
  id: number;
  email: string;
  daily_goal_ml: number;
}

export interface WaterEntry {
  id: number;
  amount_ml: number;
  logged_at: string;
  note: string | null;
}

export interface WeeklyData {
  date: string;
  total_ml: number;
}

export interface ReminderSettings {
  enabled: boolean;
  interval_minutes: number;
  quiet_start: string;
  quiet_end: string;
}

export const api = {
  register(email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe() {
    return request<{ user: User }>('/auth/me');
  },

  getTodayEntries() {
    return request<{ entries: WaterEntry[] }>('/water/today');
  },

  getWeekly() {
    return request<{ weekly: WeeklyData[] }>('/water/weekly');
  },

  getStreak() {
    return request<{ streak: number }>('/water/streak');
  },

  addEntry(amount_ml: number, note?: string) {
    return request<{ entry: WaterEntry }>('/water', {
      method: 'POST',
      body: JSON.stringify({ amount_ml, note }),
    });
  },

  updateEntry(id: number, amount_ml: number, note?: string) {
    return request<{ entry: WaterEntry }>(`/water/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ amount_ml, note }),
    });
  },

  deleteEntry(id: number) {
    return request<{ success: boolean }>(`/water/${id}`, { method: 'DELETE' });
  },

  updateGoal(daily_goal_ml: number) {
    return request<{ daily_goal_ml: number }>('/water/goal', {
      method: 'PUT',
      body: JSON.stringify({ daily_goal_ml }),
    });
  },

  getReminderSettings() {
    return request<ReminderSettings>('/water/reminders');
  },

  updateReminderSettings(settings: ReminderSettings) {
    return request<ReminderSettings>('/water/reminders', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
