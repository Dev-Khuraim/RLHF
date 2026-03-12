import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { WeeklyData } from '../api';

interface Props {
  data: WeeklyData[];
  goal: number;
  onLogFirstEntry?: () => void;
}

export default function WeeklyChart({ data, goal, onLogFirstEntry }: Props) {
  const hasData = data.some((d) => d.total_ml > 0);

  if (!hasData) {
    return (
      <div className="weekly-chart">
        <h3>Weekly History</h3>
        <div className="weekly-empty">
          <svg
            className="weekly-empty-icon"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="8" y="50" width="10" height="22" rx="3" fill="#dbeafe" />
            <rect x="23" y="42" width="10" height="30" rx="3" fill="#bfdbfe" />
            <rect x="38" y="34" width="10" height="38" rx="3" fill="#93c5fd" />
            <rect x="53" y="26" width="10" height="46" rx="3" fill="#60a5fa" />
            <path
              d="M64 14 C64 14 60 22 60 26 C60 29 62 31 64 31 C66 31 68 29 68 26 C68 22 64 14 64 14Z"
              fill="#3b82f6"
            />
            <line
              x1="4"
              y1="72"
              x2="72"
              y2="72"
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="weekly-empty-title">No data yet this week</p>
          <p className="weekly-empty-message">
            Start logging water to see your weekly trends here.
          </p>
          {onLogFirstEntry && (
            <button className="weekly-empty-cta" onClick={onLogFirstEntry}>
              Log your first entry
            </button>
          )}
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => {
    const date = new Date(d.date + 'T00:00:00');
    return {
      name: date.toLocaleDateString([], { weekday: 'short' }),
      ml: d.total_ml,
    };
  });

  return (
    <div className="weekly-chart">
      <h3>Weekly History</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value} ml`, 'Intake']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <ReferenceLine
            y={goal}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'Goal', position: 'right', fontSize: 11, fill: '#f59e0b' }}
          />
          <Bar dataKey="ml" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
