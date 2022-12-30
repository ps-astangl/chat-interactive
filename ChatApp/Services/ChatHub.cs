using Azure.Storage.Queues;
using ChatApp.Controllers;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services
{
    public interface IChatHub
    {
        Task ReceiveMessage(Message message);
        Task SendMessage(Message message);
    }

    public class ChatHub : Hub<IChatHub>
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly QueueServiceClient _queueServiceClient;

        /// <inheritdoc />
        public ChatHub(ILogger<ChatHub> logger, QueueServiceClient queueServiceClient)
        {
            _logger = logger;
            _queueServiceClient = queueServiceClient;
        }

        public async Task SendMessage(Message message) => await Clients.All.SendMessage(message);

        public async Task ReceiveMessage(Message message)
        {
            _logger.LogInformation("Received message from client");
            var client = _queueServiceClient.GetQueueClient("input");
            Message outMessage = new Message
            {
                sender = message.sender,
                text = message.text
            };
            await client.SendMessageAsync(new BinaryData(outMessage));
        }
    }
}