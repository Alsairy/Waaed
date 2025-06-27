using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AttendancePlatform.Inventory.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialInventoryMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ContactPerson = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    StoreType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ParentStoreId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stores_Stores_ParentStoreId",
                        column: x => x.ParentStoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SupplierCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ContactPerson = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Website = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    TaxNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    RegistrationNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    PaymentTerms = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PaymentDays = table.Column<int>(type: "INTEGER", nullable: true),
                    Rating = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Indents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IndentNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    IndentDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RequiredDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RequestedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    StoreId = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ApprovalNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Priority = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Purpose = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    TotalEstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsRecurring = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    NextRecurrenceDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Indents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Indents_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ItemCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SubCategory = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CurrentStock = table.Column<int>(type: "INTEGER", nullable: false),
                    MinimumStock = table.Column<int>(type: "INTEGER", nullable: false),
                    MaximumStock = table.Column<int>(type: "INTEGER", nullable: false),
                    ReorderLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    ReorderQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    StoreId = table.Column<int>(type: "INTEGER", nullable: false),
                    PreferredSupplierId = table.Column<int>(type: "INTEGER", nullable: true),
                    Brand = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Specifications = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ImagePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Barcode = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    IsConsumable = table.Column<bool>(type: "INTEGER", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "INTEGER", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Location = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                    table.CheckConstraint("CK_Item_StockLevels", "MinimumStock >= 0 AND MaximumStock >= MinimumStock AND ReorderLevel >= 0 AND ReorderQuantity >= 0");
                    table.ForeignKey(
                        name: "FK_Items_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Items_Suppliers_PreferredSupplierId",
                        column: x => x.PreferredSupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PONumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    PODate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RequiredDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SupplierId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentTerms = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    DeliveryAddress = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Terms = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ExpectedDeliveryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseOrders_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Issues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IssueNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    StoreId = table.Column<int>(type: "INTEGER", nullable: false),
                    IssuedTo = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    EmployeeId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    IssuedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IssueType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    IndentId = table.Column<int>(type: "INTEGER", nullable: true),
                    TransferToStoreId = table.Column<int>(type: "INTEGER", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Purpose = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RequiresReturn = table.Column<bool>(type: "INTEGER", nullable: false),
                    ExpectedReturnDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ActualReturnDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReturnNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Issues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Issues_Indents_IndentId",
                        column: x => x.IndentId,
                        principalTable: "Indents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Issues_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Issues_Stores_TransferToStoreId",
                        column: x => x.TransferToStoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IndentItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IndentId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    RequestedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    ApprovedQuantity = table.Column<int>(type: "INTEGER", nullable: true),
                    IssuedQuantity = table.Column<int>(type: "INTEGER", nullable: true),
                    EstimatedUnitCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedTotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Specifications = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IndentItems", x => x.Id);
                    table.CheckConstraint("CK_IndentItem_Quantities", "RequestedQuantity > 0 AND (ApprovedQuantity IS NULL OR ApprovedQuantity >= 0) AND IssuedQuantity >= 0");
                    table.ForeignKey(
                        name: "FK_IndentItems_Indents_IndentId",
                        column: x => x.IndentId,
                        principalTable: "Indents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IndentItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockAdjustments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AdjustmentNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AdjustmentDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    StoreId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    AdjustmentType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CurrentStock = table.Column<int>(type: "INTEGER", nullable: false),
                    AdjustedStock = table.Column<int>(type: "INTEGER", nullable: false),
                    AdjustmentQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    AdjustmentDirection = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AdjustedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalCostImpact = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReferenceDocument = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    BatchNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockAdjustments", x => x.Id);
                    table.CheckConstraint("CK_StockAdjustment_Quantities", "CurrentStock >= 0 AND AdjustedStock >= 0 AND AdjustmentQuantity > 0");
                    table.ForeignKey(
                        name: "FK_StockAdjustments_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockAdjustments_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GoodsReceipts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GRNNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    GRNDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PurchaseOrderId = table.Column<int>(type: "INTEGER", nullable: true),
                    SupplierId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReceivedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    InspectedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DeliveryNote = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    InvoiceNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    VehicleNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DriverName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    QualityNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    IsQualityApproved = table.Column<bool>(type: "INTEGER", nullable: false),
                    QualityApprovedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    QualityApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoodsReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoodsReceipts_PurchaseOrders_PurchaseOrderId",
                        column: x => x.PurchaseOrderId,
                        principalTable: "PurchaseOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GoodsReceipts_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PurchaseOrderId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    OrderedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    ReceivedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TaxPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Specifications = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrderItems", x => x.Id);
                    table.CheckConstraint("CK_PurchaseOrderItem_Quantities", "OrderedQuantity > 0 AND ReceivedQuantity >= 0 AND UnitPrice >= 0");
                    table.ForeignKey(
                        name: "FK_PurchaseOrderItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseOrderItems_PurchaseOrders_PurchaseOrderId",
                        column: x => x.PurchaseOrderId,
                        principalTable: "PurchaseOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IssueItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IssueId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    IndentItemId = table.Column<int>(type: "INTEGER", nullable: true),
                    IssuedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    ReturnedQuantity = table.Column<int>(type: "INTEGER", nullable: true),
                    UnitCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BatchNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    SerialNumbers = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueItems", x => x.Id);
                    table.CheckConstraint("CK_IssueItem_Quantities", "IssuedQuantity > 0 AND (ReturnedQuantity IS NULL OR ReturnedQuantity >= 0) AND (ReturnedQuantity IS NULL OR ReturnedQuantity <= IssuedQuantity)");
                    table.ForeignKey(
                        name: "FK_IssueItems_IndentItems_IndentItemId",
                        column: x => x.IndentItemId,
                        principalTable: "IndentItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_IssueItems_Issues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IssueItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GoodsReceiptItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GoodsReceiptId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    PurchaseOrderItemId = table.Column<int>(type: "INTEGER", nullable: true),
                    OrderedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    ReceivedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    AcceptedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    RejectedQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BatchNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SerialNumbers = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    QualityNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    RejectionReason = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoodsReceiptItems", x => x.Id);
                    table.CheckConstraint("CK_GoodsReceiptItem_Quantities", "ReceivedQuantity >= 0 AND AcceptedQuantity >= 0 AND RejectedQuantity >= 0 AND AcceptedQuantity + RejectedQuantity <= ReceivedQuantity");
                    table.ForeignKey(
                        name: "FK_GoodsReceiptItems_GoodsReceipts_GoodsReceiptId",
                        column: x => x.GoodsReceiptId,
                        principalTable: "GoodsReceipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptItems_PurchaseOrderItems_PurchaseOrderItemId",
                        column: x => x.PurchaseOrderItemId,
                        principalTable: "PurchaseOrderItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptItems_GoodsReceiptId",
                table: "GoodsReceiptItems",
                column: "GoodsReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptItems_ItemId",
                table: "GoodsReceiptItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptItems_PurchaseOrderItemId",
                table: "GoodsReceiptItems",
                column: "PurchaseOrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_GRNNumber",
                table: "GoodsReceipts",
                column: "GRNNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_PurchaseOrderId",
                table: "GoodsReceipts",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_SupplierId",
                table: "GoodsReceipts",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_IndentItems_IndentId",
                table: "IndentItems",
                column: "IndentId");

            migrationBuilder.CreateIndex(
                name: "IX_IndentItems_ItemId",
                table: "IndentItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Indents_IndentNumber",
                table: "Indents",
                column: "IndentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Indents_StoreId",
                table: "Indents",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_IssueItems_IndentItemId",
                table: "IssueItems",
                column: "IndentItemId");

            migrationBuilder.CreateIndex(
                name: "IX_IssueItems_IssueId",
                table: "IssueItems",
                column: "IssueId");

            migrationBuilder.CreateIndex(
                name: "IX_IssueItems_ItemId",
                table: "IssueItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Issues_IndentId",
                table: "Issues",
                column: "IndentId");

            migrationBuilder.CreateIndex(
                name: "IX_Issues_IssueNumber",
                table: "Issues",
                column: "IssueNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Issues_StoreId",
                table: "Issues",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Issues_TransferToStoreId",
                table: "Issues",
                column: "TransferToStoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_ItemCode",
                table: "Items",
                column: "ItemCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Items_PreferredSupplierId",
                table: "Items",
                column: "PreferredSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_StoreId",
                table: "Items",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderItems_ItemId",
                table: "PurchaseOrderItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderItems_PurchaseOrderId",
                table: "PurchaseOrderItems",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_PONumber",
                table: "PurchaseOrders",
                column: "PONumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_SupplierId",
                table: "PurchaseOrders",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_AdjustmentNumber",
                table: "StockAdjustments",
                column: "AdjustmentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_ItemId",
                table: "StockAdjustments",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_StoreId",
                table: "StockAdjustments",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Stores_Code",
                table: "Stores",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stores_ParentStoreId",
                table: "Stores",
                column: "ParentStoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Suppliers",
                column: "SupplierCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GoodsReceiptItems");

            migrationBuilder.DropTable(
                name: "IssueItems");

            migrationBuilder.DropTable(
                name: "StockAdjustments");

            migrationBuilder.DropTable(
                name: "GoodsReceipts");

            migrationBuilder.DropTable(
                name: "PurchaseOrderItems");

            migrationBuilder.DropTable(
                name: "IndentItems");

            migrationBuilder.DropTable(
                name: "Issues");

            migrationBuilder.DropTable(
                name: "PurchaseOrders");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Indents");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropTable(
                name: "Stores");
        }
    }
}
