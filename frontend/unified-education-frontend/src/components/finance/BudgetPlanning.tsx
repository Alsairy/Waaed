import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Plus, Download, Search, Eye, Edit, MoreVertical, Calendar, DollarSign, TrendingUp, Target } from 'lucide-react';
import { financeService } from '../../services';

interface Budget {
  id: string;
  name: string;
  department: string;
  year: string;
  allocatedAmount: number;
  spentAmount: number;
  status: string;
}

const BudgetPlanning: React.FC = () => {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getBudgets();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load budgets');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const filteredBudgets = budgets.filter((budget: Budget) => {
    const matchesSearch = searchTerm === '' || 
      budget.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === '' || budget.year === yearFilter;
    const matchesDepartment = departmentFilter === '' || budget.department === departmentFilter;
    return matchesSearch && matchesYear && matchesDepartment;
  });

  const budgetStats = {
    totalBudget: budgets.reduce((sum: number, b: Budget) => sum + (b.allocatedAmount || 0), 0),
    totalSpent: budgets.reduce((sum: number, b: Budget) => sum + (b.spentAmount || 0), 0),
    approved: budgets.filter((b: Budget) => b.status === 'Approved').length,
    pending: budgets.filter((b: Budget) => b.status === 'Pending').length,
  };

  const utilizationRate = budgetStats.totalBudget > 0 
    ? (budgetStats.totalSpent / budgetStats.totalBudget) * 100 
    : 0;

  const departments = [...new Set(budgets.map((b: Budget) => b.department).filter(Boolean))];
  const years = [...new Set(budgets.map((b: Budget) => b.year).filter(Boolean))];

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <div className="error-state">
          <PieChart className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadBudgets}
            aria-label={t('common.tryAgain')}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title" id="main-heading">{t('finance.budgetPlanning')}</h1>
        <p className="page-subtitle" aria-describedby="main-heading">{t('finance.planAndManageBudgets')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('finance.createBudget')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('finance.createBudget')}
          </button>
          <button 
            className="btn btn-secondary"
            aria-label={t('finance.exportBudgets')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('finance.exportBudgets')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="budget-overview-heading">{t('finance.budgetOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${budgetStats.totalBudget.toLocaleString()}</div>
              <div className="stat-label">{t('finance.totalBudget')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${budgetStats.totalSpent.toLocaleString()}</div>
              <div className="stat-label">{t('finance.totalSpent')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{utilizationRate.toFixed(1)}%</div>
              <div className="stat-label">{t('finance.utilization')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <PieChart size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{budgetStats.approved}</div>
              <div className="stat-label">{t('finance.approvedBudgets')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="budget-list-heading">{t('finance.budgetList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('finance.searchBudgets')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('finance.searchBudgets')}
                  id="budget-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label={t('finance.filterByDepartment')}
              id="department-filter"
            >
              <option value="">{t('finance.allDepartments')}</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              aria-label={t('finance.filterByYear')}
              id="year-filter"
            >
              <option value="">{t('finance.allYears')}</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredBudgets.length > 0 ? (
            <div className="card-grid grid-2">
              {filteredBudgets.map((budget) => (
                <div key={budget.id} className="card card-hover budget-card">
                  <div className="card-header">
                    <div className="card-title">{budget.name || 'Budget Plan'}</div>
                    <span className={`badge ${
                      budget.status === 'Approved' 
                        ? 'badge-success' 
                        : budget.status === 'Rejected'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}>
                      {budget.status || 'Pending'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="budget-info">
                      <div className="info-item">
                        <Calendar size={16} className="info-icon" />
                        <span className="info-text">{budget.year || new Date().getFullYear()}</span>
                      </div>
                      <div className="info-item">
                        <Target size={16} className="info-icon" />
                        <span className="info-text">{budget.department || 'General'}</span>
                      </div>
                    </div>
                    <div className="budget-amounts">
                      <div className="amount-row">
                        <span className="amount-label">{t('finance.allocated')}</span>
                        <span className="amount-value">${budget.allocatedAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">{t('finance.spent')}</span>
                        <span className="amount-value spent">${budget.spentAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">{t('finance.remaining')}</span>
                        <span className="amount-value remaining">
                          ${((budget.allocatedAmount || 0) - (budget.spentAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${budget.allocatedAmount > 0 
                              ? Math.min((budget.spentAmount / budget.allocatedAmount) * 100, 100)
                              : 0
                            }%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {budget.allocatedAmount > 0 
                          ? `${((budget.spentAmount / budget.allocatedAmount) * 100).toFixed(1)}%`
                          : '0%'
                        } {t('finance.utilized')}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary">
                        <Eye size={14} />
                        {t('common.view')}
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <Edit size={14} />
                        {t('common.edit')}
                      </button>
                      <button className="btn-icon" title={t('common.more')}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <PieChart size={48} />
              </div>
              <div className="empty-title">{t('finance.noBudgetsFound')}</div>
              <div className="empty-description">
                {searchTerm || departmentFilter || yearFilter
                  ? t('finance.noBudgetsMatchFilter')
                  : t('finance.noBudgetsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('finance.createFirstBudget')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;
