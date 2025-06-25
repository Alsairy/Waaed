using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;

namespace AttendancePlatform.Shared.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly AttendancePlatformDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly ICacheService _cacheService;
        protected readonly ILogger<Repository<T>> _logger;

        public Repository(AttendancePlatformDbContext context, ICacheService cacheService, ILogger<Repository<T>> logger)
        {
            _context = context;
            _dbSet = context.Set<T>();
            _cacheService = cacheService;
            _logger = logger;
        }

        public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{typeof(T).Name}_{id}";
            
            var cachedEntity = await _cacheService.GetAsync<T>(cacheKey);
            if (cachedEntity != null)
            {
                _logger.LogDebug("Cache hit for entity {EntityType} with ID {Id}", typeof(T).Name, id);
                return cachedEntity;
            }

            var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id, cancellationToken);
            
            if (entity != null)
            {
                await _cacheService.SetAsync(cacheKey, entity, TimeSpan.FromMinutes(15));
                _logger.LogDebug("Entity {EntityType} with ID {Id} cached", typeof(T).Name, id);
            }

            return entity;
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{typeof(T).Name}_all";
            
            var cachedEntities = await _cacheService.GetAsync<List<T>>(cacheKey);
            if (cachedEntities != null)
            {
                _logger.LogDebug("Cache hit for all entities of type {EntityType}", typeof(T).Name);
                return cachedEntities;
            }

            var entities = await _dbSet.AsNoTracking().ToListAsync(cancellationToken);
            
            await _cacheService.SetAsync(cacheKey, entities, TimeSpan.FromMinutes(10));
            _logger.LogDebug("All entities of type {EntityType} cached", typeof(T).Name);

            return entities;
        }

        public virtual async Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{typeof(T).Name}_paged_{page}_{pageSize}";
            
            var cachedEntities = await _cacheService.GetAsync<List<T>>(cacheKey);
            if (cachedEntities != null)
            {
                return cachedEntities;
            }

            var entities = await _dbSet
                .AsNoTracking()
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            await _cacheService.SetAsync(cacheKey, entities, TimeSpan.FromMinutes(5));
            return entities;
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking().Where(predicate).ToListAsync(cancellationToken);
        }

        public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(predicate, cancellationToken);
        }

        public virtual async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{typeof(T).Name}_count";
            
            var cachedCount = await _cacheService.GetAsync<int?>(cacheKey);
            if (cachedCount.HasValue)
            {
                return cachedCount.Value;
            }

            var count = await _dbSet.CountAsync(cancellationToken);
            await _cacheService.SetAsync(cacheKey, count, TimeSpan.FromMinutes(5));
            
            return count;
        }

        public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(entity, cancellationToken);
            
            await InvalidateCacheAsync();
            
            return entity;
        }

        public virtual async Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
        {
            _dbSet.Update(entity);
            
            await InvalidateCacheAsync();
            var entityId = EF.Property<Guid>(entity, "Id");
            await _cacheService.RemoveAsync($"{typeof(T).Name}_{entityId}");
            
            return await Task.FromResult(entity);
        }

        public virtual async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _dbSet.FindAsync(new object[] { id }, cancellationToken);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                
                await InvalidateCacheAsync();
                await _cacheService.RemoveAsync($"{typeof(T).Name}_{id}");
            }
        }

        protected virtual async Task InvalidateCacheAsync()
        {
            await _cacheService.RemoveByPatternAsync($"{typeof(T).Name}_*");
        }

        public virtual async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FindAsync(new object[] { id }, cancellationToken) != null;
        }

        public virtual async Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            if (Guid.TryParse(id, out var guidId))
            {
                return await GetByIdAsync(guidId, cancellationToken);
            }
            return null;
        }

        public virtual IQueryable<T> Query()
        {
            return _dbSet.AsQueryable();
        }
    }

    public class TenantRepository<T> : Repository<T>, ITenantRepository<T> 
        where T : class, ITenantAware
    {
        private readonly ITenantContext _tenantContext;

        public TenantRepository(AttendancePlatformDbContext context, ITenantContext tenantContext, ICacheService cacheService, ILogger<Repository<T>> logger) 
            : base(context, cacheService, logger)
        {
            _tenantContext = tenantContext;
        }

        public virtual async Task<IEnumerable<T>> GetByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
        {
            return await _dbSet.Where(e => e.TenantId == tenantId).ToListAsync(cancellationToken);
        }

        public virtual async Task<T?> GetByIdAndTenantAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId, cancellationToken);
        }

        public override async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            if (_tenantContext.TenantId.HasValue)
            {
                return await GetByTenantAsync(_tenantContext.TenantId.Value, cancellationToken);
            }
            
            return await base.GetAllAsync(cancellationToken);
        }

        public override async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            if (_tenantContext.TenantId.HasValue)
            {
                return await GetByIdAndTenantAsync(id, _tenantContext.TenantId.Value, cancellationToken);
            }
            
            return await base.GetByIdAsync(id, cancellationToken);
        }
    }

    public class UnitOfWork : IUnitOfWork
    {
        private readonly AttendancePlatformDbContext _context;
        private Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? _transaction;

        public UnitOfWork(AttendancePlatformDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync(cancellationToken);
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}

