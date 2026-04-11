import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, GitBranch, CalendarDays,
  BarChart2, Settings, LogOut, Plus, X,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const navItems = [
  { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { path: '/applications', icon: Briefcase,       label: 'Applications' },
  { path: '/pipeline',     icon: GitBranch,       label: 'Pipeline'     },
  { path: '/schedule',     icon: CalendarDays,    label: 'Schedule'     },
  { path: '/analytics',    icon: BarChart2,       label: 'Analytics'    },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdd = () => {
    navigate('/applications');
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1>CareerTrack</h1>
              <p>Premium Job Tracking</p>
            </div>
            {/* Close button visible on mobile only via CSS */}
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                padding: '4px', borderRadius: '6px',
                display: 'none',
              }}
              className="sidebar-close-mobile"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              id={`nav-${label.toLowerCase()}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="sidebar-bottom">
          <button className="sidebar-add-btn" onClick={handleAdd} id="sidebar-add-btn">
            <Plus size={17} />
            Add New Application
          </button>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            id="nav-settings"
          >
            <Settings size={15} />
            <span>Settings</span>
          </NavLink>

          <button className="sidebar-link" onClick={handleLogout} id="nav-logout">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile close button style injection */}
      <style>{`
        @media (max-width: 900px) {
          .sidebar-close-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
