import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import api from '../api/gateway';

const Header = ({ onMenuClick, searchPlaceholder = 'Search applications...' }) => {
  const { user } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  const displayName = user?.name || 'User';

  /* ── Search state ── */
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState({ applications: [], interviews: [] });
  const [searching, setSearching] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  /* Fetch notifications count on mount */
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Debounced search */
  const doSearch = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults({ applications: [], interviews: [] });
      setDropOpen(false);
      return;
    }
    setSearching(true);
    try {
      const [appsRes, itvRes] = await Promise.all([
        api.get(`/applications?search=${encodeURIComponent(q)}`),
        api.get(`/interviews?search=${encodeURIComponent(q)}`),
      ]);
      setResults({
        applications: (appsRes.data || []).slice(0, 5),
        interviews:   (itvRes.data  || []).slice(0, 5),
      });
      setDropOpen(true);
    } catch {
      /* silent */
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setDropOpen(false); return; }
    debounceRef.current = setTimeout(() => doSearch(q), 340);
  };

  const handleResultClick = (path) => {
    setDropOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = results.applications.length > 0 || results.interviews.length > 0;

  return (
    <header className="ct-header" id="app-header">
      {/* Mobile hamburger */}
      <button className="icon-btn hamburger-btn" onClick={onMenuClick} aria-label="Open menu" id="mobile-menu-btn">
        <Menu size={19} />
      </button>

      {/* Search */}
      <div className="search-wrap" ref={searchRef} style={{ position: 'relative', flex: 1 }}>
        <Search size={15} className="search-icon" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="ct-search-input"
          aria-label="Search"
          id="global-search"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => { if (hasResults) setDropOpen(true); }}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setDropOpen(false); }}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ct-text-muted)', padding: '2px', display: 'flex' }}
          >
            <X size={13} />
          </button>
        )}

        {/* Search Dropdown */}
        {dropOpen && (
          <div className="search-dropdown" id="search-dropdown">
            {searching && (
              <div style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--ct-text-muted)', textAlign: 'center' }}>
                Searching…
              </div>
            )}

            {!searching && !hasResults && query.length >= 2 && (
              <div style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--ct-text-muted)', textAlign: 'center' }}>
                No results for "<strong>{query}</strong>"
              </div>
            )}

            {!searching && results.applications.length > 0 && (
              <div>
                <div className="search-group-label">Applications</div>
                {results.applications.map((app) => (
                  <button key={app._id} className="search-result-item"
                    onClick={() => handleResultClick(`/applications/${app._id}`)}>
                    <div className="search-result-avatar" style={{ background: `${app.color || 'var(--ct-primary)'}20`, color: app.color || 'var(--ct-primary)' }}>
                      {app.logo || app.company?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--ct-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)' }}>{app.company} · {app.status}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searching && results.interviews.length > 0 && (
              <div>
                <div className="search-group-label">Interviews</div>
                {results.interviews.map((itv) => (
                  <button key={itv._id} className="search-result-item"
                    onClick={() => handleResultClick('/schedule')}>
                    <div className="search-result-avatar" style={{ background: 'var(--ct-primary-light)', color: 'var(--ct-primary)' }}>
                      {itv.company?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--ct-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itv.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)' }}>{itv.company} · {itv.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right cluster */}
      <div className="header-right">
        {/* Bell with unread badge */}
        <button
          className="icon-btn"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          id="header-notifications"
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative' }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '4px', right: '4px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: 'var(--ct-danger)', color: '#fff',
              fontSize: '9px', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--ct-bg)',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="header-user">
          <div className="header-user-info">
            <div className="header-user-name">{displayName}</div>
            <div className="header-user-role">{user?.email}</div>
          </div>
          <div className="header-avatar" id="header-avatar" title={displayName}
            onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
            {displayName[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
