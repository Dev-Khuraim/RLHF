import { useState } from 'react';
import { WaterEntry } from '../api';

interface Props {
  entries: WaterEntry[];
  onUpdate: (id: number, amount_ml: number, note?: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function EntryList({ entries, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const startEdit = (entry: WaterEntry) => {
    setEditingId(entry.id);
    setEditAmount(String(entry.amount_ml));
    setEditNote(entry.note || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    const ml = Number(editAmount);
    if (ml <= 0) return;
    await onUpdate(id, ml, editNote || undefined);
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    await onDelete(deletingId);
    setDeletingId(null);
  };

  if (entries.length === 0) {
    return <p className="empty-text">No entries yet today. Start logging!</p>;
  }

  return (
    <div className="entry-list">
      <h3>Today's Entries</h3>
      {entries.map((entry) => {
        const time = new Date(entry.logged_at + 'Z').toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        if (editingId === entry.id) {
          return (
            <div key={entry.id} className="entry-item editing">
              <input
                type="number"
                min="1"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <input
                type="text"
                placeholder="Note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
              <div className="entry-actions">
                <button className="save-btn" onClick={() => saveEdit(entry.id)}>
                  Save
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          );
        }

        return (
          <div key={entry.id} className="entry-item">
            <div className="entry-info">
              <span className="entry-amount">{entry.amount_ml} ml</span>
              <span className="entry-time">{time}</span>
              {entry.note && <span className="entry-note">{entry.note}</span>}
            </div>
            <div className="entry-actions">
              <button className="edit-btn" onClick={() => startEdit(entry)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => setDeletingId(entry.id)}>
                Delete
              </button>
            </div>
          </div>
        );
      })}

      {deletingId !== null && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Are you sure you want to delete this?</h3>
            <p className="modal-message">
              This action cannot be undone. The entry will be permanently removed.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button className="modal-confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
