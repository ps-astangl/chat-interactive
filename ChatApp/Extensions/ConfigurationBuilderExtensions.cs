using Azure.Storage.Queues;

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
        var connectionString = configuration.GetConnectionString("AzureStorage");
        QueueServiceClient queueClient = new QueueServiceClient(connectionString);
        serviceCollection.AddSingleton(queueClient);
    }
}