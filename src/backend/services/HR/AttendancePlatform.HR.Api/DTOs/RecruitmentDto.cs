namespace AttendancePlatform.HR.Api.DTOs;

public class RecruitmentDto
{
    public int Id { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? JobCode { get; set; }
    public int PositionId { get; set; }
    public string PositionTitle { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? JobDescription { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public int VacancyCount { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime PostedDate { get; set; }
    public DateTime? ClosingDate { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? EmploymentType { get; set; }
    public string? Location { get; set; }
    public bool IsRemote { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Qualifications { get; set; }
    public int RequestedById { get; set; }
    public string RequestedByName { get; set; } = string.Empty;
    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public string? Notes { get; set; }
    public bool IsPublished { get; set; }
    public string? ExternalJobBoardUrls { get; set; }
    public int ApplicationCount { get; set; }
}

public class CreateRecruitmentDto
{
    public string JobTitle { get; set; } = string.Empty;
    public string? JobCode { get; set; }
    public int PositionId { get; set; }
    public int DepartmentId { get; set; }
    public string? JobDescription { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public int VacancyCount { get; set; } = 1;
    public string Priority { get; set; } = "Medium";
    public DateTime? ClosingDate { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? EmploymentType { get; set; }
    public string? Location { get; set; }
    public bool IsRemote { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Qualifications { get; set; }
    public int RequestedById { get; set; }
    public int? AssignedToId { get; set; }
    public string? Notes { get; set; }
    public string? ExternalJobBoardUrls { get; set; }
}

public class UpdateRecruitmentDto
{
    public string JobTitle { get; set; } = string.Empty;
    public string? JobCode { get; set; }
    public string? JobDescription { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public int VacancyCount { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ClosingDate { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? EmploymentType { get; set; }
    public string? Location { get; set; }
    public bool IsRemote { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Qualifications { get; set; }
    public int? AssignedToId { get; set; }
    public string? Notes { get; set; }
    public bool IsPublished { get; set; }
    public string? ExternalJobBoardUrls { get; set; }
}

public class JobApplicationDto
{
    public int Id { get; set; }
    public int RecruitmentId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ResumePath { get; set; }
    public string? CoverLetterPath { get; set; }
    public string? CoverLetter { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ApplicationDate { get; set; }
    public int? ExperienceYears { get; set; }
    public string? CurrentCompany { get; set; }
    public string? CurrentPosition { get; set; }
    public decimal? ExpectedSalary { get; set; }
    public string? NoticePeriod { get; set; }
    public string? Skills { get; set; }
    public string? Qualifications { get; set; }
    public DateTime? InterviewDate { get; set; }
    public string? InterviewType { get; set; }
    public string? InterviewNotes { get; set; }
    public decimal? InterviewRating { get; set; }
    public int? InterviewedById { get; set; }
    public string? InterviewedByName { get; set; }
    public string? RejectionReason { get; set; }
}

public class CreateJobApplicationDto
{
    public int RecruitmentId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? CoverLetter { get; set; }
    public int? ExperienceYears { get; set; }
    public string? CurrentCompany { get; set; }
    public string? CurrentPosition { get; set; }
    public decimal? ExpectedSalary { get; set; }
    public string? NoticePeriod { get; set; }
    public string? Skills { get; set; }
    public string? Qualifications { get; set; }
}

public class RecruitmentSummaryDto
{
    public int TotalJobs { get; set; }
    public int OpenJobs { get; set; }
    public int ClosedJobs { get; set; }
    public int TotalApplications { get; set; }
    public int PendingApplications { get; set; }
    public int InterviewScheduled { get; set; }
    public int OffersExtended { get; set; }
    public Dictionary<string, int> JobsByDepartment { get; set; } = new();
    public Dictionary<string, int> ApplicationsByStatus { get; set; } = new();
}
