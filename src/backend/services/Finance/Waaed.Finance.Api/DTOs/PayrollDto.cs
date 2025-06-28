namespace Waaed.Finance.Api.DTOs;

public class PayrollEntryDto
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Designation { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal? HouseRentAllowance { get; set; }
    public decimal? MedicalAllowance { get; set; }
    public decimal? TransportAllowance { get; set; }
    public decimal? OtherAllowances { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal? ProvidentFund { get; set; }
    public decimal? IncomeTax { get; set; }
    public decimal? ProfessionalTax { get; set; }
    public decimal? LoanDeduction { get; set; }
    public decimal? OtherDeductions { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal NetSalary { get; set; }
    public DateTime PayrollMonth { get; set; }
    public int WorkingDays { get; set; }
    public int PresentDays { get; set; }
    public int AbsentDays { get; set; }
    public decimal? OvertimeHours { get; set; }
    public decimal? OvertimeAmount { get; set; }
    public decimal? Bonus { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ApprovalDate { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }
    public string? Remarks { get; set; }
}

public class CreatePayrollEntryDto
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Designation { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal? HouseRentAllowance { get; set; }
    public decimal? MedicalAllowance { get; set; }
    public decimal? TransportAllowance { get; set; }
    public decimal? OtherAllowances { get; set; }
    public decimal? ProvidentFund { get; set; }
    public decimal? IncomeTax { get; set; }
    public decimal? ProfessionalTax { get; set; }
    public decimal? LoanDeduction { get; set; }
    public decimal? OtherDeductions { get; set; }
    public DateTime PayrollMonth { get; set; }
    public int WorkingDays { get; set; }
    public int PresentDays { get; set; }
    public decimal? OvertimeHours { get; set; }
    public decimal? OvertimeAmount { get; set; }
    public decimal? Bonus { get; set; }
    public string? Remarks { get; set; }
}

public class UpdatePayrollEntryDto
{
    public decimal BasicSalary { get; set; }
    public decimal? HouseRentAllowance { get; set; }
    public decimal? MedicalAllowance { get; set; }
    public decimal? TransportAllowance { get; set; }
    public decimal? OtherAllowances { get; set; }
    public decimal? ProvidentFund { get; set; }
    public decimal? IncomeTax { get; set; }
    public decimal? ProfessionalTax { get; set; }
    public decimal? LoanDeduction { get; set; }
    public decimal? OtherDeductions { get; set; }
    public int WorkingDays { get; set; }
    public int PresentDays { get; set; }
    public decimal? OvertimeHours { get; set; }
    public decimal? OvertimeAmount { get; set; }
    public decimal? Bonus { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }
    public string? Remarks { get; set; }
}

public class PayrollSummaryDto
{
    public decimal TotalGrossSalary { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal TotalNetSalary { get; set; }
    public int TotalEmployees { get; set; }
    public int ProcessedPayrolls { get; set; }
    public int PendingPayrolls { get; set; }
    public Dictionary<string, decimal> SalaryByDepartment { get; set; } = new();
}
