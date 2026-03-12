import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddWaterForm from '../components/AddWaterForm';

describe('AddWaterForm', () => {
  it('renders preset buttons', () => {
    render(<AddWaterForm onAdd={vi.fn()} />);
    expect(screen.getByText('250 ml')).toBeInTheDocument();
    expect(screen.getByText('500 ml')).toBeInTheDocument();
    expect(screen.getByText('750 ml')).toBeInTheDocument();
    expect(screen.getByText('1000 ml')).toBeInTheDocument();
  });

  it('renders custom input fields', () => {
    render(<AddWaterForm onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText('Custom ml')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note (optional)')).toBeInTheDocument();
  });

  it('selects preset and fills input on click', async () => {
    render(<AddWaterForm onAdd={vi.fn()} />);

    await userEvent.click(screen.getByText('250 ml'));
    expect(screen.getByPlaceholderText('Custom ml')).toHaveValue('250');
    expect(screen.getByText('250 ml')).toHaveAttribute('aria-pressed', 'true');
  });

  it('deselects preset when clicked again', async () => {
    render(<AddWaterForm onAdd={vi.fn()} />);

    await userEvent.click(screen.getByText('500 ml'));
    expect(screen.getByPlaceholderText('Custom ml')).toHaveValue('500');

    await userEvent.click(screen.getByText('500 ml'));
    expect(screen.getByPlaceholderText('Custom ml')).toHaveValue('');
    expect(screen.getByText('500 ml')).toHaveAttribute('aria-pressed', 'false');
  });

  it('submits preset amount via Add button', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddWaterForm onAdd={onAdd} />);

    await userEvent.click(screen.getByText('250 ml'));
    await userEvent.click(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledWith(250, undefined);
  });

  it('calls onAdd with custom amount and note', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddWaterForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText('Custom ml'), '350');
    await userEvent.type(screen.getByPlaceholderText('Note (optional)'), 'after lunch');
    await userEvent.click(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith(350, 'after lunch');
  });

  it('clears inputs after successful add', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddWaterForm onAdd={onAdd} />);

    const amountInput = screen.getByPlaceholderText('Custom ml');
    const noteInput = screen.getByPlaceholderText('Note (optional)');

    await userEvent.type(amountInput, '350');
    await userEvent.type(noteInput, 'test');
    await userEvent.click(screen.getByText('Add'));

    expect(amountInput).toHaveValue('');
    expect(noteInput).toHaveValue('');
  });

  it('disables Add button when no amount entered', () => {
    render(<AddWaterForm onAdd={vi.fn()} />);
    expect(screen.getByText('Add')).toBeDisabled();
  });

  it('strips non-numeric characters from input', async () => {
    render(<AddWaterForm onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText('Custom ml');
    await userEvent.type(input, 'abc123xyz');
    expect(input).toHaveValue('123');
  });

  it('caps input at max value', async () => {
    render(<AddWaterForm onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText('Custom ml');
    await userEvent.type(input, '9999');
    expect(input).toHaveValue('5000');
  });

  it('auto-selects matching preset when typing its value', async () => {
    render(<AddWaterForm onAdd={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('Custom ml'), '500');
    expect(screen.getByText('500 ml')).toHaveAttribute('aria-pressed', 'true');
  });
});
