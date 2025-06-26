import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isRTL } = useSelector((state: RootState) => state.ui);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const menuItems = [
    {
      key: 'main',
      label: t('navigation.main'),
      items: [
        {
          key: 'dashboard',
          label: t('common.dashboard'),
          icon: '🏠',
          link: '/',
        }
      ]
    },
    {
      key: 'academic',
      label: t('navigation.academic'),
      items: [
        {
          key: 'sis',
          label: t('navigation.sis'),
          icon: '🎓',
          link: '/sis',
        },
        {
          key: 'lms',
          label: t('navigation.lms'),
          icon: '📚',
          link: '/lms',
        },
        {
          key: 'exams',
          label: t('navigation.exams'),
          icon: '📝',
          link: '/exams',
        }
      ]
    },
    {
      key: 'management',
      label: t('navigation.management'),
      items: [
        {
          key: 'erp',
          label: t('navigation.erp'),
          icon: '💼',
          link: '/erp',
        },
        {
          key: 'analytics',
          label: t('navigation.analytics'),
          icon: '📊',
          link: '/analytics',
        },
        {
          key: 'bpm',
          label: t('navigation.bpm'),
          icon: '🔄',
          link: '/bpm',
        }
      ]
    },
    {
      key: 'system',
      label: t('navigation.system'),
      items: [
        {
          key: 'admin',
          label: t('navigation.admin'),
          icon: '⚙️',
          link: '/admin',
        },
        {
          key: 'ai',
          label: t('navigation.ai'),
          icon: '🤖',
          link: '/ai',
        }
      ]
    }
  ];

  const isActiveLink = (link: string) => {
    return location.pathname === link;
  };

  useEffect(() => {
    const currentSection = menuItems.find(section => 
      section.items.some(item => isActiveLink(item.link))
    );
    if (currentSection && !expandedMenus.includes(currentSection.key)) {
      setExpandedMenus(prev => [...prev, currentSection.key]);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            {t('auth.welcome')}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section) => (
            <div key={section.key} className="nav-section">
              <div className="section-title">
                {section.label}
              </div>
              
              {section.items.map((item) => (
                <div key={item.key} className="nav-item">
                  <Link
                    to={item.link}
                    className={`nav-link ${isActiveLink(item.link) ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              U
            </div>
            <div className="user-details">
              <div className="user-name">Admin User</div>
              <div className="user-role">System Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
