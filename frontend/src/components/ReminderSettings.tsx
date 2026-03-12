import { useState } from 'react';
import { ReminderSettings as ReminderSettingsType } from '../api';

const INTERVAL_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

interface Props {
  settings: ReminderSettingsType;
  onSave: (settings: ReminderSettingsType) => Promise<void>;
}

export default function ReminderSettings({ settings, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [enabled, setEnabled] = useState(settings.enabled);
  const [interval, setInterval] = useState(settings.interval_minutes);
  const [quietStart, setQuietStart] = useState(settings.quiet_start);
  const [quietEnd, setQuietEnd] = useState(settings.quiet_end);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      await onSave({
        enabled: next,
        interval_minutes: interval,
        quiet_start: quietStart,
        quiet_end: quietEnd,
      });
    } catch {
      setEnabled(!next);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        enabled,
        interval_minutes: interval,
        quiet_start: quietStart,
        quiet_end: quietEnd,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEnabled(settings.enabled);
    setInterval(settings.interval_minutes);
    setQuietStart(settings.quiet_start);
    setQuietEnd(settings.quiet_end);
    setEditing(false);
  };

  const intervalLabel =
    INTERVAL_OPTIONS.find((o) => o.value === settings.interval_minutes)?.label ||
    `${settings.interval_minutes} min`;

  if (!editing) {
    return (
      <div className="reminder-display">
        <div className="reminder-toggle-row">
          <span className="reminder-label">Reminders</span>
          <button
            className={`toggle-switch ${enabled ? 'toggle-on' : ''}`}
            onClick={handleToggle}
            disabled={saving}
            role="switch"
            aria-checked={enabled}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {settings.enabled && (
          <div className="reminder-summary">
            <span>
              Every {intervalLabel} &middot; Quiet {settings.quiet_start}&ndash;{settings.quiet_end}
            </span>
            <button className="link-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="reminder-editor">
      <div className="reminder-field">
        <label>Remind every</label>
        <div className="interval-options">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`interval-btn ${interval === opt.value ? 'interval-btn-active' : ''}`}
              onClick={() => setInterval(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="reminder-field">
        <label>Quiet hours</label>
        <div className="quiet-hours-row">
          <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
          <span>to</span>
          <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
        </div>
      </div>
      <div className="reminder-editor-actions">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          Save
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
