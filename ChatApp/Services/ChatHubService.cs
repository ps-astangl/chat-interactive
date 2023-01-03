using System.Security.Cryptography;
using System.Text;
using Azure;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using ChatApp.Controllers;
using ChatApp.Models;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace ChatApp.Services
{
    public interface IChatHubService
    {
        public Task SendMessageToQueue(Message message);
        public Task ReceiveMessageFromQueue();
    }

    public class ChatHubService : IChatHubService
    {
        private readonly ILogger<ChatHubService> _logger;
        private readonly QueueServiceClient _queueServiceClient;
        private readonly IHubContext<ChatHub> _hubContext;
        public static string ChatInputQueueName => "chat-input";
        public static string ChatOutputQueueName => "chat-output";

        public ChatHubService(ILogger<ChatHubService> logger, IConfiguration configuration, IHubContext<ChatHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
            var connectionString = configuration.GetConnectionString("AzureStorage");
            _queueServiceClient = new QueueServiceClient(connectionString);
        }

        public async Task SendMessageToQueue(Message message)
        {
            var client = _queueServiceClient.GetQueueClient(ChatInputQueueName);
            await client.CreateIfNotExistsAsync();
            message.ConnectionId = ChatOutputQueueName;
            var json = JsonConvert.SerializeObject(message);
            await client.SendMessageAsync(new BinaryData(json));
        }

        public async Task ReceiveMessageFromQueue()
        {
            QueueClient client = _queueServiceClient.GetQueueClient(ChatOutputQueueName);
            int maxTries = 1000;
            int timePerTry = 1000;

            while (maxTries != 0)
            {
                QueueMessage message = await client.ReceiveMessageAsync();

                if (message != null || message?.MessageText != null)
                {
                    _logger.LogInformation(":: Received message from queue");
                    var json = message.MessageText;
                    var response = JsonConvert.DeserializeObject<Message>(json);
                    await client.DeleteMessageAsync(message.MessageId, message.PopReceipt);
                    await _hubContext.Clients.All.SendAsync("SendMessage", response);
                    return;
                }
                await Task.Delay(timePerTry);
                maxTries--;
            }
            throw new ChatHubServiceException($"Timeout waiting for response from queue: Waiting {1000 * 1000} seconds");
        }
    }
}