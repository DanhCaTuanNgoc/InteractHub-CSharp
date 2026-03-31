using System.Linq.Expressions;

namespace InteractHub.API.Interfaces;

public interface IRepository<T> where T : class
{
    IQueryable<T> Query();
    Task<T?> GetByIdAsync(object id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<int> SaveChangesAsync();
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
}
