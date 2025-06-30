import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Briefcase, 
  BarChart3, 
  Repeat, 
  Settings, 
  Bot,
  DollarSign,
  Users,
  Library,
  Package,
  Vote,
  PenTool,
  CheckSquare
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);



  const menuItems = [
    {
      key: 'main',
      label: t('navigation.main'),
      items: [
        {
          key: 'dashboard',
          label: t('common.dashboard'),
          icon: <Home size={20} />,
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
          icon: <GraduationCap size={20} />,
          link: '/sis',
        },
        {
          key: 'lms',
          label: t('navigation.lms'),
          icon: <BookOpen size={20} />,
          link: '/lms',
        },
        {
          key: 'exams',
          label: t('navigation.exams'),
          icon: <FileText size={20} />,
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
          icon: <Briefcase size={20} />,
          link: '/erp',
        },
        {
          key: 'finance',
          label: t('navigation.finance'),
          icon: <DollarSign size={20} />,
          link: '/finance',
        },
        {
          key: 'hr',
          label: t('navigation.hr'),
          icon: <Users size={20} />,
          link: '/hr',
        },
        {
          key: 'library',
          label: t('navigation.library'),
          icon: <Library size={20} />,
          link: '/library',
        },
        {
          key: 'inventory',
          label: t('navigation.inventory'),
          icon: <Package size={20} />,
          link: '/inventory',
        },
        {
          key: 'tasks',
          label: t('navigation.tasks'),
          icon: <CheckSquare size={20} />,
          link: '/tasks',
        },
        {
          key: 'analytics',
          label: t('navigation.analytics'),
          icon: <BarChart3 size={20} />,
          link: '/analytics',
        },
        {
          key: 'bpm',
          label: t('navigation.bpm'),
          icon: <Repeat size={20} />,
          link: '/bpm',
        }
      ]
    },
    {
      key: 'community',
      label: t('navigation.community'),
      items: [
        {
          key: 'polls',
          label: t('navigation.polls'),
          icon: <Vote size={20} />,
          link: '/polls',
        },
        {
          key: 'blogs',
          label: t('navigation.blogs'),
          icon: <PenTool size={20} />,
          link: '/blogs',
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
          icon: <Settings size={20} />,
          link: '/admin',
        },
        {
          key: 'ai',
          label: t('navigation.ai'),
          icon: <Bot size={20} />,
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
  }, [location.pathname, menuItems, isActiveLink, expandedMenus]);

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
