namespace AttendancePlatform.HR.Api.DTOs;

public class PerformanceReviewDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewPeriod { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal OverallRating { get; set; }
    public decimal? QualityOfWorkRating { get; set; }
    public decimal? ProductivityRating { get; set; }
    public decimal? CommunicationRating { get; set; }
    public decimal? TeamworkRating { get; set; }
    public decimal? LeadershipRating { get; set; }
    public decimal? InitiativeRating { get; set; }
    public decimal? ProblemSolvingRating { get; set; }
    public decimal? AdaptabilityRating { get; set; }
    public string? Achievements { get; set; }
    public string? AreasOfImprovement { get; set; }
    public string? Goals { get; set; }
    public string? DevelopmentPlan { get; set; }
    public string? EmployeeComments { get; set; }
    public string? ReviewerComments { get; set; }
    public string? HRComments { get; set; }
    public bool RecommendForPromotion { get; set; }
    public bool RecommendForTraining { get; set; }
    public string? TrainingRecommendations { get; set; }
    public decimal? SalaryIncrease { get; set; }
    public decimal? BonusRecommendation { get; set; }
    public DateTime? EmployeeSignedDate { get; set; }
    public DateTime? ReviewerSignedDate { get; set; }
    public DateTime? HRSignedDate { get; set; }
}

public class CreatePerformanceReviewDto
{
    public int EmployeeId { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewPeriod { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public decimal OverallRating { get; set; }
    public decimal? QualityOfWorkRating { get; set; }
    public decimal? ProductivityRating { get; set; }
    public decimal? CommunicationRating { get; set; }
    public decimal? TeamworkRating { get; set; }
    public decimal? LeadershipRating { get; set; }
    public decimal? InitiativeRating { get; set; }
    public decimal? ProblemSolvingRating { get; set; }
    public decimal? AdaptabilityRating { get; set; }
    public string? Achievements { get; set; }
    public string? AreasOfImprovement { get; set; }
    public string? Goals { get; set; }
    public string? DevelopmentPlan { get; set; }
    public string? ReviewerComments { get; set; }
    public bool RecommendForPromotion { get; set; }
    public bool RecommendForTraining { get; set; }
    public string? TrainingRecommendations { get; set; }
    public decimal? SalaryIncrease { get; set; }
    public decimal? BonusRecommendation { get; set; }
}

public class UpdatePerformanceReviewDto
{
    public string ReviewPeriod { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal OverallRating { get; set; }
    public decimal? QualityOfWorkRating { get; set; }
    public decimal? ProductivityRating { get; set; }
    public decimal? CommunicationRating { get; set; }
    public decimal? TeamworkRating { get; set; }
    public decimal? LeadershipRating { get; set; }
    public decimal? InitiativeRating { get; set; }
    public decimal? ProblemSolvingRating { get; set; }
    public decimal? AdaptabilityRating { get; set; }
    public string? Achievements { get; set; }
    public string? AreasOfImprovement { get; set; }
    public string? Goals { get; set; }
    public string? DevelopmentPlan { get; set; }
    public string? EmployeeComments { get; set; }
    public string? ReviewerComments { get; set; }
    public string? HRComments { get; set; }
    public bool RecommendForPromotion { get; set; }
    public bool RecommendForTraining { get; set; }
    public string? TrainingRecommendations { get; set; }
    public decimal? SalaryIncrease { get; set; }
    public decimal? BonusRecommendation { get; set; }
}

public class PerformanceReviewSummaryDto
{
    public int TotalReviews { get; set; }
    public int CompletedReviews { get; set; }
    public int PendingReviews { get; set; }
    public decimal AverageRating { get; set; }
    public int PromotionRecommendations { get; set; }
    public int TrainingRecommendations { get; set; }
    public Dictionary<string, decimal> AverageRatingByDepartment { get; set; } = new();
}
