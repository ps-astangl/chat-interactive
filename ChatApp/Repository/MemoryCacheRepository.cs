using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace ChatApp.Repository;

// TODO
public class MemoryCacheRepository : MemoryDistributedCache
{
    /// <inheritdoc />
    public MemoryCacheRepository(IOptions<MemoryDistributedCacheOptions> optionsAccessor) : base(optionsAccessor)
    {
    }

    /// <inheritdoc />
    public MemoryCacheRepository(IOptions<MemoryDistributedCacheOptions> optionsAccessor, ILoggerFactory loggerFactory) : base(optionsAccessor, loggerFactory)
    {
    }
}