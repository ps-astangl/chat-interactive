using Azure.Storage;
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
        var client = GetServiceClient(configuration);
        serviceCollection.AddSingleton(client);
    }
    private static QueueServiceClient GetServiceClient(IConfiguration configuration)
    {
        string accountName = configuration["StorageAccountName"];
        string accountKey = configuration["StorageAccountKey"];
        Uri serviceUri = new Uri(configuration["StorageAccountQueueUri"]);

        // Create a SharedKeyCredential that we can use to authenticate
        StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

        // Create a client that can authenticate with a connection string
        return new QueueServiceClient(serviceUri, credential);
    }
}