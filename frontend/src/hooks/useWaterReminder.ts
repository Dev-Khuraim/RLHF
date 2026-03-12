import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ReminderSettings } from '../api';

function isInQuietHours(quietStart: string, quietEnd: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  // Wraps midnight (e.g. 22:00 - 08:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function useWaterReminder() {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    interval_minutes: 60,
    quiet_start: '22:00',
    quiet_end: '08:00',
  });
  const [showReminder, setShowReminder] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api
      .getReminderSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();

    if (!settings.enabled) return;

    const check = () => {
      if (!isInQuietHours(settings.quiet_start, settings.quiet_end)) {
        setShowReminder(true);
      }
    };

    timerRef.current = setInterval(check, settings.interval_minutes * 60 * 1000);

    return clearTimer;
  }, [
    settings.enabled,
    settings.interval_minutes,
    settings.quiet_start,
    settings.quiet_end,
    clearTimer,
  ]);

  const dismissReminder = useCallback(() => setShowReminder(false), []);

  const updateSettings = useCallback(async (newSettings: ReminderSettings) => {
    const saved = await api.updateReminderSettings(newSettings);
    setSettings(saved);
  }, []);

  return { settings, showReminder, dismissReminder, updateSettings, loading };
}
