using System.Linq.Expressions;
using InteractHub.API.Data;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly AppDbContext _dbContext;
    private readonly DbSet<T> _dbSet;

    public Repository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<T>();
    }

    public IQueryable<T> Query() => _dbSet.AsQueryable();

    public async Task<T?> GetByIdAsync(object id) => await _dbSet.FindAsync(id);

    public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

    public void Update(T entity) => _dbSet.Update(entity);

    public void Delete(T entity) => _dbSet.Remove(entity);

    public async Task<int> SaveChangesAsync() => await _dbContext.SaveChangesAsync();

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate) => await _dbSet.AnyAsync(predicate);
}
