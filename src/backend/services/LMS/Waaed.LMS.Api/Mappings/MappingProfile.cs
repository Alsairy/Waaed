using AutoMapper;
using Waaed.LMS.Api.Entities;
using Waaed.LMS.Api.DTOs;

namespace Waaed.LMS.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Course, CourseDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.InstructorName, opt => opt.MapFrom(src => src.InstructorId))
            .ForMember(dest => dest.EnrollmentCount, opt => opt.MapFrom(src => src.Enrollments.Count))
            .ForMember(dest => dest.ModuleCount, opt => opt.MapFrom(src => src.Modules.Count))
            .ForMember(dest => dest.AssignmentCount, opt => opt.MapFrom(src => src.Assignments.Count));

        CreateMap<Course, CourseListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.InstructorName, opt => opt.MapFrom(src => src.InstructorId))
            .ForMember(dest => dest.EnrollmentCount, opt => opt.MapFrom(src => src.Enrollments.Count));

        CreateMap<CreateCourseDto, Course>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => CourseStatus.Draft))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<Assignment, AssignmentDto>()
            .ForMember(dest => dest.SubmissionType, opt => opt.MapFrom(src => src.SubmissionType.ToString()))
            .ForMember(dest => dest.GradingType, opt => opt.MapFrom(src => src.GradingType.ToString()))
            .ForMember(dest => dest.SubmissionCount, opt => opt.MapFrom(src => src.Submissions.Count))
            .ForMember(dest => dest.GradedCount, opt => opt.MapFrom(src => src.Submissions.Count(s => s.Grade != null)));

        CreateMap<Assignment, AssignmentListDto>()
            .ForMember(dest => dest.GradingType, opt => opt.MapFrom(src => src.GradingType.ToString()))
            .ForMember(dest => dest.SubmissionCount, opt => opt.MapFrom(src => src.Submissions.Count))
            .ForMember(dest => dest.GradedCount, opt => opt.MapFrom(src => src.Submissions.Count(s => s.Grade != null)));

        CreateMap<CreateAssignmentDto, Assignment>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<Quiz, QuizDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.ScoringPolicy, opt => opt.MapFrom(src => src.ScoringPolicy.ToString()));

        CreateMap<Question, QuestionDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<Discussion, DiscussionDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<Rubric, RubricDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<LearningOutcome, LearningOutcomeDto>()
            .ForMember(dest => dest.Scope, opt => opt.MapFrom(src => src.Scope.ToString()));

        CreateMap<CourseEnrollment, EnrollmentDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<LTITool, LTIToolDto>()
            .ForMember(dest => dest.Version, opt => opt.MapFrom(src => src.Version.ToString()))
            .ForMember(dest => dest.Placements, opt => opt.MapFrom(src => src.Placements.ToString()));

        CreateMap<SCORMPackage, SCORMPackageDto>()
            .ForMember(dest => dest.Version, opt => opt.MapFrom(src => src.Version.ToString()));

        CreateMap<Conference, ConferenceDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<CourseTemplate, CourseTemplateDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
    }
}
