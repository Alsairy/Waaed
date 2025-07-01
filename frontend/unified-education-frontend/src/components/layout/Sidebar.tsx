import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  Bot,
  DollarSign,
  Users,
  Library,
  Package,
  Vote,
  PenTool,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Search
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  link?: string;
  roles?: string[];
  children?: MenuItem[];
  badge?: string | number;
}

interface MenuSection {
  key: string;
  label: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole = 'student' }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const isRTL = i18n.language === 'ar';



  const menuItems = useMemo(() => [
    {
      key: 'main',
      label: t('navigation.main'),
      items: [
        {
          key: 'dashboard',
          label: t('common.dashboard'),
          icon: <Home size={20} />,
          link: '/',
          roles: ['admin', 'teacher', 'student', 'parent']
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
          roles: ['admin', 'teacher'],
          children: [
            { key: 'students', label: t('navigation.students'), link: '/sis/students', roles: ['admin', 'teacher'] },
            { key: 'classes', label: t('navigation.classes'), link: '/sis/classes', roles: ['admin', 'teacher'] },
            { key: 'grades', label: t('navigation.grades'), link: '/sis/grades', roles: ['admin', 'teacher'] },
            { key: 'attendance', label: t('navigation.attendance'), link: '/sis/attendance', roles: ['admin', 'teacher'] }
          ]
        },
        {
          key: 'lms',
          label: t('navigation.lms'),
          icon: <BookOpen size={20} />,
          roles: ['admin', 'teacher', 'student'],
          children: [
            { key: 'courses', label: t('navigation.courses'), link: '/lms/courses', roles: ['admin', 'teacher', 'student'] },
            { key: 'assignments', label: t('navigation.assignments'), link: '/lms/assignments', roles: ['admin', 'teacher', 'student'] },
            { key: 'quizzes', label: t('navigation.quizzes'), link: '/lms/quizzes', roles: ['admin', 'teacher', 'student'] },
            { key: 'discussions', label: t('navigation.discussions'), link: '/lms/discussions', roles: ['admin', 'teacher', 'student'] }
          ]
        },
        {
          key: 'exams',
          label: t('navigation.exams'),
          icon: <FileText size={20} />,
          roles: ['admin', 'teacher', 'student'],
          children: [
            { key: 'schedule', label: t('navigation.examSchedule'), link: '/exams/schedule', roles: ['admin', 'teacher', 'student'] },
            { key: 'results', label: t('navigation.examResults'), link: '/exams/results', roles: ['admin', 'teacher', 'student'] },
            { key: 'create', label: t('navigation.createExam'), link: '/exams/create', roles: ['admin', 'teacher'] }
          ]
        }
      ]
    },
    {
      key: 'management',
      label: t('navigation.management'),
      items: [
        {
          key: 'finance',
          label: t('navigation.finance'),
          icon: <DollarSign size={20} />,
          roles: ['admin', 'parent'],
          children: [
            { key: 'fees', label: t('navigation.fees'), link: '/finance/fees', roles: ['admin', 'parent'] },
            { key: 'payments', label: t('navigation.payments'), link: '/finance/payments', roles: ['admin', 'parent'] },
            { key: 'budget', label: t('navigation.budget'), link: '/finance/budget', roles: ['admin'] },
            { key: 'reports', label: t('navigation.financialReports'), link: '/finance/reports', roles: ['admin'] }
          ]
        },
        {
          key: 'hr',
          label: t('navigation.hr'),
          icon: <Users size={20} />,
          roles: ['admin'],
          children: [
            { key: 'employees', label: t('navigation.employees'), link: '/hr/employees', roles: ['admin'] },
            { key: 'recruitment', label: t('navigation.recruitment'), link: '/hr/recruitment', roles: ['admin'] },
            { key: 'performance', label: t('navigation.performance'), link: '/hr/performance', roles: ['admin'] },
            { key: 'leave', label: t('navigation.leaveManagement'), link: '/hr/leave', roles: ['admin'] }
          ]
        },
        {
          key: 'library',
          label: t('navigation.library'),
          icon: <Library size={20} />,
          roles: ['admin', 'teacher', 'student'],
          children: [
            { key: 'catalog', label: t('navigation.bookCatalog'), link: '/library/catalog', roles: ['admin', 'teacher', 'student'] },
            { key: 'circulation', label: t('navigation.circulation'), link: '/library/circulation', roles: ['admin', 'teacher'] },
            { key: 'reservations', label: t('navigation.reservations'), link: '/library/reservations', roles: ['admin', 'teacher', 'student'] }
          ]
        },
        {
          key: 'inventory',
          label: t('navigation.inventory'),
          icon: <Package size={20} />,
          roles: ['admin'],
          children: [
            { key: 'items', label: t('navigation.items'), link: '/inventory/items', roles: ['admin'] },
            { key: 'stock', label: t('navigation.stockManagement'), link: '/inventory/stock', roles: ['admin'] },
            { key: 'orders', label: t('navigation.purchaseOrders'), link: '/inventory/orders', roles: ['admin'] }
          ]
        },
        {
          key: 'tasks',
          label: t('navigation.tasks'),
          icon: <CheckSquare size={20} />,
          roles: ['admin', 'teacher', 'student'],
          children: [
            { key: 'my-tasks', label: t('navigation.myTasks'), link: '/tasks/my-tasks', roles: ['admin', 'teacher', 'student'] },
            { key: 'create', label: t('navigation.createTask'), link: '/tasks/create', roles: ['admin', 'teacher'] },
            { key: 'manage', label: t('navigation.manageTasks'), link: '/tasks/manage', roles: ['admin', 'teacher'] }
          ]
        },
        {
          key: 'analytics',
          label: t('navigation.analytics'),
          icon: <BarChart3 size={20} />,
          roles: ['admin', 'teacher'],
          children: [
            { key: 'dashboard', label: t('navigation.analyticsDashboard'), link: '/analytics/dashboard', roles: ['admin', 'teacher'] },
            { key: 'reports', label: t('navigation.reports'), link: '/analytics/reports', roles: ['admin', 'teacher'] },
            { key: 'insights', label: t('navigation.insights'), link: '/analytics/insights', roles: ['admin', 'teacher'] }
          ]
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
          roles: ['admin', 'teacher', 'student'],
          children: [
            { key: 'active', label: t('navigation.activePolls'), link: '/polls/active', roles: ['admin', 'teacher', 'student'] },
            { key: 'create', label: t('navigation.createPoll'), link: '/polls/create', roles: ['admin', 'teacher'] },
            { key: 'results', label: t('navigation.pollResults'), link: '/polls/results', roles: ['admin', 'teacher'] }
          ]
        },
        {
          key: 'blogs',
          label: t('navigation.blogs'),
          icon: <PenTool size={20} />,
          roles: ['admin', 'teacher', 'student'],
          children: [
            { key: 'posts', label: t('navigation.blogPosts'), link: '/blogs/posts', roles: ['admin', 'teacher', 'student'] },
            { key: 'create', label: t('navigation.createPost'), link: '/blogs/create', roles: ['admin', 'teacher', 'student'] },
            { key: 'categories', label: t('navigation.categories'), link: '/blogs/categories', roles: ['admin', 'teacher'] }
          ]
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
          roles: ['admin'],
          children: [
            { key: 'users', label: t('navigation.userManagement'), link: '/admin/users', roles: ['admin'] },
            { key: 'settings', label: t('navigation.systemSettings'), link: '/admin/settings', roles: ['admin'] },
            { key: 'security', label: t('navigation.security'), link: '/admin/security', roles: ['admin'] }
          ]
        },
        {
          key: 'ai',
          label: t('navigation.ai'),
          icon: <Bot size={20} />,
          roles: ['admin', 'teacher'],
          children: [
            { key: 'assistant', label: t('navigation.aiAssistant'), link: '/ai/assistant', roles: ['admin', 'teacher'] },
            { key: 'insights', label: t('navigation.aiInsights'), link: '/ai/insights', roles: ['admin', 'teacher'] }
          ]
        }
      ]
    }
  ], [t]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.map((section: any) => ({
      ...section,
      items: section.items.filter((item: any) => 
        !item.roles || item.roles.includes(userRole)
      ).map((item: any) => ({
        ...item,
        children: item.children?.filter((child: any) => 
          !child.roles || child.roles.includes(userRole)
        )
      }))
    })).filter((section: any) => section.items.length > 0);
  }, [menuItems, userRole]);

  const isActiveLink = useCallback((link: string) => {
    return location.pathname === link;
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentSection = filteredMenuItems.find((section: MenuSection) => 
      section.items.some((item: MenuItem) => 
        (item.link && isActiveLink(item.link)) || 
        item.children?.some((child: MenuItem) => child.link && isActiveLink(child.link))
      )
    );
    if (currentSection && !expandedMenus.includes(currentSection.key)) {
      setExpandedMenus(prev => [...prev, currentSection.key]);
    }
  }, [location.pathname, filteredMenuItems, isActiveLink, expandedMenus]);

  const toggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  }, []);

  const isActiveItem = useCallback((item: MenuItem) => {
    if (item.link && isActiveLink(item.link)) return true;
    return item.children?.some(child => child.link && isActiveLink(child.link)) || false;
  }, [isActiveLink]);

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.key);
    const isActive = isActiveItem(item);

    return (
      <div key={item.key} className={`nav-item level-${level} ${isActive ? 'active' : ''}`}>
        {hasChildren ? (
          <button
            className={`nav-link expandable ${isActive ? 'active' : ''}`}
            onClick={() => toggleMenu(item.key)}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
            <span className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}>
              {isRTL ? (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </span>
          </button>
        ) : (
          <Link
            to={item.link || '#'}
            className={`nav-link ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (isMobile) {
                onClose();
              }
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </Link>
        )}
        
        {hasChildren && isExpanded && (
          <div className="nav-submenu">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && isMobile && (
        <div 
          className="sidebar-overlay active"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'} ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-text">Waaed</span>
              <span className="logo-subtitle">TETCO Platform</span>
            </div>
            {isMobile && (
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder={t('common.search')}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((section) => (
            <div key={section.key} className="nav-section">
              <div className="section-title">
                {section.label}
              </div>
              
              {section.items.map((item: any) => renderMenuItem(item))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <div className="user-name">{t('user.currentUser')}</div>
              <div className="user-role">{t(`roles.${userRole}`)}</div>
            </div>
            <div className="user-actions">
              <button className="action-btn" title={t('common.notifications')}>
                <Bell size={16} />
              </button>
              <button className="action-btn" title={t('auth.logout')}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={20} />
            <span>{t('common.dashboard')}</span>
          </Link>
          <Link to="/lms" className={`nav-item ${location.pathname.startsWith('/lms') ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>{t('navigation.lms')}</span>
          </Link>
          <Link to="/tasks" className={`nav-item ${location.pathname.startsWith('/tasks') ? 'active' : ''}`}>
            <CheckSquare size={20} />
            <span>{t('navigation.tasks')}</span>
          </Link>
          <button className="nav-item" onClick={onClose}>
            <Menu size={20} />
            <span>{t('common.menu')}</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
