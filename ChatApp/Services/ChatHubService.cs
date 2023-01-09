using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using ChatApp.Models;
using ChatApp.Repository;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace ChatApp.Services
{
    public interface IChatHubService
    {
        public Task SendMessageToQueue(Message message);
    }

    public class ChatHubService : IChatHubService
    {
        private readonly ILogger<ChatHubService> _logger;

        private readonly QueueServiceClient _queueServiceClient;
        private static string ChatInputQueueName => "chat-input";
        public static string ChatOutputQueueName => "chat-output";

        public ChatHubService(ILogger<ChatHubService> logger, QueueServiceClient queueServiceClient)
        {
            _logger = logger;
            _queueServiceClient = queueServiceClient;
        }

        public async Task SendMessageToQueue(Message message)
        {
            _logger.LogInformation(":: Sending Message To Queue");
            var client = _queueServiceClient.GetQueueClient(ChatInputQueueName);
            await client.CreateIfNotExistsAsync();
            message.ConnectionId = ChatOutputQueueName;
            var json = JsonConvert.SerializeObject(message);
            await client.SendMessageAsync(new BinaryData(json));
        }
    }
}