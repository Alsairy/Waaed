import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Search, Bell, Moon, Sun, ChevronDown, User, Settings, HelpCircle, LogOut, Globe } from 'lucide-react';

import { LanguageSwitcher } from '../LanguageSwitcher';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  userRole?: string;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, userRole = 'student', userName = 'User' }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-button')) {
        setShowNotifications(false);
      }
      if (!target.closest('.user-menu-dropdown') && !target.closest('.user-button')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const notifications = [
    {
      id: 1,
      title: t('notifications.newEnrollment'),
      message: t('notifications.enrollmentMessage'),
      time: t('time.minutesAgo', { count: 5 }),
      unread: true,
      type: 'info'
    },
    {
      id: 2,
      title: t('notifications.assignmentDue'),
      message: t('notifications.assignmentMessage'),
      time: t('time.hoursAgo', { count: 1 }),
      unread: true,
      type: 'warning'
    },
    {
      id: 3,
      title: t('notifications.systemUpdate'),
      message: t('notifications.maintenanceMessage'),
      time: t('time.hoursAgo', { count: 2 }),
      unread: false,
      type: 'info'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className={`header ${isRTL ? 'rtl' : 'ltr'} ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label={t('common.toggleMenu')}
        >
          <Menu size={20} className="menu-icon" />
        </button>

        {!isMobile && (
          <div className="brand-section">
            <div className="logo-text">Waaed</div>
            <div className="logo-subtitle">TETCO Platform</div>
          </div>
        )}

        <nav className="breadcrumb">
          <div className="breadcrumb-item active">
            {t('common.dashboard')}
          </div>
        </nav>
      </div>

      <div className="header-center">
        {!isMobile && (
          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </form>
        )}
      </div>

      <div className="header-right">
        {/* Mobile Search */}
        {isMobile && (
          <button
            className="action-button search-button"
            aria-label={t('common.search')}
          >
            <Search size={18} />
          </button>
        )}

        {/* Notifications */}
        <div className="header-action notifications-dropdown">
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
            <div className={`dropdown-menu notifications-menu ${isRTL ? 'rtl' : 'ltr'}`}>
              <div className="dropdown-header">
                <h6>{t('common.notifications')}</h6>
                <button 
                  className="mark-all-read"
                  onClick={() => console.log('Mark all as read')}
                >
                  {t('notifications.markAllRead')}
                </button>
              </div>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.unread ? 'unread' : ''} ${notification.type}`}
                  >
                    <div className="notification-indicator"></div>
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
              </div>
              <div className="dropdown-footer">
                <button className="btn-link">
                  {t('common.viewAllNotifications')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        {!isMobile && (
          <div className="language-switcher">
            <button
              className="action-button language-button"
              aria-label={t('common.changeLanguage')}
            >
              <Globe size={18} />
            </button>
            <LanguageSwitcher />
          </div>
        )}

        {/* Theme Switcher */}
        <div className="theme-switcher">
          <button
            className="action-button theme-button"
            onClick={toggleTheme}
            aria-label={t('common.toggleTheme')}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* User Menu */}
        <div className="user-menu user-menu-dropdown">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label={t('common.userMenu')}
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            {!isMobile && (
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-role">{t(`roles.${userRole}`)}</div>
              </div>
            )}
            <ChevronDown size={16} className={`dropdown-arrow ${showUserMenu ? 'rotated' : ''}`} />
          </button>

          {showUserMenu && (
            <div className={`dropdown-menu user-menu-dropdown ${isRTL ? 'rtl' : 'ltr'}`}>
              <div className="user-menu-header">
                <div className="user-avatar-large">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <div className="user-name">{userName}</div>
                  <div className="user-role">{t(`roles.${userRole}`)}</div>
                  <div className="user-email">user@tetco.com</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
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
              {isMobile && (
                <div className="dropdown-item">
                  <Globe size={16} className="item-icon" />
                  <span className="item-text">{t('common.changeLanguage')}</span>
                </div>
              )}
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-item">
                <LogOut size={16} className="item-icon" />
                <span className="item-text">{t('auth.logout')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
