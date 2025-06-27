using AttendancePlatform.Finance.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AttendancePlatform.Finance.Api.Data;

public class FinanceDbContext : DbContext
{
    public FinanceDbContext(DbContextOptions<FinanceDbContext> options) : base(options)
    {
    }

    public DbSet<Student> Students { get; set; }
    public DbSet<FeeStructure> FeeStructures { get; set; }
    public DbSet<FeeCollection> FeeCollections { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<PayrollEntry> PayrollEntries { get; set; }
    public DbSet<FinancialReport> FinancialReports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StudentId).IsUnique();
            entity.Property(e => e.StudentId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Class).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Section).IsRequired().HasMaxLength(50);
            entity.Property(e => e.RollNumber).HasMaxLength(50);
            entity.Property(e => e.ParentName).HasMaxLength(100);
            entity.Property(e => e.ParentPhone).HasMaxLength(15);
            entity.Property(e => e.ParentEmail).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
        });

        modelBuilder.Entity<FeeStructure>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Class).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Section).HasMaxLength(50);
            entity.Property(e => e.TuitionFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AdmissionFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ExaminationFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.LibraryFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.LaboratoryFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TransportFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.HostelFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MiscellaneousFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaymentFrequency).IsRequired().HasMaxLength(20);
        });

        modelBuilder.Entity<FeeCollection>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReceiptNumber).IsUnique();
            entity.Property(e => e.ReceiptNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.AmountDue).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AmountPaid).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Discount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.LateFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20);
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.TransactionReference).HasMaxLength(100);
            entity.Property(e => e.Remarks).HasMaxLength(500);
            entity.Property(e => e.FeeType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CollectedBy).HasMaxLength(100);

            entity.HasOne(e => e.Student)
                .WithMany(s => s.FeeCollections)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FeeStructure)
                .WithMany(fs => fs.FeeCollections)
                .HasForeignKey(e => e.FeeStructureId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.SubCategory).HasMaxLength(50);
            entity.Property(e => e.Vendor).HasMaxLength(100);
            entity.Property(e => e.InvoiceNumber).HasMaxLength(50);
            entity.Property(e => e.PaymentMethod).HasMaxLength(20);
            entity.Property(e => e.PaymentReference).HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.PaidBy).HasMaxLength(100);
            entity.Property(e => e.Remarks).HasMaxLength(500);
            entity.Property(e => e.Department).HasMaxLength(50);
            entity.Property(e => e.RecurrencePattern).HasMaxLength(20);
            entity.Property(e => e.AttachmentPath).HasMaxLength(500);

            entity.HasOne(e => e.Budget)
                .WithMany(b => b.Expenses)
                .HasForeignKey(e => e.BudgetId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Department).HasMaxLength(50);
            entity.Property(e => e.AllocatedAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SpentAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.Remarks).HasMaxLength(500);
        });

        modelBuilder.Entity<PayrollEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.EmployeeId, e.PayrollMonth }).IsUnique();
            entity.Property(e => e.EmployeeId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.EmployeeName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(50);
            entity.Property(e => e.Designation).HasMaxLength(50);
            entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)");
            entity.Property(e => e.HouseRentAllowance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MedicalAllowance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TransportAllowance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.OtherAllowances).HasColumnType("decimal(18,2)");
            entity.Property(e => e.GrossSalary).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ProvidentFund).HasColumnType("decimal(18,2)");
            entity.Property(e => e.IncomeTax).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ProfessionalTax).HasColumnType("decimal(18,2)");
            entity.Property(e => e.LoanDeduction).HasColumnType("decimal(18,2)");
            entity.Property(e => e.OtherDeductions).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalDeductions).HasColumnType("decimal(18,2)");
            entity.Property(e => e.NetSalary).HasColumnType("decimal(18,2)");
            entity.Property(e => e.OvertimeHours).HasColumnType("decimal(18,2)");
            entity.Property(e => e.OvertimeAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Bonus).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.PaymentReference).HasMaxLength(100);
            entity.Property(e => e.Remarks).HasMaxLength(500);
        });

        modelBuilder.Entity<FinancialReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReportName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ReportType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.GeneratedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TotalIncome).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalExpenses).HasColumnType("decimal(18,2)");
            entity.Property(e => e.NetProfit).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FeeCollected).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FeePending).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SalaryPaid).HasColumnType("decimal(18,2)");
            entity.Property(e => e.OperationalExpenses).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FilePath).HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ReviewedBy).HasMaxLength(100);
            entity.Property(e => e.Comments).HasMaxLength(500);
        });
    }
}
