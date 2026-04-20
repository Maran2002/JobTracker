import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, GitBranch, CalendarDays,
  BarChart2, Settings, LogOut, Plus, X, Bell,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';

const navItems = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { path: '/applications',  icon: Briefcase,       label: 'Applications'  },
  { path: '/pipeline',      icon: GitBranch,       label: 'Pipeline'      },
  { path: '/schedule',      icon: CalendarDays,    label: 'Schedule'      },
  { path: '/analytics',     icon: BarChart2,       label: 'Analytics'     },
  { path: '/notifications', icon: Bell,            label: 'Notifications', badge: true },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdd = () => {
    navigate('/applications/new');
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1>ApplyLog</h1>
              <p>Premium Job Tracking</p>
            </div>
            <button onClick={onClose} aria-label="Close menu"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'none' }}
              className="sidebar-close-mobile">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={17} />
                {badge && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-6px',
                    minWidth: '14px', height: '14px', borderRadius: '7px',
                    background: 'var(--ct-danger)', color: '#fff',
                    fontSize: '9px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
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

          <NavLink to="/settings" onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            id="nav-settings">
            <Settings size={15} />
            <span>Settings</span>
          </NavLink>

          <button className="sidebar-link" onClick={handleLogout} id="nav-logout">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-close-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
