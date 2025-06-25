namespace AttendancePlatform.Shared.Domain.Interfaces
{
    public interface ITenantAware
    {
        Guid Id { get; set; }
        Guid TenantId { get; set; }
    }
    
    public interface IAuditable
    {
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
        string? CreatedBy { get; set; }
        string? UpdatedBy { get; set; }
    }
    
    public interface ISoftDeletable
    {
        bool IsDeleted { get; set; }
        DateTime? DeletedAt { get; set; }
        string? DeletedBy { get; set; }
    }
    
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
        Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        IQueryable<T> Query();
    }
    
    public interface ITenantRepository<T> : IRepository<T> where T : class, ITenantAware
    {
        Task<IEnumerable<T>> GetByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
        Task<T?> GetByIdAndTenantAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default);
    }
    
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    }
    
    public interface ITenantContext
    {
        Guid? TenantId { get; }
        string? TenantSubdomain { get; }
        void SetTenant(Guid tenantId, string subdomain);
    }
    
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? UserName { get; }
        string? Email { get; }
        IEnumerable<string> Roles { get; }
        bool IsAuthenticated { get; }
        bool HasPermission(string permission);
        bool HasRole(string role);
    }
    
    public interface IDateTimeProvider
    {
        DateTime UtcNow { get; }
        DateTime Now { get; }
        DateOnly Today { get; }
    }
    
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = false, CancellationToken cancellationToken = default);
        Task SendEmailAsync(IEnumerable<string> to, string subject, string body, bool isHtml = false, CancellationToken cancellationToken = default);
    }
    
    public interface ISmsService
    {
        Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
    }
    
    public interface IPushNotificationService
    {
        Task SendNotificationAsync(string deviceToken, string title, string message, object? data = null, CancellationToken cancellationToken = default);
        Task SendNotificationToUserAsync(Guid userId, string title, string message, object? data = null, CancellationToken cancellationToken = default);
    }
}

