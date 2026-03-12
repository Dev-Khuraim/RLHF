import { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onLogWater: () => void;
}

export default function ReminderToast({ visible, onDismiss, onLogWater }: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (visible) setExiting(false);
  }, [visible]);

  if (!visible && !exiting) return null;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  const handleLog = () => {
    setExiting(true);
    setTimeout(() => {
      onLogWater();
      onDismiss();
    }, 300);
  };

  return (
    <div className={`reminder-toast ${exiting ? 'reminder-toast-exit' : 'reminder-toast-enter'}`}>
      <div className="reminder-toast-icon">💧</div>
      <div className="reminder-toast-body">
        <p className="reminder-toast-title">Time to hydrate!</p>
        <p className="reminder-toast-message">Stay on track with your water goal.</p>
      </div>
      <div className="reminder-toast-actions">
        <button className="reminder-log-btn" onClick={handleLog}>
          Log 250 ml
        </button>
        <button className="reminder-dismiss-btn" onClick={handleDismiss} aria-label="Dismiss">
          &times;
        </button>
      </div>
    </div>
  );
}
