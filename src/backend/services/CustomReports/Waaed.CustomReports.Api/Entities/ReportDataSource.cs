using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportDataSources")]
public class ReportDataSource : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string DataSourceType { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string ConnectionString { get; set; } = string.Empty;

    [StringLength(100)]
    public string? DatabaseName { get; set; }

    [StringLength(100)]
    public string? SchemaName { get; set; }

    [StringLength(2000)]
    public string? AvailableTables { get; set; }

    [StringLength(2000)]
    public string? AvailableViews { get; set; }

    [StringLength(2000)]
    public string? AvailableProcedures { get; set; }

    [StringLength(5000)]
    public string? TableRelationships { get; set; }

    [StringLength(100)]
    public string? Username { get; set; }

    [StringLength(500)]
    public string? EncryptedPassword { get; set; }

    [StringLength(1000)]
    public string? AdditionalParameters { get; set; }

    public int? ConnectionTimeout { get; set; }

    public int? CommandTimeout { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsDefault { get; set; } = false;

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Required]
    [StringLength(100)]
    public new string CreatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    public DateTime? LastModified { get; set; }

    public DateTime? LastTested { get; set; }

    [StringLength(50)]
    public string? LastTestResult { get; set; }

    [StringLength(1000)]
    public string? LastTestError { get; set; }

    [StringLength(1000)]
    public string? AccessPermissions { get; set; }

    [StringLength(1000)]
    public string? SecuritySettings { get; set; }

    public bool RequiresVPN { get; set; } = false;

    [StringLength(200)]
    public string? VPNConfiguration { get; set; }

    public bool EnableCaching { get; set; } = true;

    public int? CacheDurationMinutes { get; set; }

    [StringLength(1000)]
    public string? CacheSettings { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public virtual ICollection<ReportDataSourceField> DataSourceFields { get; set; } = new List<ReportDataSourceField>();
}
