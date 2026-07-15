import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (user) => {
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'space_owner') navigate('/owner');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      redirectByRole(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl">Welcome back</h1>
          <p className="text-ink/60 mt-2">Log in to find or manage co-working spaces.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-8 space-y-5">
          {error && (
            <div className="bg-coral-light text-coral text-sm rounded-md px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 focus:border-brand outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 focus:border-brand outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-paper font-semibold py-2.5 rounded-md hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-ink/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        <div className="mt-6 text-xs text-ink/40 text-center font-data">
          Demo logins — user1@flexospace.com / user123 · owner1@flexospace.com / owner123 · admin@flexospace.com / admin123
        </div>
      </div>
    </div>
  );
};

export default Login;
