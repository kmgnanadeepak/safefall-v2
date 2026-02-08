import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import NotificationsDropdown from '../components/NotificationsDropdown';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientNav = [
    { to: '/patient', label: 'Dashboard' },
    { to: '/patient/contacts', label: 'Contacts' },
    { to: '/patient/health-profile', label: 'Health' },
    { to: '/patient/fall-history', label: 'History' },
    { to: '/patient/map', label: 'Map' },
    { to: '/patient/analytics', label: 'Analytics' },
  ];

  const hospitalNav = [
    { to: '/hospital', label: 'Dashboard' },
  ];

  const nav = user?.role === 'patient' ? patientNav : hospitalNav;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B]">
      <header className="sticky top-0 z-40 glass-card mx-4 mt-4 mb-2">
        <div className="relative flex items-center justify-between p-4">
          <NavLink to={user?.role === 'patient' ? '/patient' : '/hospital'} className="font-bold text-xl text-primary">
            SafeFall AI
          </NavLink>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <nav className={`${mobileNavOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-full left-0 right-0 mt-2 md:mt-0 md:top-auto p-4 md:p-0 gap-2 glass-card md:bg-transparent md:border-0`}>
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to.endsWith('patient') || to.endsWith('hospital')}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user?.role === 'patient' && <NotificationsDropdown />}
            <ThemeToggle />
            <span className="text-sm text-gray-400 hidden sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="btn-secondary py-2 px-4 text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 pb-8">
        {children}
      </main>
    </div>
  );
}
