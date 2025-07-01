using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportDataSourceFields")]
public class ReportDataSourceField : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int DataSourceId { get; set; }

    [Required]
    [StringLength(200)]
    public string TableName { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string FieldName { get; set; } = string.Empty;

    [StringLength(200)]
    public string? DisplayName { get; set; }

    [Required]
    [StringLength(50)]
    public string DataType { get; set; } = string.Empty;

    public int? MaxLength { get; set; }

    public bool IsNullable { get; set; } = true;

    public bool IsPrimaryKey { get; set; } = false;

    public bool IsForeignKey { get; set; } = false;

    [StringLength(200)]
    public string? ForeignKeyTable { get; set; }

    [StringLength(200)]
    public string? ForeignKeyField { get; set; }

    public bool IsIndexed { get; set; } = false;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? DefaultValue { get; set; }

    [StringLength(1000)]
    public string? ValidationRules { get; set; }

    [StringLength(1000)]
    public string? LookupValues { get; set; }

    [StringLength(200)]
    public string? LookupTable { get; set; }

    [StringLength(200)]
    public string? LookupDisplayField { get; set; }

    [StringLength(200)]
    public string? LookupValueField { get; set; }

    public bool IsCalculated { get; set; } = false;

    [StringLength(1000)]
    public string? CalculationFormula { get; set; }

    public bool IsVisible { get; set; } = true;

    public bool IsFilterable { get; set; } = true;

    public bool IsSortable { get; set; } = true;

    public bool IsGroupable { get; set; } = true;

    public bool IsAggregatable { get; set; } = false;

    [StringLength(500)]
    public string? AggregationFunctions { get; set; }

    [StringLength(100)]
    public string? FormatString { get; set; }

    [StringLength(50)]
    public string? Alignment { get; set; }

    public int? DisplayOrder { get; set; }

    public int? DefaultWidth { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [ForeignKey("DataSourceId")]
    public virtual ReportDataSource DataSource { get; set; } = null!;
}
