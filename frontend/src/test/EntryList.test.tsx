import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryList from '../components/EntryList';
import { WaterEntry } from '../api';

const mockEntries: WaterEntry[] = [
  { id: 1, amount_ml: 500, logged_at: '2025-01-20 10:30:00', note: 'morning' },
  { id: 2, amount_ml: 250, logged_at: '2025-01-20 14:00:00', note: null },
];

describe('EntryList', () => {
  it('shows empty message when no entries', () => {
    render(<EntryList entries={[]} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('No entries yet today. Start logging!')).toBeInTheDocument();
  });

  it('renders entries with amounts', () => {
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('500 ml')).toBeInTheDocument();
    expect(screen.getByText('250 ml')).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('morning')).toBeInTheDocument();
  });

  it('renders edit and delete buttons for each entry', () => {
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  it('opens confirmation modal when Delete is clicked', async () => {
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onDelete only after confirming in modal', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={onDelete} />);

    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(onDelete).not.toHaveBeenCalled();

    const confirmBtn = screen.getByRole('dialog').querySelector('.modal-confirm-btn')!;
    await userEvent.click(confirmBtn);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('closes modal without deleting when Cancel is clicked', async () => {
    const onDelete = vi.fn();
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={onDelete} />);

    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('dialog').querySelector('.modal-cancel-btn')!;
    await userEvent.click(cancelBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('switches to edit mode when Edit is clicked', async () => {
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    await userEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onUpdate with new values when Save is clicked', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<EntryList entries={mockEntries} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await userEvent.click(screen.getAllByText('Edit')[0]);

    const amountInput = screen.getByDisplayValue('500');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '600');

    await userEvent.click(screen.getByText('Save'));
    expect(onUpdate).toHaveBeenCalledWith(1, 600, 'morning');
  });

  it('exits edit mode when Cancel is clicked', async () => {
    render(<EntryList entries={mockEntries} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    await userEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByText('Save')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });
});
