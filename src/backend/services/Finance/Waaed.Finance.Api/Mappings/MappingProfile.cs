using AutoMapper;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Student, StudentDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
        CreateMap<CreateStudentDto, Student>();
        CreateMap<UpdateStudentDto, Student>();

        CreateMap<FeeStructure, FeeStructureDto>();
        CreateMap<CreateFeeStructureDto, FeeStructure>()
            .ForMember(dest => dest.TotalFee, opt => opt.MapFrom(src => 
                src.TuitionFee + 
                (src.AdmissionFee ?? 0) + 
                (src.ExaminationFee ?? 0) + 
                (src.LibraryFee ?? 0) + 
                (src.LaboratoryFee ?? 0) + 
                (src.TransportFee ?? 0) + 
                (src.HostelFee ?? 0) + 
                (src.MiscellaneousFee ?? 0)));
        CreateMap<UpdateFeeStructureDto, FeeStructure>()
            .ForMember(dest => dest.TotalFee, opt => opt.MapFrom(src => 
                src.TuitionFee + 
                (src.AdmissionFee ?? 0) + 
                (src.ExaminationFee ?? 0) + 
                (src.LibraryFee ?? 0) + 
                (src.LaboratoryFee ?? 0) + 
                (src.TransportFee ?? 0) + 
                (src.HostelFee ?? 0) + 
                (src.MiscellaneousFee ?? 0)));

        CreateMap<FeeCollection, FeeCollectionDto>()
            .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.FullName))
            .ForMember(dest => dest.StudentClass, opt => opt.MapFrom(src => $"{src.Student.Class}-{src.Student.Section}"))
            .ForMember(dest => dest.FeeStructureName, opt => opt.MapFrom(src => src.FeeStructure.Name))
            .ForMember(dest => dest.Balance, opt => opt.MapFrom(src => src.AmountDue - src.AmountPaid));
        CreateMap<CreateFeeCollectionDto, FeeCollection>()
            .ForMember(dest => dest.ReceiptNumber, opt => opt.MapFrom(src => GenerateReceiptNumber()))
            .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => DeterminePaymentStatus(src.AmountDue, src.AmountPaid)));
        CreateMap<UpdateFeeCollectionDto, FeeCollection>();

        CreateMap<Expense, ExpenseDto>()
            .ForMember(dest => dest.BudgetName, opt => opt.MapFrom(src => src.Budget != null ? src.Budget.Name : null));
        CreateMap<CreateExpenseDto, Expense>();
        CreateMap<UpdateExpenseDto, Expense>();

        CreateMap<Budget, BudgetDto>()
            .ForMember(dest => dest.RemainingAmount, opt => opt.MapFrom(src => src.AllocatedAmount - src.SpentAmount));
        CreateMap<CreateBudgetDto, Budget>();
        CreateMap<UpdateBudgetDto, Budget>();

        CreateMap<PayrollEntry, PayrollEntryDto>()
            .ForMember(dest => dest.AbsentDays, opt => opt.MapFrom(src => src.WorkingDays - src.PresentDays));
        CreateMap<CreatePayrollEntryDto, PayrollEntry>()
            .ForMember(dest => dest.GrossSalary, opt => opt.MapFrom(src => CalculateGrossSalary(src)))
            .ForMember(dest => dest.TotalDeductions, opt => opt.MapFrom(src => CalculateTotalDeductions(src)))
            .ForMember(dest => dest.NetSalary, opt => opt.MapFrom(src => CalculateNetSalary(src)));
        CreateMap<UpdatePayrollEntryDto, PayrollEntry>()
            .ForMember(dest => dest.GrossSalary, opt => opt.MapFrom(src => CalculateGrossSalary(src)))
            .ForMember(dest => dest.TotalDeductions, opt => opt.MapFrom(src => CalculateTotalDeductions(src)))
            .ForMember(dest => dest.NetSalary, opt => opt.MapFrom(src => CalculateNetSalary(src)));

        CreateMap<FinancialReport, FinancialReportDto>();
        CreateMap<CreateFinancialReportDto, FinancialReport>();
        CreateMap<UpdateFinancialReportDto, FinancialReport>();
    }

    private static string GenerateReceiptNumber()
    {
        return $"RCP{DateTime.UtcNow:yyyyMMdd}{DateTime.UtcNow.Ticks % 10000:D4}";
    }

    private static string DeterminePaymentStatus(decimal amountDue, decimal amountPaid)
    {
        if (amountPaid == 0) return "Pending";
        if (amountPaid >= amountDue) return "Paid";
        return "Partial";
    }

    private static decimal CalculateGrossSalary(CreatePayrollEntryDto dto)
    {
        return dto.BasicSalary + 
               (dto.HouseRentAllowance ?? 0) + 
               (dto.MedicalAllowance ?? 0) + 
               (dto.TransportAllowance ?? 0) + 
               (dto.OtherAllowances ?? 0) + 
               (dto.OvertimeAmount ?? 0) + 
               (dto.Bonus ?? 0);
    }

    private static decimal CalculateGrossSalary(UpdatePayrollEntryDto dto)
    {
        return dto.BasicSalary + 
               (dto.HouseRentAllowance ?? 0) + 
               (dto.MedicalAllowance ?? 0) + 
               (dto.TransportAllowance ?? 0) + 
               (dto.OtherAllowances ?? 0) + 
               (dto.OvertimeAmount ?? 0) + 
               (dto.Bonus ?? 0);
    }

    private static decimal CalculateTotalDeductions(CreatePayrollEntryDto dto)
    {
        return (dto.ProvidentFund ?? 0) + 
               (dto.IncomeTax ?? 0) + 
               (dto.ProfessionalTax ?? 0) + 
               (dto.LoanDeduction ?? 0) + 
               (dto.OtherDeductions ?? 0);
    }

    private static decimal CalculateTotalDeductions(UpdatePayrollEntryDto dto)
    {
        return (dto.ProvidentFund ?? 0) + 
               (dto.IncomeTax ?? 0) + 
               (dto.ProfessionalTax ?? 0) + 
               (dto.LoanDeduction ?? 0) + 
               (dto.OtherDeductions ?? 0);
    }

    private static decimal CalculateNetSalary(CreatePayrollEntryDto dto)
    {
        return CalculateGrossSalary(dto) - CalculateTotalDeductions(dto);
    }

    private static decimal CalculateNetSalary(UpdatePayrollEntryDto dto)
    {
        return CalculateGrossSalary(dto) - CalculateTotalDeductions(dto);
    }
}
