import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalSetting from '../components/GoalSetting';

describe('GoalSetting', () => {
  it('displays current goal in view mode', () => {
    render(<GoalSetting currentGoal={2000} onSave={vi.fn()} />);
    expect(screen.getByText('2000 ml')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('switches to edit mode when Change is clicked', async () => {
    render(<GoalSetting currentGoal={2000} onSave={vi.fn()} />);
    await userEvent.click(screen.getByText('Change'));
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSave with new goal value', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<GoalSetting currentGoal={2000} onSave={onSave} />);

    await userEvent.click(screen.getByText('Change'));
    const input = screen.getByDisplayValue('2000');
    await userEvent.clear(input);
    await userEvent.type(input, '3000');
    await userEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith(3000);
  });

  it('returns to view mode when Cancel is clicked', async () => {
    render(<GoalSetting currentGoal={2000} onSave={vi.fn()} />);
    await userEvent.click(screen.getByText('Change'));
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });
});
