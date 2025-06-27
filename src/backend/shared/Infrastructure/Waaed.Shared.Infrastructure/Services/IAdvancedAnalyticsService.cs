using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public interface IAdvancedAnalyticsService
{
    Task<AttendanceAnalytics> GetAttendanceAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<ProductivityAnalytics> GetProductivityAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<AbsenteeismAnalytics> GetAbsenteeismAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<OvertimeAnalytics> GetOvertimeAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<LocationAnalytics> GetLocationAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<BiometricAnalytics> GetBiometricAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<PredictiveAnalytics> GetPredictiveAnalyticsAsync(string tenantId, int forecastDays = 30);
    Task<ComplianceAnalytics> GetComplianceAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<CustomReportData> GenerateCustomReportAsync(string tenantId, CustomReportRequest request);
    Task<byte[]> ExportAnalyticsAsync(string tenantId, string reportType, DateTime fromDate, DateTime toDate, string format = "xlsx");
}

public class AttendanceAnalytics
{
    public double AverageAttendanceRate { get; set; }
    public int TotalWorkingDays { get; set; }
    public int TotalPresentDays { get; set; }
    public int TotalAbsentDays { get; set; }
    public int TotalLateDays { get; set; }
    public int TotalEarlyLeaveDays { get; set; }
    public Dictionary<string, double> DepartmentAttendanceRates { get; set; } = new();
    public Dictionary<DateTime, int> DailyAttendanceTrends { get; set; } = new();
    public List<EmployeeAttendanceSummary> TopPerformers { get; set; } = new();
    public List<EmployeeAttendanceSummary> AttendanceIssues { get; set; } = new();
}

public class ProductivityAnalytics
{
    public double AverageProductivityScore { get; set; }
    public Dictionary<string, double> DepartmentProductivity { get; set; } = new();
    public Dictionary<DateTime, double> ProductivityTrends { get; set; } = new();
    public List<ProductivityFactor> ProductivityFactors { get; set; } = new();
    public Dictionary<string, double> TaskCompletionRates { get; set; } = new();
    public double OverallEfficiencyScore { get; set; }
}

public class AbsenteeismAnalytics
{
    public double AbsenteeismRate { get; set; }
    public Dictionary<string, double> AbsenteeismByDepartment { get; set; } = new();
    public Dictionary<string, int> AbsenteeismReasons { get; set; } = new();
    public Dictionary<DateTime, int> AbsenteeismTrends { get; set; } = new();
    public List<string> HighRiskEmployees { get; set; } = new();
    public double PredictedAbsenteeismRate { get; set; }
}

public class OvertimeAnalytics
{
    public double TotalOvertimeHours { get; set; }
    public double AverageOvertimePerEmployee { get; set; }
    public Dictionary<string, double> OvertimeByDepartment { get; set; } = new();
    public Dictionary<DateTime, double> OvertimeTrends { get; set; } = new();
    public double OvertimeCost { get; set; }
    public List<EmployeeOvertimeSummary> TopOvertimeEmployees { get; set; } = new();
}

public class LocationAnalytics
{
    public Dictionary<string, int> AttendanceByLocation { get; set; } = new();
    public Dictionary<string, double> LocationUtilization { get; set; } = new();
    public List<LocationHeatmapData> HeatmapData { get; set; } = new();
    public Dictionary<string, TimeSpan> AverageTimeAtLocation { get; set; } = new();
}

public class BiometricAnalytics
{
    public Dictionary<string, int> BiometricMethodUsage { get; set; } = new();
    public double BiometricSuccessRate { get; set; }
    public Dictionary<string, double> BiometricAccuracyByMethod { get; set; } = new();
    public List<BiometricFailureReason> FailureReasons { get; set; } = new();
    public Dictionary<DateTime, double> BiometricTrends { get; set; } = new();
}

public class PredictiveAnalytics
{
    public Dictionary<DateTime, double> AttendanceForecast { get; set; } = new();
    public Dictionary<DateTime, double> AbsenteeismForecast { get; set; } = new();
    public List<RiskPrediction> RiskPredictions { get; set; } = new();
    public Dictionary<string, double> SeasonalTrends { get; set; } = new();
    public List<Recommendation> Recommendations { get; set; } = new();
}

public class ComplianceAnalytics
{
    public double ComplianceScore { get; set; }
    public Dictionary<string, bool> ComplianceChecks { get; set; } = new();
    public List<ComplianceViolation> Violations { get; set; } = new();
    public Dictionary<string, double> PolicyAdherence { get; set; } = new();
    public List<ComplianceRecommendation> Recommendations { get; set; } = new();
}

public class CustomReportData
{
    public string ReportName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public List<ChartData> Charts { get; set; } = new();
    public List<TableData> Tables { get; set; } = new();
}

public class CustomReportRequest
{
    public string ReportName { get; set; } = string.Empty;
    public List<string> Metrics { get; set; } = new();
    public List<string> Dimensions { get; set; } = new();
    public List<FilterCriteria> Filters { get; set; } = new();
    public string GroupBy { get; set; } = string.Empty;
    public string SortBy { get; set; } = string.Empty;
    public bool SortDescending { get; set; }
}

public class EmployeeAttendanceSummary
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public double AttendanceRate { get; set; }
    public int PresentDays { get; set; }
    public int AbsentDays { get; set; }
    public int LateDays { get; set; }
    public TimeSpan AverageWorkingHours { get; set; }
}

public class ProductivityFactor
{
    public string Factor { get; set; } = string.Empty;
    public double Impact { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class EmployeeOvertimeSummary
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public double TotalOvertimeHours { get; set; }
    public double OvertimeCost { get; set; }
    public int OvertimeDays { get; set; }
}

public class LocationHeatmapData
{
    public string LocationId { get; set; } = string.Empty;
    public string LocationName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int AttendanceCount { get; set; }
    public double Intensity { get; set; }
}

public class BiometricFailureReason
{
    public string Reason { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class RiskPrediction
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string RiskType { get; set; } = string.Empty;
    public double RiskScore { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<string> Factors { get; set; } = new();
}

public class Recommendation
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public List<string> Actions { get; set; } = new();
}

public class ComplianceViolation
{
    public string ViolationType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class ComplianceRecommendation
{
    public string Area { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public List<string> Steps { get; set; } = new();
}

public class ChartData
{
    public string ChartType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public List<string> Labels { get; set; } = new();
    public List<DataSeries> Series { get; set; } = new();
}

public class DataSeries
{
    public string Name { get; set; } = string.Empty;
    public List<double> Data { get; set; } = new();
    public string Color { get; set; } = string.Empty;
}

public class TableData
{
    public string Title { get; set; } = string.Empty;
    public List<string> Headers { get; set; } = new();
    public List<List<object>> Rows { get; set; } = new();
}

public class FilterCriteria
{
    public string Field { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty;
    public object Value { get; set; } = new();
}
