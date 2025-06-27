using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AttendancePlatform.Analytics.Api.Services;

namespace AttendancePlatform.Analytics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpGet("overview")]
        public async Task<ActionResult<AnalyticsOverviewDto>> GetAnalyticsOverview(
            [FromQuery] Guid tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                var overview = await _analyticsService.GetAnalyticsOverviewAsync(tenantId, fromDate, toDate);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics overview");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("trends")]
        public async Task<ActionResult<List<AttendanceTrendDto>>> GetAttendanceTrends(
            [FromQuery] Guid tenantId,
            [FromQuery] int days = 30)
        {
            try
            {
                var trends = await _analyticsService.GetAttendanceTrendsAsync(tenantId, days);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attendance trends");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("productivity")]
        public async Task<ActionResult<List<ProductivityMetricDto>>> GetProductivityMetrics(
            [FromQuery] Guid tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                var metrics = await _analyticsService.GetProductivityMetricsAsync(tenantId, fromDate, toDate);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting productivity metrics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("departments")]
        public async Task<ActionResult<List<DepartmentAnalyticsDto>>> GetDepartmentAnalytics(
            [FromQuery] Guid tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                var analytics = await _analyticsService.GetDepartmentAnalyticsAsync(tenantId, fromDate, toDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department analytics");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PredictiveAnalyticsController : ControllerBase
    {
        private readonly IPredictiveAnalyticsService _predictiveService;
        private readonly ILogger<PredictiveAnalyticsController> _logger;

        public PredictiveAnalyticsController(IPredictiveAnalyticsService predictiveService, ILogger<PredictiveAnalyticsController> logger)
        {
            _predictiveService = predictiveService;
            _logger = logger;
        }

        [HttpGet("attendance-prediction")]
        public async Task<ActionResult<List<AttendancePredictionDto>>> PredictAttendance(
            [FromQuery] Guid tenantId,
            [FromQuery] int futureDays = 7)
        {
            try
            {
                var predictions = await _predictiveService.PredictAttendanceAsync(tenantId, futureDays);
                return Ok(predictions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting attendance");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("absenteeism-risk")]
        public async Task<ActionResult<List<AbsenteeismRiskDto>>> GetAbsenteeismRisk([FromQuery] Guid tenantId)
        {
            try
            {
                var risks = await _predictiveService.IdentifyAbsenteeismRiskAsync(tenantId);
                return Ok(risks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying absenteeism risk");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("turnover-risk")]
        public async Task<ActionResult<List<TurnoverRiskDto>>> GetTurnoverRisk([FromQuery] Guid tenantId)
        {
            try
            {
                var risks = await _predictiveService.PredictTurnoverRiskAsync(tenantId);
                return Ok(risks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting turnover risk");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("capacity-forecast")]
        public async Task<ActionResult<WorkforceCapacityForecastDto>> GetCapacityForecast(
            [FromQuery] Guid tenantId,
            [FromQuery] int futureDays = 14)
        {
            try
            {
                var forecast = await _predictiveService.ForecastWorkforceCapacityAsync(tenantId, futureDays);
                return Ok(forecast);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error forecasting workforce capacity");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnomalyDetectionController : ControllerBase
    {
        private readonly IAnomalyDetectionService _anomalyService;
        private readonly ILogger<AnomalyDetectionController> _logger;

        public AnomalyDetectionController(IAnomalyDetectionService anomalyService, ILogger<AnomalyDetectionController> logger)
        {
            _anomalyService = anomalyService;
            _logger = logger;
        }

        [HttpGet("attendance-anomalies")]
        public async Task<ActionResult<List<AttendanceAnomalyDto>>> GetAttendanceAnomalies(
            [FromQuery] Guid tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                var anomalies = await _anomalyService.DetectAttendanceAnomaliesAsync(tenantId, fromDate, toDate);
                return Ok(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting attendance anomalies");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("location-anomalies")]
        public async Task<ActionResult<List<LocationAnomalyDto>>> GetLocationAnomalies(
            [FromQuery] Guid tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                var anomalies = await _anomalyService.DetectLocationAnomaliesAsync(tenantId, fromDate, toDate);
                return Ok(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting location anomalies");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("time-anomalies")]
        public async Task<ActionResult<List<TimeAnomalyDto>>> GetTimeAnomalies(
            [FromQuery] Guid tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                var anomalies = await _anomalyService.DetectTimeAnomaliesAsync(tenantId, fromDate, toDate);
                return Ok(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting time anomalies");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkforceInsightsController : ControllerBase
    {
        private readonly IWorkforceInsightsService _insightsService;
        private readonly ILogger<WorkforceInsightsController> _logger;

        public WorkforceInsightsController(IWorkforceInsightsService insightsService, ILogger<WorkforceInsightsController> logger)
        {
            _insightsService = insightsService;
            _logger = logger;
        }

        [HttpGet("health-score")]
        public async Task<ActionResult<WorkforceHealthScoreDto>> GetWorkforceHealthScore([FromQuery] Guid tenantId)
        {
            try
            {
                var healthScore = await _insightsService.CalculateWorkforceHealthScoreAsync(tenantId);
                return Ok(healthScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating workforce health score");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("engagement-insights")]
        public async Task<ActionResult<List<EngagementInsightDto>>> GetEngagementInsights([FromQuery] Guid tenantId)
        {
            try
            {
                var insights = await _insightsService.GetEngagementInsightsAsync(tenantId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement insights");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("performance-correlations")]
        public async Task<ActionResult<List<PerformanceCorrelationDto>>> GetPerformanceCorrelations([FromQuery] Guid tenantId)
        {
            try
            {
                var correlations = await _insightsService.GetPerformanceCorrelationsAsync(tenantId);
                return Ok(correlations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance correlations");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("work-life-balance")]
        public async Task<ActionResult<WorkLifeBalanceInsightDto>> GetWorkLifeBalanceInsights([FromQuery] Guid tenantId)
        {
            try
            {
                var insights = await _insightsService.GetWorkLifeBalanceInsightsAsync(tenantId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting work-life balance insights");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendancePatternsController : ControllerBase
    {
        private readonly IAttendancePatternService _patternService;
        private readonly ILogger<AttendancePatternsController> _logger;

        public AttendancePatternsController(IAttendancePatternService patternService, ILogger<AttendancePatternsController> logger)
        {
            _patternService = patternService;
            _logger = logger;
        }

        [HttpGet("user-patterns")]
        public async Task<ActionResult<List<AttendancePatternDto>>> GetUserAttendancePatterns(
            [FromQuery] Guid tenantId,
            [FromQuery] Guid userId)
        {
            try
            {
                var patterns = await _patternService.AnalyzeAttendancePatternsAsync(tenantId, userId);
                return Ok(patterns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing user attendance patterns");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("seasonal-trends")]
        public async Task<ActionResult<List<SeasonalTrendDto>>> GetSeasonalTrends([FromQuery] Guid tenantId)
        {
            try
            {
                var trends = await _patternService.IdentifySeasonalTrendsAsync(tenantId);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying seasonal trends");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("behavioral-insights")]
        public async Task<ActionResult<List<BehavioralInsightDto>>> GetBehavioralInsights(
            [FromQuery] Guid tenantId,
            [FromQuery] Guid userId)
        {
            try
            {
                var insights = await _patternService.GetBehavioralInsightsAsync(tenantId, userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting behavioral insights");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}

