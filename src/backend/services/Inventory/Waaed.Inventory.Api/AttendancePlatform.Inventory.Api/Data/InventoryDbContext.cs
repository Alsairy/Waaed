using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Inventory.Api.Entities;

namespace AttendancePlatform.Inventory.Api.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options)
    {
    }

    public DbSet<Store> Stores { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Indent> Indents { get; set; }
    public DbSet<IndentItem> IndentItems { get; set; }
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
    public DbSet<GoodsReceipt> GoodsReceipts { get; set; }
    public DbSet<GoodsReceiptItem> GoodsReceiptItems { get; set; }
    public DbSet<Issue> Issues { get; set; }
    public DbSet<IssueItem> IssueItems { get; set; }
    public DbSet<StockAdjustment> StockAdjustments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.ContactPerson).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.StoreType).HasMaxLength(50);

            entity.HasOne(e => e.ParentStore)
                  .WithMany(e => e.ChildStores)
                  .HasForeignKey(e => e.ParentStoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ItemCode).IsUnique();
            entity.Property(e => e.ItemCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.SubCategory).HasMaxLength(100);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UnitCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.Model).HasMaxLength(100);
            entity.Property(e => e.Specifications).HasMaxLength(500);
            entity.Property(e => e.ImagePath).HasMaxLength(500);
            entity.Property(e => e.Barcode).HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(1000);

            entity.HasOne(e => e.Store)
                  .WithMany(e => e.Items)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PreferredSupplier)
                  .WithMany(e => e.PreferredItems)
                  .HasForeignKey(e => e.PreferredSupplierId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SupplierCode).IsUnique();
            entity.Property(e => e.SupplierCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.State).HasMaxLength(100);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.ContactPerson).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Website).HasMaxLength(200);
            entity.Property(e => e.TaxNumber).HasMaxLength(50);
            entity.Property(e => e.RegistrationNumber).HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.PaymentTerms).HasMaxLength(50);
            entity.Property(e => e.CreditLimit).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(1000);
        });

        modelBuilder.Entity<Indent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IndentNumber).IsUnique();
            entity.Property(e => e.IndentNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.RequestedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.ApprovalNotes).HasMaxLength(1000);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.Purpose).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.TotalEstimatedCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RecurrencePattern).HasMaxLength(50);

            entity.HasOne(e => e.Store)
                  .WithMany(e => e.Indents)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<IndentItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EstimatedUnitCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.EstimatedTotalCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Specifications).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.Indent)
                  .WithMany(e => e.IndentItems)
                  .HasForeignKey(e => e.IndentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany(e => e.IndentItems)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PONumber).IsUnique();
            entity.Property(e => e.PONumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaymentTerms).HasMaxLength(50);
            entity.Property(e => e.DeliveryAddress).HasMaxLength(500);
            entity.Property(e => e.Terms).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.ReferenceNumber).HasMaxLength(100);

            entity.HasOne(e => e.Supplier)
                  .WithMany(e => e.PurchaseOrders)
                  .HasForeignKey(e => e.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PurchaseOrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountPercentage).HasColumnType("decimal(5,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxPercentage).HasColumnType("decimal(5,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Specifications).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.PurchaseOrder)
                  .WithMany(e => e.PurchaseOrderItems)
                  .HasForeignKey(e => e.PurchaseOrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany(e => e.PurchaseOrderItems)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<GoodsReceipt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.GRNNumber).IsUnique();
            entity.Property(e => e.GRNNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ReceivedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.InspectedBy).HasMaxLength(100);
            entity.Property(e => e.DeliveryNote).HasMaxLength(100);
            entity.Property(e => e.InvoiceNumber).HasMaxLength(100);
            entity.Property(e => e.VehicleNumber).HasMaxLength(100);
            entity.Property(e => e.DriverName).HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.QualityNotes).HasMaxLength(1000);
            entity.Property(e => e.QualityApprovedBy).HasMaxLength(100);

            entity.HasOne(e => e.PurchaseOrder)
                  .WithMany(e => e.GoodsReceipts)
                  .HasForeignKey(e => e.PurchaseOrderId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Supplier)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<GoodsReceiptItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BatchNumber).HasMaxLength(50);
            entity.Property(e => e.SerialNumbers).HasMaxLength(100);
            entity.Property(e => e.QualityNotes).HasMaxLength(1000);
            entity.Property(e => e.RejectionReason).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.GoodsReceipt)
                  .WithMany(e => e.GoodsReceiptItems)
                  .HasForeignKey(e => e.GoodsReceiptId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany(e => e.GoodsReceiptItems)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PurchaseOrderItem)
                  .WithMany()
                  .HasForeignKey(e => e.PurchaseOrderItemId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IssueNumber).IsUnique();
            entity.Property(e => e.IssueNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.IssuedTo).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.EmployeeId).HasMaxLength(100);
            entity.Property(e => e.IssuedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.IssueType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Purpose).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.TotalValue).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ReturnNotes).HasMaxLength(1000);

            entity.HasOne(e => e.Store)
                  .WithMany(e => e.Issues)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Indent)
                  .WithMany()
                  .HasForeignKey(e => e.IndentId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.TransferToStore)
                  .WithMany()
                  .HasForeignKey(e => e.TransferToStoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<IssueItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BatchNumber).HasMaxLength(50);
            entity.Property(e => e.SerialNumbers).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.Issue)
                  .WithMany(e => e.IssueItems)
                  .HasForeignKey(e => e.IssueId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany(e => e.IssueItems)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.IndentItem)
                  .WithMany()
                  .HasForeignKey(e => e.IndentItemId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<StockAdjustment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AdjustmentNumber).IsUnique();
            entity.Property(e => e.AdjustmentNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.AdjustmentType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.AdjustmentDirection).IsRequired().HasMaxLength(20);
            entity.Property(e => e.AdjustedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.Reason).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UnitCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalCostImpact).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ReferenceDocument).HasMaxLength(100);
            entity.Property(e => e.BatchNumber).HasMaxLength(50);

            entity.HasOne(e => e.Store)
                  .WithMany(e => e.StockAdjustments)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Item)
                  .WithMany(e => e.StockAdjustments)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Item>()
            .ToTable(t => t.HasCheckConstraint("CK_Item_StockLevels", "MinimumStock >= 0 AND MaximumStock >= MinimumStock AND ReorderLevel >= 0 AND ReorderQuantity >= 0"));

        modelBuilder.Entity<IndentItem>()
            .ToTable(t => t.HasCheckConstraint("CK_IndentItem_Quantities", "RequestedQuantity > 0 AND (ApprovedQuantity IS NULL OR ApprovedQuantity >= 0) AND IssuedQuantity >= 0"));

        modelBuilder.Entity<PurchaseOrderItem>()
            .ToTable(t => t.HasCheckConstraint("CK_PurchaseOrderItem_Quantities", "OrderedQuantity > 0 AND ReceivedQuantity >= 0 AND UnitPrice >= 0"));

        modelBuilder.Entity<GoodsReceiptItem>()
            .ToTable(t => t.HasCheckConstraint("CK_GoodsReceiptItem_Quantities", "ReceivedQuantity >= 0 AND AcceptedQuantity >= 0 AND RejectedQuantity >= 0 AND AcceptedQuantity + RejectedQuantity <= ReceivedQuantity"));

        modelBuilder.Entity<IssueItem>()
            .ToTable(t => t.HasCheckConstraint("CK_IssueItem_Quantities", "IssuedQuantity > 0 AND (ReturnedQuantity IS NULL OR ReturnedQuantity >= 0) AND (ReturnedQuantity IS NULL OR ReturnedQuantity <= IssuedQuantity)"));

        modelBuilder.Entity<StockAdjustment>()
            .ToTable(t => t.HasCheckConstraint("CK_StockAdjustment_Quantities", "CurrentStock >= 0 AND AdjustedStock >= 0 AND AdjustmentQuantity > 0"));
    }
}
