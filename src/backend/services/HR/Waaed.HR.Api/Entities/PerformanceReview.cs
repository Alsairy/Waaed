using System.ComponentModel.DataAnnotations;

namespace Waaed.HR.Api.Entities;

public class PerformanceReview
{
    public int Id { get; set; }
    
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    
    public int ReviewerId { get; set; }
    public Employee Reviewer { get; set; } = null!;
    
    [Required]
    [MaxLength(20)]
    public string ReviewPeriod { get; set; } = string.Empty;
    
    public DateTime ReviewDate { get; set; }
    
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Draft";
    
    public decimal OverallRating { get; set; }
    
    public decimal? QualityOfWorkRating { get; set; }
    public decimal? ProductivityRating { get; set; }
    public decimal? CommunicationRating { get; set; }
    public decimal? TeamworkRating { get; set; }
    public decimal? LeadershipRating { get; set; }
    public decimal? InitiativeRating { get; set; }
    public decimal? ProblemSolvingRating { get; set; }
    public decimal? AdaptabilityRating { get; set; }
    
    [MaxLength(2000)]
    public string? Achievements { get; set; }
    
    [MaxLength(2000)]
    public string? AreasOfImprovement { get; set; }
    
    [MaxLength(2000)]
    public string? Goals { get; set; }
    
    [MaxLength(2000)]
    public string? DevelopmentPlan { get; set; }
    
    [MaxLength(2000)]
    public string? EmployeeComments { get; set; }
    
    [MaxLength(2000)]
    public string? ReviewerComments { get; set; }
    
    [MaxLength(2000)]
    public string? HRComments { get; set; }
    
    public bool RecommendForPromotion { get; set; }
    public bool RecommendForTraining { get; set; }
    
    [MaxLength(500)]
    public string? TrainingRecommendations { get; set; }
    
    public decimal? SalaryIncrease { get; set; }
    public decimal? BonusRecommendation { get; set; }
    
    public DateTime? EmployeeSignedDate { get; set; }
    public DateTime? ReviewerSignedDate { get; set; }
    public DateTime? HRSignedDate { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
