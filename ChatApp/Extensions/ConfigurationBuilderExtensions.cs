using Azure.Storage.Queues;

namespace ChatApp.Extensions;

/// <summary>
/// Extension methods for building configuration
/// </summary>
public static class ConfigurationBuilderExtensions
{
    /// <summary>
    /// Builds the configuration for the service
    /// </summary>
    /// <param name="config"></param>
    /// <param name="environment"></param>
    public static void BuildConfiguration(this IConfigurationBuilder config, IWebHostEnvironment environment)
    {
        config.SetBasePath(environment.ContentRootPath)
            .AddEnvironmentVariables();
    }

    public static void AddQueueClient(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("AzureStorage");
        QueueServiceClient queueClient = new QueueServiceClient(connectionString);
        serviceCollection.AddSingleton(queueClient);
    }
}