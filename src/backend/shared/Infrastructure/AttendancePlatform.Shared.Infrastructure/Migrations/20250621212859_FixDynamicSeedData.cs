using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AttendancePlatform.Shared.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDynamicSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("339feade-6a2d-4d97-9ad6-189849c3f012"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("5301f82e-92ef-45fa-88fe-b9b4ca1ca868"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("5a3ad364-96e6-407f-b951-f956e39db351"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("83abebba-b815-4065-b5bb-8347ee543c7b"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("98f8c58f-6409-49b8-a060-a96dd91809c4"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("a1a40f6f-1452-4e6b-b9ab-aa0d9a3093cd"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("efa667c5-b654-468d-ba39-b82ea8bef080"));

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a6844265"),
                column: "CreatedAt",
                value: new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(3268));

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Action", "CreatedAt", "CreatedBy", "DeletedAt", "DeletedBy", "Description", "IsDeleted", "Name", "Resource", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("581b124f-d825-48db-96d6-b344a6844266"), "Create", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4532), null, null, null, "Create new users", false, "Create Users", "User", null, null },
                    { new Guid("581b124f-d825-48db-96d6-b344a6844267"), "Update", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4552), null, null, null, "Update user information", false, "Update Users", "User", null, null },
                    { new Guid("581b124f-d825-48db-96d6-b344a6844268"), "Delete", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4562), null, null, null, "Delete users", false, "Delete Users", "User", null, null },
                    { new Guid("581b124f-d825-48db-96d6-b344a6844269"), "Read", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4571), null, null, null, "View attendance records", false, "View Attendance", "Attendance", null, null },
                    { new Guid("581b124f-d825-48db-96d6-b344a684426a"), "Manage", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4580), null, null, null, "Manage attendance records", false, "Manage Attendance", "Attendance", null, null },
                    { new Guid("581b124f-d825-48db-96d6-b344a684426b"), "Read", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4590), null, null, null, "View reports", false, "View Reports", "Report", null, null },
                    { new Guid("581b124f-d825-48db-96d6-b344a684426c"), "Manage", new DateTime(2025, 6, 21, 21, 28, 58, 572, DateTimeKind.Utc).AddTicks(4598), null, null, null, "Manage system settings", false, "Manage Settings", "Settings", null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a6844266"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a6844267"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a6844268"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a6844269"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a684426a"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a684426b"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a684426c"));

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("581b124f-d825-48db-96d6-b344a6844265"),
                column: "CreatedAt",
                value: new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(13));

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Action", "CreatedAt", "CreatedBy", "DeletedAt", "DeletedBy", "Description", "IsDeleted", "Name", "Resource", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("339feade-6a2d-4d97-9ad6-189849c3f012"), "Delete", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1166), null, null, null, "Delete users", false, "Delete Users", "User", null, null },
                    { new Guid("5301f82e-92ef-45fa-88fe-b9b4ca1ca868"), "Read", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1186), null, null, null, "View attendance records", false, "View Attendance", "Attendance", null, null },
                    { new Guid("5a3ad364-96e6-407f-b951-f956e39db351"), "Manage", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1207), null, null, null, "Manage attendance records", false, "Manage Attendance", "Attendance", null, null },
                    { new Guid("83abebba-b815-4065-b5bb-8347ee543c7b"), "Update", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1145), null, null, null, "Update user information", false, "Update Users", "User", null, null },
                    { new Guid("98f8c58f-6409-49b8-a060-a96dd91809c4"), "Read", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1227), null, null, null, "View reports", false, "View Reports", "Report", null, null },
                    { new Guid("a1a40f6f-1452-4e6b-b9ab-aa0d9a3093cd"), "Manage", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1247), null, null, null, "Manage system settings", false, "Manage Settings", "Settings", null, null },
                    { new Guid("efa667c5-b654-468d-ba39-b82ea8bef080"), "Create", new DateTime(2025, 6, 21, 21, 12, 11, 46, DateTimeKind.Utc).AddTicks(1122), null, null, null, "Create new users", false, "Create Users", "User", null, null }
                });
        }
    }
}
