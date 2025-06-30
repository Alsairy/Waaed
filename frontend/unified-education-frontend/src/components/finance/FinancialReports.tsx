import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Download, Search, Eye, MoreVertical, Calendar, DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { financeService } from '../../services';

interface FinancialReport {
  id: string;
  title: string;
  description: string;
  type: string;
  generatedDate: string;
  status: string;
  period: string;
}

const FinancialReports: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getFinancialReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading financial reports:', error);
      setError(error instanceof Error ? error.message : 'Failed to load financial reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report: FinancialReport) => {
    const matchesSearch = searchTerm === '' || 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || report.type === typeFilter;
    const matchesDate = dateFilter === '' || 
      (report.generatedDate && new Date(report.generatedDate).toISOString().startsWith(dateFilter));
    return matchesSearch && matchesType && matchesDate;
  });

  const reportStats = {
    total: reports.length,
    thisMonth: reports.filter((r: FinancialReport) => 
      r.generatedDate && new Date(r.generatedDate).getMonth() === new Date().getMonth()
    ).length,
    income: reports.filter((r: FinancialReport) => r.type === 'Income').length,
    expense: reports.filter((r: FinancialReport) => r.type === 'Expense').length,
  };

  const reportTypes = [...new Set(reports.map((r: FinancialReport) => r.type).filter(Boolean))];

  const generateReport = async (reportType: string) => {
    try {
      const reportData = {
        type: reportType,
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        dateTo: new Date().toISOString(),
      };
      await financeService.generateFinancialReport(reportData);
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

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
          <FileText className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadReports}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('finance.financialReports')}</h1>
        <p className="page-subtitle">{t('finance.generateAndViewFinancialReports')}</p>
        <div className="page-actions">
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle">
              <Plus size={18} className="btn-icon" />
              {t('finance.generateReport')}
            </button>
            <div className="dropdown-menu">
              <button 
                className="dropdown-item"
                onClick={() => generateReport('Income')}
              >
                {t('finance.incomeReport')}
              </button>
              <button 
                className="dropdown-item"
                onClick={() => generateReport('Expense')}
              >
                {t('finance.expenseReport')}
              </button>
              <button 
                className="dropdown-item"
                onClick={() => generateReport('Balance')}
              >
                {t('finance.balanceSheet')}
              </button>
              <button 
                className="dropdown-item"
                onClick={() => generateReport('ProfitLoss')}
              >
                {t('finance.profitLossStatement')}
              </button>
            </div>
          </div>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('finance.exportAll')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.reportOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reportStats.total}</div>
              <div className="stat-label">{t('finance.totalReports')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reportStats.thisMonth}</div>
              <div className="stat-label">{t('finance.thisMonth')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reportStats.income}</div>
              <div className="stat-label">{t('finance.incomeReports')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reportStats.expense}</div>
              <div className="stat-label">{t('finance.expenseReports')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.reportList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('finance.searchReports')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">{t('finance.allTypes')}</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
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
          {filteredReports.length > 0 ? (
            <div className="card-grid grid-3">
              {filteredReports.map((report) => (
                <div key={report.id} className="card card-hover report-card">
                  <div className="card-header">
                    <div className="report-icon">
                      {report.type === 'Income' ? (
                        <TrendingUp size={20} className="icon-success" />
                      ) : report.type === 'Expense' ? (
                        <BarChart3 size={20} className="icon-warning" />
                      ) : (
                        <PieChart size={20} className="icon-info" />
                      )}
                    </div>
                    <div className="card-title">{report.title || 'Financial Report'}</div>
                    <span className={`badge ${
                      report.status === 'Generated' 
                        ? 'badge-success' 
                        : report.status === 'Processing'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}>
                      {report.status || 'Generated'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="report-info">
                      <div className="info-item">
                        <FileText size={16} className="info-icon" />
                        <span className="info-text">{report.type || 'General'}</span>
                      </div>
                      <div className="info-item">
                        <Calendar size={16} className="info-icon" />
                        <span className="info-text">
                          {report.generatedDate 
                            ? new Date(report.generatedDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="info-item">
                        <DollarSign size={16} className="info-icon" />
                        <span className="info-text">
                          {report.period || 'Current Period'}
                        </span>
                      </div>
                    </div>
                    <div className="report-description">
                      {report.description || 'Comprehensive financial report with detailed analysis and insights.'}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary">
                        <Eye size={14} />
                        {t('common.view')}
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <Download size={14} />
                        {t('common.download')}
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
                <FileText size={48} />
              </div>
              <div className="empty-title">{t('finance.noReportsFound')}</div>
              <div className="empty-description">
                {searchTerm || typeFilter || dateFilter
                  ? t('finance.noReportsMatchFilter')
                  : t('finance.noReportsYet')
                }
              </div>
              <button 
                className="btn btn-primary empty-action"
                onClick={() => generateReport('Income')}
              >
                <Plus size={18} />
                {t('finance.generateFirstReport')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.quickReports')}</h2>
        </div>
        <div className="quick-reports-grid">
          <div className="quick-report-card" onClick={() => generateReport('Income')}>
            <div className="quick-report-icon">
              <TrendingUp size={32} className="icon-success" />
            </div>
            <div className="quick-report-content">
              <div className="quick-report-title">{t('finance.incomeReport')}</div>
              <div className="quick-report-description">{t('finance.incomeReportDescription')}</div>
            </div>
          </div>
          <div className="quick-report-card" onClick={() => generateReport('Expense')}>
            <div className="quick-report-icon">
              <BarChart3 size={32} className="icon-warning" />
            </div>
            <div className="quick-report-content">
              <div className="quick-report-title">{t('finance.expenseReport')}</div>
              <div className="quick-report-description">{t('finance.expenseReportDescription')}</div>
            </div>
          </div>
          <div className="quick-report-card" onClick={() => generateReport('Balance')}>
            <div className="quick-report-icon">
              <PieChart size={32} className="icon-info" />
            </div>
            <div className="quick-report-content">
              <div className="quick-report-title">{t('finance.balanceSheet')}</div>
              <div className="quick-report-description">{t('finance.balanceSheetDescription')}</div>
            </div>
          </div>
          <div className="quick-report-card" onClick={() => generateReport('ProfitLoss')}>
            <div className="quick-report-icon">
              <DollarSign size={32} className="icon-primary" />
            </div>
            <div className="quick-report-content">
              <div className="quick-report-title">{t('finance.profitLossStatement')}</div>
              <div className="quick-report-description">{t('finance.profitLossDescription')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
