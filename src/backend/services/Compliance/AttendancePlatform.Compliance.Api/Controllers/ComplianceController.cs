using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Compliance.Api.Services;
using AttendancePlatform.Shared.Domain.DTOs;

namespace AttendancePlatform.Compliance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ComplianceController : ControllerBase
    {
        private readonly IComplianceService _complianceService;
        private readonly ILogger<ComplianceController> _logger;

        public ComplianceController(
            IComplianceService complianceService,
            ILogger<ComplianceController> logger)
        {
            _complianceService = complianceService;
            _logger = logger;
        }

        [HttpPost("reports/generate")]
        public async Task<ActionResult<ComplianceReportDto>> GenerateComplianceReport([FromBody] GenerateReportRequest request)
        {
            try
            {
                var result = await _complianceService.GenerateComplianceReportAsync(
                    request.TenantId, 
                    request.Region, 
                    request.StartDate, 
                    request.EndDate, 
                    request.Language ?? "en");

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance report for tenant {TenantId}", request.TenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("requirements/{countryCode}")]
        public async Task<ActionResult<List<RegionalRequirementDto>>> GetRegionalRequirements(string countryCode)
        {
            try
            {
                var result = await _complianceService.GetRegionalRequirementsAsync(countryCode);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting regional requirements for country {CountryCode}", countryCode);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("validate/{tenantId}")]
        public async Task<ActionResult<bool>> ValidateAttendanceCompliance(Guid tenantId, [FromBody] ValidateComplianceRequest request)
        {
            try
            {
                var result = await _complianceService.ValidateAttendanceComplianceAsync(tenantId, request.Region);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating compliance for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("status/{tenantId}")]
        public async Task<ActionResult<ComplianceStatusDto>> GetComplianceStatus(Guid tenantId, [FromQuery] string region)
        {
            try
            {
                var result = await _complianceService.GetComplianceStatusAsync(tenantId, region);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance status for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("violations/{tenantId}")]
        public async Task<ActionResult<List<ComplianceViolationDto>>> GetComplianceViolations(
            Guid tenantId, 
            [FromQuery] string region,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var result = await _complianceService.GetComplianceViolationsAsync(tenantId, region, startDate, endDate);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance violations for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut("settings/{tenantId}")]
        public async Task<ActionResult<bool>> UpdateRegionalSettings(Guid tenantId, [FromBody] RegionalSettingsDto settings)
        {
            try
            {
                var result = await _complianceService.UpdateRegionalSettingsAsync(tenantId, settings);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating regional settings for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("localization/{language}/{module}")]
        public async Task<ActionResult<List<LocalizedStringDto>>> GetLocalizedStrings(string language, string module)
        {
            try
            {
                var result = await _complianceService.GetLocalizedStringsAsync(language, module);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting localized strings for language {Language}, module {Module}", language, module);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("dashboard/{tenantId}")]
        public async Task<ActionResult<ComplianceDashboardDto>> GetComplianceDashboard(Guid tenantId, [FromQuery] string region)
        {
            try
            {
                var statusResult = await _complianceService.GetComplianceStatusAsync(tenantId, region);
                var currentMonth = DateTime.UtcNow.AddDays(-30);
                var violationsResult = await _complianceService.GetComplianceViolationsAsync(tenantId, region, currentMonth, DateTime.UtcNow);
                var requirementsResult = await _complianceService.GetRegionalRequirementsAsync(region);

                if (statusResult.IsSuccess && violationsResult.IsSuccess && requirementsResult.IsSuccess)
                {
                    var dashboard = new ComplianceDashboardDto
                    {
                        Status = statusResult.Data,
                        RecentViolations = violationsResult.Data?.Take(10).ToList() ?? new List<ComplianceViolationDto>(),
                        Requirements = requirementsResult.Data ?? new List<RegionalRequirementDto>(),
                        Summary = new ComplianceSummaryDto
                        {
                            TotalViolations = violationsResult.Data?.Count ?? 0,
                            CriticalViolations = violationsResult.Data?.Count(v => v.Severity == "Critical") ?? 0,
                            ComplianceScore = statusResult.Data?.ComplianceScore ?? 0,
                            LastReviewDate = statusResult.Data?.LastChecked ?? DateTime.UtcNow,
                            NextReviewDate = statusResult.Data?.NextReviewDate ?? DateTime.UtcNow.AddMonths(1)
                        }
                    };

                    return Ok(ApiResponse<ComplianceDashboardDto>.SuccessResult(dashboard));
                }

                return BadRequest("Failed to load compliance dashboard data");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance dashboard for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("export/{tenantId}")]
        public async Task<ActionResult> ExportComplianceReport(Guid tenantId, [FromBody] ExportReportRequest request)
        {
            try
            {
                var reportResult = await _complianceService.GenerateComplianceReportAsync(
                    tenantId, 
                    request.Region, 
                    request.StartDate, 
                    request.EndDate, 
                    request.Language ?? "en");

                if (!reportResult.IsSuccess)
                {
                    return BadRequest(reportResult);
                }

                var report = reportResult.Data;
                
                byte[] exportData;
                string contentType;
                string fileName;

                switch (request.Format.ToLower())
                {
                    case "pdf":
                        exportData = GeneratePdfReport(report);
                        contentType = "application/pdf";
                        fileName = $"compliance-report-{tenantId}-{DateTime.UtcNow:yyyyMMdd}.pdf";
                        break;
                    case "excel":
                        exportData = GenerateExcelReport(report);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"compliance-report-{tenantId}-{DateTime.UtcNow:yyyyMMdd}.xlsx";
                        break;
                    case "csv":
                        exportData = GenerateCsvReport(report);
                        contentType = "text/csv";
                        fileName = $"compliance-report-{tenantId}-{DateTime.UtcNow:yyyyMMdd}.csv";
                        break;
                    default:
                        return BadRequest("Unsupported export format. Supported formats: pdf, excel, csv");
                }

                return File(exportData, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting compliance report for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private byte[] GeneratePdfReport(ComplianceReportDto report)
        {
            var content = $@"
COMPLIANCE REPORT
=================

Tenant: {report.TenantId}
Region: {report.Region}
Period: {report.StartDate:yyyy-MM-dd} to {report.EndDate:yyyy-MM-dd}
Generated: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss}

SUMMARY
-------
Total Employees: {report.TotalEmployees}
Working Days: {report.TotalWorkingDays}
Compliance Score: {report.ComplianceScore:F1}%

VIOLATIONS
----------
{string.Join("\n", report.Violations.Select(v => $"- {v.ViolationType}: {v.Description} ({v.Severity})"))}

REQUIREMENTS
------------
{string.Join("\n", report.RegionalRequirements.Select(r => $"- {r.Category}: {r.Requirement}"))}

RECOMMENDATIONS
---------------
{string.Join("\n", report.Recommendations.Select(r => $"- {r}"))}
";
            return System.Text.Encoding.UTF8.GetBytes(content);
        }

        private byte[] GenerateExcelReport(ComplianceReportDto report)
        {
            var csv = GenerateCsvContent(report);
            return System.Text.Encoding.UTF8.GetBytes(csv);
        }

        private byte[] GenerateCsvReport(ComplianceReportDto report)
        {
            var csv = GenerateCsvContent(report);
            return System.Text.Encoding.UTF8.GetBytes(csv);
        }

        private string GenerateCsvContent(ComplianceReportDto report)
        {
            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Type,Category,Description,Severity,User,Date");
            
            foreach (var violation in report.Violations)
            {
                csv.AppendLine($"Violation,{violation.ViolationType},{violation.Description},{violation.Severity},{violation.UserId},{violation.DetectedAt:yyyy-MM-dd}");
            }

            foreach (var requirement in report.RegionalRequirements)
            {
                csv.AppendLine($"Requirement,{requirement.Category},{requirement.Requirement},{requirement.Mandatory ? "Mandatory" : "Optional"},,");
            }

            return csv.ToString();
        }
    }

    public class GenerateReportRequest
    {
        public Guid TenantId { get; set; }
        public string Region { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Language { get; set; }
    }

    public class ValidateComplianceRequest
    {
        public string Region { get; set; } = string.Empty;
    }

    public class ExportReportRequest
    {
        public string Region { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Format { get; set; } = "pdf"; // pdf, excel, csv
        public string? Language { get; set; }
    }

    public class ComplianceDashboardDto
    {
        public ComplianceStatusDto? Status { get; set; }
        public List<ComplianceViolationDto> RecentViolations { get; set; } = new();
        public List<RegionalRequirementDto> Requirements { get; set; } = new();
        public ComplianceSummaryDto Summary { get; set; } = new();
    }

    public class ComplianceSummaryDto
    {
        public int TotalViolations { get; set; }
        public int CriticalViolations { get; set; }
        public double ComplianceScore { get; set; }
        public DateTime LastReviewDate { get; set; }
        public DateTime NextReviewDate { get; set; }
    }
}
