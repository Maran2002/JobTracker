import React from 'react';
import { Bell, HelpCircle, Search, Menu } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Header = ({ onMenuClick, searchPlaceholder = 'Search applications...' }) => {
  const { user } = useAuthStore();
  const displayName = user?.name || 'Siddharth';

  return (
    <header className="ct-header" id="app-header">
      {/* Mobile hamburger */}
      <button
        className="icon-btn hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
        id="mobile-menu-btn"
      >
        <Menu size={19} />
      </button>

      {/* Search */}
      <div className="search-wrap">
        <Search size={15} className="search-icon" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="ct-search-input"
          aria-label="Search"
          id="global-search"
        />
      </div>

      {/* Right cluster */}
      <div className="header-right">
        <button className="icon-btn" aria-label="Notifications" id="header-notifications">
          <Bell size={17} />
        </button>
        <button className="icon-btn" aria-label="Help" id="header-help">
          <HelpCircle size={17} />
        </button>

        {/* User */}
        <div className="header-user">
          <div className="header-user-info">
            <div className="header-user-name">{displayName}</div>
            <div className="header-user-role">{user?.email}</div>
          </div>
          <div
            className="header-avatar"
            id="header-avatar"
            title={displayName}
          >
            {displayName[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
