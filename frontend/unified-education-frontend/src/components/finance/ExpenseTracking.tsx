import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Plus, Download, Search, Eye, Edit, MoreVertical, DollarSign, Tag, TrendingUp } from 'lucide-react';
import { financeService } from '../../services';

interface Expense {
  id: string;
  description: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

const ExpenseTracking: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setError(error instanceof Error ? error.message : 'Failed to load expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filteredExpenses = expenses.filter((expense: Expense) => {
    const matchesSearch = searchTerm === '' || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || expense.category === categoryFilter;
    const matchesDate = dateFilter === '' || 
      (expense.date && new Date(expense.date).toISOString().startsWith(dateFilter));
    return matchesSearch && matchesCategory && matchesDate;
  });

  const expenseStats = {
    total: expenses.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0),
    thisMonth: expenses
      .filter((e: Expense) => e.date && new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0),
    pending: expenses.filter((e: Expense) => e.status === 'Pending').length,
    approved: expenses.filter((e: Expense) => e.status === 'Approved').length,
  };

  const categories = [...new Set(expenses.map((e: Expense) => e.category).filter(Boolean))];

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
          <Receipt className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadExpenses}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('finance.expenseTracking')}</h1>
        <p className="page-subtitle">{t('finance.trackAndManageExpenses')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('finance.addExpense')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.expenseOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${expenseStats.total.toLocaleString()}</div>
              <div className="stat-label">{t('finance.totalExpenses')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${expenseStats.thisMonth.toLocaleString()}</div>
              <div className="stat-label">{t('finance.thisMonth')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Receipt size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{expenseStats.pending}</div>
              <div className="stat-label">{t('finance.pendingApproval')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Receipt size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{expenseStats.approved}</div>
              <div className="stat-label">{t('finance.approved')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.expenseList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('finance.searchExpenses')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">{t('finance.allCategories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="month"
              className="filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="section-content">
          {filteredExpenses.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('finance.date')}</th>
                    <th>{t('finance.description')}</th>
                    <th>{t('finance.vendor')}</th>
                    <th>{t('finance.category')}</th>
                    <th>{t('finance.amount')}</th>
                    <th>{t('finance.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        {expense.date 
                          ? new Date(expense.date).toLocaleDateString()
                          : new Date().toLocaleDateString()
                        }
                      </td>
                      <td>{expense.description || 'Expense Description'}</td>
                      <td>{expense.vendor || 'Vendor Name'}</td>
                      <td>
                        <span className="category-tag">
                          <Tag size={12} />
                          {expense.category || 'General'}
                        </span>
                      </td>
                      <td className="amount-cell">${expense.amount?.toLocaleString() || '0'}</td>
                      <td>
                        <span className={`badge ${
                          expense.status === 'Approved' 
                            ? 'badge-success' 
                            : expense.status === 'Rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}>
                          {expense.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-primary">
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-sm btn-secondary">
                            <Edit size={14} />
                          </button>
                          <button className="btn-icon" title={t('common.more')}>
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Receipt size={48} />
              </div>
              <div className="empty-title">{t('finance.noExpensesFound')}</div>
              <div className="empty-description">
                {searchTerm || categoryFilter || dateFilter
                  ? t('finance.noExpensesMatchFilter')
                  : t('finance.noExpensesYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('finance.addFirstExpense')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracking;
