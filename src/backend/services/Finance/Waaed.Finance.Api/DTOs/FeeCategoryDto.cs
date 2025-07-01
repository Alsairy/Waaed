namespace Waaed.Finance.Api.DTOs;

public class FeeCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime AcademicYear { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<FeeParticularDto> FeeParticulars { get; set; } = new();
    public List<FeeDiscountDto> FeeDiscounts { get; set; } = new();
    public List<FeeCategoryBatchDto> FeeCategoryBatches { get; set; } = new();
}

public class CreateFeeCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime AcademicYear { get; set; }
    public List<string> BatchNames { get; set; } = new();
}

public class UpdateFeeCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class FeeParticularDto
{
    public int Id { get; set; }
    public int FeeCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string ApplicabilityType { get; set; } = string.Empty;
    public string? StudentCategory { get; set; }
    public int? SpecificStudentId { get; set; }
    public bool IsTaxable { get; set; }
    public int? TaxTypeId { get; set; }
    public string? TaxTypeName { get; set; }
    public decimal? TaxRate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateFeeParticularDto
{
    public int FeeCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string ApplicabilityType { get; set; } = "AllStudents";
    public string? StudentCategory { get; set; }
    public int? SpecificStudentId { get; set; }
    public bool IsTaxable { get; set; } = false;
    public int? TaxTypeId { get; set; }
}

public class UpdateFeeParticularDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string ApplicabilityType { get; set; } = string.Empty;
    public string? StudentCategory { get; set; }
    public int? SpecificStudentId { get; set; }
    public bool IsTaxable { get; set; }
    public int? TaxTypeId { get; set; }
    public bool IsActive { get; set; }
}

public class FeeDiscountDto
{
    public int Id { get; set; }
    public int FeeCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public string ApplicabilityScope { get; set; } = string.Empty;
    public string? StudentCategory { get; set; }
    public int? SpecificStudentId { get; set; }
    public string? BatchName { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
}

public class CreateFeeDiscountDto
{
    public int FeeCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = "Percentage";
    public decimal DiscountValue { get; set; }
    public string ApplicabilityScope { get; set; } = "BatchWide";
    public string? StudentCategory { get; set; }
    public int? SpecificStudentId { get; set; }
    public string? BatchName { get; set; }
    public int Priority { get; set; } = 1;
}

public class UpdateFeeDiscountDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public string ApplicabilityScope { get; set; } = string.Empty;
    public string? StudentCategory { get; set; }
    public int? SpecificStudentId { get; set; }
    public string? BatchName { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
}

public class TaxTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TaxRate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTaxTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TaxRate { get; set; }
}

public class UpdateTaxTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TaxRate { get; set; }
    public bool IsActive { get; set; }
}

public class FeeCategoryBatchDto
{
    public int Id { get; set; }
    public int FeeCategoryId { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public string? Grade { get; set; }
    public string? Section { get; set; }
}
