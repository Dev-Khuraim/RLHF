import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../AuthContext';

// Mock the api module so AuthContext doesn't make real network calls
vi.mock('../api', () => ({
  api: {
    getMe: vi.fn().mockRejectedValue(new Error('no token')),
    login: vi
      .fn()
      .mockResolvedValue({ token: 'tok', user: { id: 1, email: 'a@b.com', daily_goal_ml: 2000 } }),
    register: vi
      .fn()
      .mockResolvedValue({ token: 'tok', user: { id: 1, email: 'a@b.com', daily_goal_ml: 2000 } }),
  },
}));

function renderLogin() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the login form by default', () => {
    renderLogin();
    expect(screen.getByText('Water Tracker')).toBeInTheDocument();
    expect(screen.getByText('Stay hydrated, stay healthy')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('toggles to register mode', async () => {
    renderLogin();
    await userEvent.click(screen.getByText('Sign up'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('toggles back to login mode', async () => {
    renderLogin();
    await userEvent.click(screen.getByText('Sign up'));
    await userEvent.click(screen.getByText('Log in'));
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('has email and password inputs', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has required attributes on inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email')).toBeRequired();
    expect(screen.getByPlaceholderText('Password')).toBeRequired();
  });
});
