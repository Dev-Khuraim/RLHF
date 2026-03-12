import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { useAuth } from '../AuthContext';
import { api, WaterEntry, WeeklyData } from '../api';
import ProgressRing from '../components/ProgressRing';
import AddWaterForm from '../components/AddWaterForm';
import EntryList from '../components/EntryList';
import WeeklyChart from '../components/WeeklyChart';
import GoalSetting from '../components/GoalSetting';
import ReminderSettings from '../components/ReminderSettings';
import ReminderToast from '../components/ReminderToast';
import { useWaterReminder } from '../hooks/useWaterReminder';

export default function Dashboard() {
  const { user, logout, setUser } = useAuth();
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [weekly, setWeekly] = useState<WeeklyData[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const addWaterInputRef = useRef<HTMLInputElement>(null);
  const {
    settings: reminderSettings,
    showReminder,
    dismissReminder,
    updateSettings: updateReminderSettings,
  } = useWaterReminder();

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const avatarLetter = user?.email?.charAt(0).toUpperCase() ?? '?';

  const scrollToLogForm = useCallback(() => {
    addWaterInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => addWaterInputRef.current?.focus(), 400);
  }, []);

  const todayTotal = entries.reduce((sum, e) => sum + e.amount_ml, 0);

  const refresh = useCallback(async () => {
    const [todayData, weeklyData, streakData] = await Promise.all([
      api.getTodayEntries(),
      api.getWeekly(),
      api.getStreak(),
    ]);
    setEntries(todayData.entries);
    setWeekly(weeklyData.weekly);
    setStreak(streakData.streak);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleAdd = async (amount: number, note?: string) => {
    await api.addEntry(amount, note);
    await refresh();
  };

  const handleUpdate = async (id: number, amount_ml: number, note?: string) => {
    await api.updateEntry(id, amount_ml, note);
    await refresh();
  };

  const handleDelete = async (id: number) => {
    await api.deleteEntry(id);
    await refresh();
  };

  const handleGoalSave = async (goal: number) => {
    await api.updateGoal(goal);
    setUser({ ...user!, daily_goal_ml: goal });
    await refresh();
  };

  const handleQuickLog = async () => {
    await api.addEntry(250);
    dismissReminder();
    await refresh();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo-icon">💧</span>
          <h1>Water Tracker</h1>
        </div>
        <div className="header-divider" />
        <div className="header-right">
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
            >
              <span className="user-avatar">{avatarLetter}</span>
              <span className="user-email">{user?.email}</span>
              <svg
                className={`user-menu-chevron ${menuOpen ? 'chevron-open' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {menuOpen && (
              <div className="user-dropdown" id={menuId} role="menu">
                <div className="dropdown-user-info">
                  <span className="user-avatar user-avatar-lg">{avatarLetter}</span>
                  <div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item dropdown-logout"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6 14H3.333A1.333 1.333 0 012 12.667V3.333A1.333 1.333 0 013.333 2H6M10.667 11.333L14 8l-3.333-3.333M14 8H6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <section className="card progress-card">
            <h2>Today's Progress</h2>
            <ProgressRing current={todayTotal} goal={user!.daily_goal_ml} />
            <GoalSetting currentGoal={user!.daily_goal_ml} onSave={handleGoalSave} />
            <div className="streak-badge">
              🔥 <strong>{streak}</strong> day streak
            </div>
            <ReminderSettings settings={reminderSettings} onSave={updateReminderSettings} />
          </section>

          <section className="card log-card">
            <AddWaterForm ref={addWaterInputRef} onAdd={handleAdd} />
            <EntryList entries={entries} onUpdate={handleUpdate} onDelete={handleDelete} />
          </section>

          <section className="card chart-card">
            <WeeklyChart
              data={weekly}
              goal={user!.daily_goal_ml}
              onLogFirstEntry={scrollToLogForm}
            />
          </section>
        </div>
      </main>

      <ReminderToast
        visible={showReminder}
        onDismiss={dismissReminder}
        onLogWater={handleQuickLog}
      />
    </div>
  );
}
