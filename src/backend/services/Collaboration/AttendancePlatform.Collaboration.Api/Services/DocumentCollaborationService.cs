using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Collaboration.Api.Services
{
    public interface IDocumentCollaborationService
    {
        Task<Document> CreateDocumentAsync(string title, string content, Guid createdById, Guid? teamId = null);
        Task<Document> UpdateDocumentAsync(Guid documentId, string content, Guid userId);
        Task<Document?> GetDocumentAsync(Guid documentId);
        Task<IEnumerable<Document>> GetUserDocumentsAsync(Guid userId);
        Task<bool> ShareDocumentAsync(Guid documentId, Guid userId, string permission = "Read");
        Task<bool> RevokeDocumentAccessAsync(Guid documentId, Guid userId);
        Task<IEnumerable<DocumentVersion>> GetDocumentVersionsAsync(Guid documentId);
        Task<DocumentVersion> CreateDocumentVersionAsync(Guid documentId, string content, Guid userId, string? comment = null);
        Task<bool> LockDocumentAsync(Guid documentId, Guid userId);
        Task<bool> UnlockDocumentAsync(Guid documentId, Guid userId);
    }

    public class DocumentCollaborationService : IDocumentCollaborationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<DocumentCollaborationService> _logger;

        public DocumentCollaborationService(AttendancePlatformDbContext context, ILogger<DocumentCollaborationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Document> CreateDocumentAsync(string title, string content, Guid createdById, Guid? teamId = null)
        {
            try
            {
                var document = new Document
                {
                    Id = Guid.NewGuid(),
                    FileName = title,
                    FilePath = $"/documents/{Guid.NewGuid()}.txt",
                    FileType = "text/plain",
                    FileSize = System.Text.Encoding.UTF8.GetByteCount(content),
                    UploadedById = createdById,
                    UploadedAt = DateTime.UtcNow,
                    TeamId = teamId,
                    Status = "Active",
                    Version = 1,
                    IsShared = false
                };

                _context.Documents.Add(document);

                var version = new DocumentVersion
                {
                    Id = Guid.NewGuid(),
                    DocumentId = document.Id,
                    VersionNumber = 1,
                    FilePath = document.FilePath,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow,
                    ChangeDescription = "Initial version",
                    FileSize = document.FileSize
                };

                _context.DocumentVersions.Add(version);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document created successfully. DocumentId: {DocumentId}, Title: {Title}", 
                    document.Id, title);
                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document. Title: {Title}, CreatedById: {CreatedById}", title, createdById);
                throw;
            }
        }

        public async Task<Document> UpdateDocumentAsync(Guid documentId, string content, Guid userId)
        {
            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    throw new ArgumentException("Document not found");

                document.FileSize = System.Text.Encoding.UTF8.GetByteCount(content);
                document.Version++;

                var version = new DocumentVersion
                {
                    Id = Guid.NewGuid(),
                    DocumentId = documentId,
                    VersionNumber = document.Version,
                    FilePath = document.FilePath,
                    CreatedById = userId,
                    CreatedAt = DateTime.UtcNow,
                    ChangeDescription = "Document updated",
                    FileSize = document.FileSize
                };

                _context.DocumentVersions.Add(version);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document updated successfully. DocumentId: {DocumentId}, Version: {Version}, UserId: {UserId}", 
                    documentId, document.Version, userId);
                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating document. DocumentId: {DocumentId}, UserId: {UserId}", documentId, userId);
                throw;
            }
        }

        public async Task<Document?> GetDocumentAsync(Guid documentId)
        {
            try
            {
                var document = await _context.Documents
                    .Include(d => d.UploadedBy)
                    .Include(d => d.Team)
                    .Include(d => d.Project)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document. DocumentId: {DocumentId}", documentId);
                throw;
            }
        }

        public async Task<IEnumerable<Document>> GetUserDocumentsAsync(Guid userId)
        {
            try
            {
                var documents = await _context.Documents
                    .Include(d => d.UploadedBy)
                    .Include(d => d.Team)
                    .Where(d => d.UploadedById == userId || d.IsShared)
                    .OrderByDescending(d => d.UploadedAt)
                    .ToListAsync();

                return documents;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user documents. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ShareDocumentAsync(Guid documentId, Guid userId, string permission = "Read")
        {
            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return false;

                document.IsShared = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document shared successfully. DocumentId: {DocumentId}, UserId: {UserId}, Permission: {Permission}", 
                    documentId, userId, permission);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing document. DocumentId: {DocumentId}, UserId: {UserId}", documentId, userId);
                throw;
            }
        }

        public async Task<bool> RevokeDocumentAccessAsync(Guid documentId, Guid userId)
        {
            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.UploadedById == userId)
                    return false;

                document.IsShared = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document access revoked successfully. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking document access. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                throw;
            }
        }

        public async Task<IEnumerable<DocumentVersion>> GetDocumentVersionsAsync(Guid documentId)
        {
            try
            {
                var versions = await _context.DocumentVersions
                    .Include(dv => dv.CreatedBy)
                    .Where(dv => dv.DocumentId == documentId)
                    .OrderByDescending(dv => dv.VersionNumber)
                    .ToListAsync();

                return versions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document versions. DocumentId: {DocumentId}", documentId);
                throw;
            }
        }

        public async Task<DocumentVersion> CreateDocumentVersionAsync(Guid documentId, string content, Guid userId, string? comment = null)
        {
            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    throw new ArgumentException("Document not found");

                var version = new DocumentVersion
                {
                    Id = Guid.NewGuid(),
                    DocumentId = documentId,
                    VersionNumber = document.Version + 1,
                    FilePath = document.FilePath,
                    CreatedById = userId,
                    CreatedAt = DateTime.UtcNow,
                    ChangeDescription = comment ?? "Manual version created",
                    FileSize = System.Text.Encoding.UTF8.GetByteCount(content)
                };

                document.Version = version.VersionNumber;

                _context.DocumentVersions.Add(version);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document version created successfully. DocumentId: {DocumentId}, Version: {Version}, UserId: {UserId}", 
                    documentId, version.VersionNumber, userId);
                return version;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document version. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                throw;
            }
        }

        public async Task<bool> LockDocumentAsync(Guid documentId, Guid userId)
        {
            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return false;

                if (document.Status == "Locked")
                    return false;

                document.Status = "Locked";
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document locked successfully. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error locking document. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                throw;
            }
        }

        public async Task<bool> UnlockDocumentAsync(Guid documentId, Guid userId)
        {
            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return false;

                if (document.Status != "Locked")
                    return false;

                document.Status = "Active";
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document unlocked successfully. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlocking document. DocumentId: {DocumentId}, UserId: {UserId}", 
                    documentId, userId);
                throw;
            }
        }
    }
}
