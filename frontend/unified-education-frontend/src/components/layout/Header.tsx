import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Search, Bell, Moon, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';

import { LanguageSwitcher } from '../LanguageSwitcher';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const notifications = [
    {
      id: 1,
      title: 'New Student Enrollment',
      message: 'John Doe has been enrolled in Grade 10',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'Assignment Due',
      message: 'Mathematics assignment due tomorrow',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'System Update',
      message: 'Platform maintenance scheduled for tonight',
      time: '2 hours ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label={t('common.toggleMenu')}
        >
          <Menu size={20} className="menu-icon" />
        </button>

        <nav className="breadcrumb">
          <div className="breadcrumb-item active">
            {t('common.dashboard')}
          </div>
        </nav>
      </div>

      <div className="header-center">
        <form className="search-box" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div className="header-action">
          <button
            className="action-button notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={t('common.notifications')}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="action-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu open">
              <div className="dropdown-header">
                <h6>{t('common.notifications')}</h6>
              </div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`dropdown-item notification-item ${
                    notification.unread ? 'unread' : ''
                  }`}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {notification.time}
                    </div>
                  </div>
                </div>
              ))}
              <div className="dropdown-footer">
                <button className="btn-link">
                  {t('common.viewAllNotifications')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="language-switcher">
          <LanguageSwitcher />
        </div>

        {/* Theme Switcher */}
        <div className="theme-switcher">
          <button
            className="action-button theme-button"
            aria-label={t('common.toggleTheme')}
          >
            <Moon size={18} />
          </button>
        </div>

        {/* User Menu */}
        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label={t('common.userMenu')}
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-info">
              <div className="user-name">Admin User</div>
              <div className="user-role">Administrator</div>
            </div>
            <ChevronDown size={16} className="dropdown-arrow" />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu open">
              <div className="dropdown-item">
                <User size={16} className="item-icon" />
                <span className="item-text">{t('common.profile')}</span>
              </div>
              <div className="dropdown-item">
                <Settings size={16} className="item-icon" />
                <span className="item-text">{t('common.settings')}</span>
              </div>
              <div className="dropdown-item">
                <HelpCircle size={16} className="item-icon" />
                <span className="item-text">{t('common.help')}</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-item">
                <LogOut size={16} className="item-icon" />
                <span className="item-text">{t('common.logout')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
