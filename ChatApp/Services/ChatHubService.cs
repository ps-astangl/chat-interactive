using System.Runtime.Serialization;
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
        public Task ReceiveMessageFromQueue(string connectionId, int secondToWait);
        public Task TearDownResponseQueue(string connectionId);
        public Task CreateResponseQueue(string connectionId);
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

        public Task CreateResponseQueue(string connectionId)
        {
            try
            {
                return Task.CompletedTask;
            }
            catch(Exception exception)
            {
                _logger.LogError(exception, $"Error creating queue {ChatOutputQueueName}");
                return Task.CompletedTask;
            }
            
        }

        public Task TearDownResponseQueue(string connectionId)
        {
            try
            {
                return Task.CompletedTask;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, $"Error deleting queue {ChatOutputQueueName}");
                return Task.CompletedTask;
            }
        }

        public async Task SendMessageToQueue(Message message)
        {
            var client = _queueServiceClient.GetQueueClient(ChatInputQueueName);
            await client.CreateIfNotExistsAsync();
            message.ConnectionId = ChatOutputQueueName;
            var json = JsonConvert.SerializeObject(message);
            await client.SendMessageAsync(new BinaryData(json));
        }

        public async Task ReceiveMessageFromQueue(string connectionId, int secondToWait)
        {
            QueueClient client = _queueServiceClient.GetQueueClient(ChatOutputQueueName);
            int maxTries = 1000;
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
                await Task.Delay(1000 * 1);
                maxTries--;
            }
            throw new SerializationException("Woops, I Fucked up");
        }

        public static string GetQueueCode(string connectionId)
        {
            EnsureThat.EnsureArg.IsNotEmptyOrWhiteSpace(connectionId, nameof(connectionId));
            {
                using MD5 md5 = MD5.Create();
                byte[] hashBytes = md5.ComputeHash(Encoding.ASCII.GetBytes(connectionId));
                return Convert.ToHexString(hashBytes).ToLower();
            }
        }
    }
}