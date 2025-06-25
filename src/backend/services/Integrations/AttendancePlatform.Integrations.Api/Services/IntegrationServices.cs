using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;

namespace AttendancePlatform.Integrations.Api.Services
{
    public class IntegrationServices
    {
        private readonly ILogger<IntegrationServices> _logger;
        private readonly AttendancePlatformDbContext _context;

        public IntegrationServices(ILogger<IntegrationServices> logger, AttendancePlatformDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<bool> CreateAuditLogAsync(AuditLog auditLog)
        {
            try
            {
                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create audit log");
                return false;
            }
        }

        public async Task<List<AttendanceRecord>> GetAttendanceRecordsAsync()
        {
            try
            {
                return await _context.AttendanceRecords.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get attendance records");
                return new List<AttendanceRecord>();
            }
        }
    }
}

