import { useState, forwardRef } from 'react';

const PRESETS = [250, 500, 750, 1000];
const MAX_ML = 5000;

interface Props {
  onAdd: (amount: number, note?: string) => Promise<void>;
}

const AddWaterForm = forwardRef<HTMLInputElement, Props>(function AddWaterForm({ onAdd }, ref) {
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentMl = Number(amount);
  const isValid = amount !== '' && currentMl >= 1 && currentMl <= MAX_ML;

  const selectPreset = (ml: number) => {
    if (selectedPreset === ml) {
      setSelectedPreset(null);
      setAmount('');
    } else {
      setSelectedPreset(ml);
      setAmount(String(ml));
    }
  };

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setAmount('');
      setSelectedPreset(null);
      return;
    }
    const num = Math.min(Number(cleaned), MAX_ML);
    setAmount(String(num));
    setSelectedPreset(PRESETS.includes(num) ? num : null);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onAdd(currentMl, note || undefined);
      setAmount('');
      setSelectedPreset(null);
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-water-form">
      <h3>Log Water</h3>
      <div className="preset-selector" role="group" aria-label="Preset amounts">
        {PRESETS.map((ml) => (
          <button
            key={ml}
            type="button"
            className={`preset-btn${selectedPreset === ml ? ' preset-btn-active' : ''}`}
            disabled={submitting}
            onClick={() => selectPreset(ml)}
            aria-pressed={selectedPreset === ml}
          >
            {ml} ml
          </button>
        ))}
      </div>
      <div className="custom-input-row">
        <div className="amount-input-wrapper">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            placeholder="Custom ml"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            aria-label="Amount in milliliters"
          />
          {amount && !isValid && <span className="amount-hint">1 &ndash; {MAX_ML} ml</span>}
        </div>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button disabled={submitting || !isValid} onClick={handleSubmit}>
          Add
        </button>
      </div>
    </div>
  );
});

export default AddWaterForm;
