namespace AttendancePlatform.Finance.Api.DTOs;

public class FeeStructureDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Class { get; set; } = string.Empty;
    public string? Section { get; set; }
    public decimal TuitionFee { get; set; }
    public decimal? AdmissionFee { get; set; }
    public decimal? ExaminationFee { get; set; }
    public decimal? LibraryFee { get; set; }
    public decimal? LaboratoryFee { get; set; }
    public decimal? TransportFee { get; set; }
    public decimal? HostelFee { get; set; }
    public decimal? MiscellaneousFee { get; set; }
    public decimal TotalFee { get; set; }
    public DateTime AcademicYear { get; set; }
    public string PaymentFrequency { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

public class CreateFeeStructureDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Class { get; set; } = string.Empty;
    public string? Section { get; set; }
    public decimal TuitionFee { get; set; }
    public decimal? AdmissionFee { get; set; }
    public decimal? ExaminationFee { get; set; }
    public decimal? LibraryFee { get; set; }
    public decimal? LaboratoryFee { get; set; }
    public decimal? TransportFee { get; set; }
    public decimal? HostelFee { get; set; }
    public decimal? MiscellaneousFee { get; set; }
    public DateTime AcademicYear { get; set; }
    public string PaymentFrequency { get; set; } = "Monthly";
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

public class UpdateFeeStructureDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TuitionFee { get; set; }
    public decimal? AdmissionFee { get; set; }
    public decimal? ExaminationFee { get; set; }
    public decimal? LibraryFee { get; set; }
    public decimal? LaboratoryFee { get; set; }
    public decimal? TransportFee { get; set; }
    public decimal? HostelFee { get; set; }
    public decimal? MiscellaneousFee { get; set; }
    public string PaymentFrequency { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}
