import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="auth-brand">
              <span className="auth-brand-icon">💧</span>
              <h1>Water Tracker</h1>
            </div>
            <p className="auth-tagline">Stay hydrated, stay healthy</p>

            <div className="auth-illustration">
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="100" cy="100" r="90" fill="#dbeafe" opacity="0.5" />
                <path
                  d="M100 30 C100 30 55 90 55 125 C55 150 75 170 100 170 C125 170 145 150 145 125 C145 90 100 30 100 30Z"
                  fill="#3b82f6"
                  opacity="0.8"
                />
                <path
                  d="M100 50 C100 50 70 95 70 120 C70 140 83 155 100 155 C117 155 130 140 130 120 C130 95 100 50 100 50Z"
                  fill="#60a5fa"
                  opacity="0.6"
                />
                <ellipse
                  cx="85"
                  cy="115"
                  rx="8"
                  ry="12"
                  fill="white"
                  opacity="0.4"
                  transform="rotate(-15 85 115)"
                />
              </svg>
            </div>

            <ul className="auth-features">
              <li>
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 2 L10 18 M2 10 L18 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Log water intake with one tap</span>
              </li>
              <li>
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect
                      x="2"
                      y="8"
                      width="3"
                      height="10"
                      rx="1"
                      fill="currentColor"
                      opacity="0.4"
                    />
                    <rect
                      x="7"
                      y="5"
                      width="3"
                      height="13"
                      rx="1"
                      fill="currentColor"
                      opacity="0.6"
                    />
                    <rect
                      x="12"
                      y="3"
                      width="3"
                      height="15"
                      rx="1"
                      fill="currentColor"
                      opacity="0.8"
                    />
                    <rect x="17" y="1" width="3" height="17" rx="1" fill="currentColor" />
                  </svg>
                </span>
                <span>Track weekly trends with charts</span>
              </li>
              <li>
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M6 10 L9 13 L14 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Set daily goals and build streaks</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p className="auth-card-subtitle">
              {isRegister ? 'Start tracking your hydration today' : 'Sign in to continue tracking'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button type="submit" disabled={submitting}>
                {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
              </button>
            </form>

            <p className="auth-toggle">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
              >
                {isRegister ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
