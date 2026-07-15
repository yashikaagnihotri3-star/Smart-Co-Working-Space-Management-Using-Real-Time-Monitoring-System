import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'space_owner') navigate('/owner');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl">Create your account</h1>
          <p className="text-ink/60 mt-2">Join FlexoSpace as a member or a space owner.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-8 space-y-5">
          {error && (
            <div className="bg-coral-light text-coral text-sm rounded-md px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1.5">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'user' })}
                className={`px-3 py-2.5 rounded-md border text-sm font-semibold transition-colors ${
                  form.role === 'user'
                    ? 'border-brand bg-brand-light text-brand-dark'
                    : 'border-line text-ink/60'
                }`}
              >
                Space seeker
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'space_owner' })}
                className={`px-3 py-2.5 rounded-md border text-sm font-semibold transition-colors ${
                  form.role === 'space_owner'
                    ? 'border-brand bg-brand-light text-brand-dark'
                    : 'border-line text-ink/60'
                }`}
              >
                Space owner
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 focus:border-brand outline-none"
              placeholder="Jane Doe"
            />
          </div>

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
            <label className="block text-sm font-semibold mb-1.5">Phone (optional)</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 focus:border-brand outline-none"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 focus:border-brand outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-paper font-semibold py-2.5 rounded-md hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
