import { useState } from 'react';

interface Props {
  currentGoal: number;
  onSave: (goal: number) => Promise<void>;
}

export default function GoalSetting({ currentGoal, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentGoal));

  const save = async () => {
    const ml = Number(value);
    if (ml > 0) {
      await onSave(ml);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <div className="goal-display">
        <span>
          Daily Goal: <strong>{currentGoal} ml</strong>
        </span>
        <button
          className="link-btn"
          onClick={() => {
            setValue(String(currentGoal));
            setEditing(true);
          }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="goal-edit">
      <input type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} />
      <span>ml</span>
      <button onClick={save}>Save</button>
      <button className="cancel-btn" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </div>
  );
}
