interface Props {
  current: number;
  goal: number;
}

export default function ProgressRing({ current, goal }: Props) {
  const pct = Math.min((current / goal) * 100, 100);
  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const met = current >= goal;

  return (
    <div className="progress-ring-container">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e3f0fa" strokeWidth={stroke} />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={met ? '#22c55e' : '#3b82f6'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-amount">{current}</span>
        <span className="progress-unit">/ {goal} ml</span>
        <span className="progress-pct">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
