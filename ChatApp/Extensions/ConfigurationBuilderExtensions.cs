using Azure.Data.Tables;
using Azure.Storage;
using Azure.Storage.Queues;
using ChatApp.Repository;
using Microsoft.Extensions.Caching.Memory;

namespace ChatApp.Extensions;

public static class ConfigurationBuilderExtensions
{
    public static void BuildConfiguration(this IConfigurationBuilder config, IWebHostEnvironment environment)
    {
        config.SetBasePath(environment.ContentRootPath)
            .AddEnvironmentVariables();
    }
    public static void AddQueueClient(this IServiceCollection serviceCollection, IConfiguration configuration)
    { 
        string accountName = configuration["StorageAccountName"];
        string accountKey = configuration["StorageAccountKey"];
        Uri serviceUri = new Uri(configuration["StorageAccountQueueUri"]);

        // Create a SharedKeyCredential that we can use to authenticate
        StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

        // Create a client that can authenticate with a connection string
        var client = new QueueServiceClient(serviceUri, credential);

        serviceCollection.AddSingleton(client);
    }
    public static void AddTableClient(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        string accountName = configuration["StorageAccountName"];
        string accountKey = configuration["StorageAccountKey"];
        Uri serviceUri = new Uri(configuration["StorageAccountTableUri"]);

        TableServiceClient serviceClient = new TableServiceClient(serviceUri, new TableSharedKeyCredential(accountName, accountKey));
        
        serviceCollection.AddSingleton<TableServiceClient>(serviceClient);
        serviceCollection.AddSingleton<ITableStorageRepository, TableStorageRepository>();
    }
    public static void AddCache(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        MemoryCache memoryCache = new MemoryCache(new MemoryCacheOptions { });
        serviceCollection.AddSingleton<IMemoryCache>(memoryCache);
    }
}