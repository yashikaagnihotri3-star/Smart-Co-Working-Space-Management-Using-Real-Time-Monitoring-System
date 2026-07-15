import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabel = {
  user: 'Member',
  space_owner: 'Space Owner',
  admin: 'Admin',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'space_owner'
      ? '/owner'
      : '/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-md bg-brand flex items-center justify-center font-display font-bold text-paper">
            F
          </span>
          <span className="font-display font-bold text-lg tracking-tight">FlexoSpace</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-brand-light transition-colors">
            Find a space
          </Link>
          {user && (
            <Link to={dashboardLink} className="hover:text-brand-light transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-paper/60 font-data">{roleLabel[user.role]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md border border-paper/20 text-sm hover:bg-paper/10 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md text-sm hover:bg-paper/10 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-md bg-brand text-paper text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
