using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.HR.Api.Entities;

public class Recruitment
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? JobCode { get; set; }
    
    public int PositionId { get; set; }
    public Position Position { get; set; } = null!;
    
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    
    [MaxLength(2000)]
    public string? JobDescription { get; set; }
    
    [MaxLength(1000)]
    public string? Requirements { get; set; }
    
    [MaxLength(1000)]
    public string? Skills { get; set; }
    
    public int VacancyCount { get; set; } = 1;
    
    [Required]
    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Open";
    
    public DateTime PostedDate { get; set; }
    public DateTime? ClosingDate { get; set; }
    
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    
    [MaxLength(20)]
    public string? EmploymentType { get; set; }
    
    [MaxLength(500)]
    public string? Location { get; set; }
    
    public bool IsRemote { get; set; }
    
    public int? ExperienceYears { get; set; }
    
    [MaxLength(500)]
    public string? Qualifications { get; set; }
    
    public int RequestedById { get; set; }
    public Employee RequestedBy { get; set; } = null!;
    
    public int? AssignedToId { get; set; }
    public Employee? AssignedTo { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    public bool IsPublished { get; set; }
    
    [MaxLength(500)]
    public string? ExternalJobBoardUrls { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}

public class JobApplication
{
    public int Id { get; set; }
    
    public int RecruitmentId { get; set; }
    public Recruitment Recruitment { get; set; } = null!;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    public string FullName => $"{FirstName} {LastName}";
    
    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(15)]
    public string? Phone { get; set; }
    
    [MaxLength(500)]
    public string? Address { get; set; }
    
    [MaxLength(500)]
    public string? ResumePath { get; set; }
    
    [MaxLength(500)]
    public string? CoverLetterPath { get; set; }
    
    [MaxLength(2000)]
    public string? CoverLetter { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Applied";
    
    public DateTime ApplicationDate { get; set; }
    
    public int? ExperienceYears { get; set; }
    
    [MaxLength(500)]
    public string? CurrentCompany { get; set; }
    
    [MaxLength(100)]
    public string? CurrentPosition { get; set; }
    
    public decimal? ExpectedSalary { get; set; }
    
    [MaxLength(20)]
    public string? NoticePeriod { get; set; }
    
    [MaxLength(1000)]
    public string? Skills { get; set; }
    
    [MaxLength(500)]
    public string? Qualifications { get; set; }
    
    public DateTime? InterviewDate { get; set; }
    
    [MaxLength(20)]
    public string? InterviewType { get; set; }
    
    [MaxLength(1000)]
    public string? InterviewNotes { get; set; }
    
    public decimal? InterviewRating { get; set; }
    
    public int? InterviewedById { get; set; }
    public Employee? InterviewedBy { get; set; }
    
    [MaxLength(500)]
    public string? RejectionReason { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
