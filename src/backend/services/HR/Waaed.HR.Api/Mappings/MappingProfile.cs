using AutoMapper;
using Waaed.HR.Api.Entities;
using Waaed.HR.Api.DTOs;

namespace Waaed.HR.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Employee, EmployeeDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(dest => dest.PositionTitle, opt => opt.MapFrom(src => src.Position.Title))
            .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager != null ? src.Manager.FullName : null));

        CreateMap<CreateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Manager, opt => opt.Ignore())
            .ForMember(dest => dest.Subordinates, opt => opt.Ignore())
            .ForMember(dest => dest.LeaveRequests, opt => opt.Ignore())
            .ForMember(dest => dest.PerformanceReviews, opt => opt.Ignore())
            .ForMember(dest => dest.ConductedReviews, opt => opt.Ignore());

        CreateMap<UpdateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.EmployeeId, opt => opt.Ignore())
            .ForMember(dest => dest.HireDate, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Manager, opt => opt.Ignore())
            .ForMember(dest => dest.Subordinates, opt => opt.Ignore())
            .ForMember(dest => dest.LeaveRequests, opt => opt.Ignore())
            .ForMember(dest => dest.PerformanceReviews, opt => opt.Ignore())
            .ForMember(dest => dest.ConductedReviews, opt => opt.Ignore());

        CreateMap<Department, DepartmentDto>()
            .ForMember(dest => dest.ParentDepartmentName, opt => opt.MapFrom(src => src.ParentDepartment != null ? src.ParentDepartment.Name : null))
            .ForMember(dest => dest.HeadOfDepartmentName, opt => opt.MapFrom(src => src.HeadOfDepartment != null ? src.HeadOfDepartment.FullName : null))
            .ForMember(dest => dest.EmployeeCount, opt => opt.MapFrom(src => src.Employees.Count))
            .ForMember(dest => dest.SubDepartments, opt => opt.MapFrom(src => src.SubDepartments));

        CreateMap<CreateDepartmentDto, Department>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ParentDepartment, opt => opt.Ignore())
            .ForMember(dest => dest.HeadOfDepartment, opt => opt.Ignore())
            .ForMember(dest => dest.SubDepartments, opt => opt.Ignore())
            .ForMember(dest => dest.Employees, opt => opt.Ignore())
            .ForMember(dest => dest.Positions, opt => opt.Ignore());

        CreateMap<UpdateDepartmentDto, Department>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ParentDepartment, opt => opt.Ignore())
            .ForMember(dest => dest.HeadOfDepartment, opt => opt.Ignore())
            .ForMember(dest => dest.SubDepartments, opt => opt.Ignore())
            .ForMember(dest => dest.Employees, opt => opt.Ignore())
            .ForMember(dest => dest.Positions, opt => opt.Ignore());

        CreateMap<Department, DepartmentHierarchyDto>()
            .ForMember(dest => dest.Level, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.SubDepartments));

        CreateMap<Position, PositionDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(dest => dest.EmployeeCount, opt => opt.MapFrom(src => src.Employees.Count));

        CreateMap<CreatePositionDto, Position>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Employees, opt => opt.Ignore())
            .ForMember(dest => dest.Recruitments, opt => opt.Ignore());

        CreateMap<UpdatePositionDto, Position>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Employees, opt => opt.Ignore())
            .ForMember(dest => dest.Recruitments, opt => opt.Ignore());

        CreateMap<LeaveRequest, LeaveRequestDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.FullName))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? src.ApprovedBy.FullName : null));

        CreateMap<CreateLeaveRequestDto, LeaveRequest>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TotalDays, opt => opt.MapFrom(src => CalculateLeaveDays(src.StartDate, src.EndDate)))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Pending"))
            .ForMember(dest => dest.RequestDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Employee, opt => opt.Ignore())
            .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore());

        CreateMap<UpdateLeaveRequestDto, LeaveRequest>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.EmployeeId, opt => opt.Ignore())
            .ForMember(dest => dest.TotalDays, opt => opt.MapFrom(src => CalculateLeaveDays(src.StartDate, src.EndDate)))
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.RequestDate, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Employee, opt => opt.Ignore())
            .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore());

        CreateMap<PerformanceReview, PerformanceReviewDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.FullName))
            .ForMember(dest => dest.ReviewerName, opt => opt.MapFrom(src => src.Reviewer.FullName));

        CreateMap<CreatePerformanceReviewDto, PerformanceReview>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Draft"))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Employee, opt => opt.Ignore())
            .ForMember(dest => dest.Reviewer, opt => opt.Ignore());

        CreateMap<UpdatePerformanceReviewDto, PerformanceReview>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.EmployeeId, opt => opt.Ignore())
            .ForMember(dest => dest.ReviewerId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Employee, opt => opt.Ignore())
            .ForMember(dest => dest.Reviewer, opt => opt.Ignore());

        CreateMap<Recruitment, RecruitmentDto>()
            .ForMember(dest => dest.PositionTitle, opt => opt.MapFrom(src => src.Position.Title))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(dest => dest.RequestedByName, opt => opt.MapFrom(src => src.RequestedBy.FullName))
            .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.FullName : null))
            .ForMember(dest => dest.ApplicationCount, opt => opt.MapFrom(src => src.JobApplications.Count));

        CreateMap<CreateRecruitmentDto, Recruitment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Open"))
            .ForMember(dest => dest.PostedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsPublished, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.RequestedBy, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
            .ForMember(dest => dest.JobApplications, opt => opt.Ignore());

        CreateMap<UpdateRecruitmentDto, Recruitment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PositionId, opt => opt.Ignore())
            .ForMember(dest => dest.DepartmentId, opt => opt.Ignore())
            .ForMember(dest => dest.PostedDate, opt => opt.Ignore())
            .ForMember(dest => dest.RequestedById, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.RequestedBy, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
            .ForMember(dest => dest.JobApplications, opt => opt.Ignore());

        CreateMap<JobApplication, JobApplicationDto>()
            .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Recruitment.JobTitle))
            .ForMember(dest => dest.InterviewedByName, opt => opt.MapFrom(src => src.InterviewedBy != null ? src.InterviewedBy.FullName : null));

        CreateMap<CreateJobApplicationDto, JobApplication>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Applied"))
            .ForMember(dest => dest.ApplicationDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Recruitment, opt => opt.Ignore())
            .ForMember(dest => dest.InterviewedBy, opt => opt.Ignore());
    }

    private static int CalculateLeaveDays(DateTime startDate, DateTime endDate)
    {
        if (endDate < startDate)
            return 0;

        var totalDays = 0;
        var currentDate = startDate;

        while (currentDate <= endDate)
        {
            if (currentDate.DayOfWeek != DayOfWeek.Saturday && currentDate.DayOfWeek != DayOfWeek.Sunday)
            {
                totalDays++;
            }
            currentDate = currentDate.AddDays(1);
        }

        return totalDays;
    }
}
