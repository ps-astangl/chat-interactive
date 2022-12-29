using Azure.Storage.Queues;
using ChatApp.Controllers;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services
{
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;
        private QueueServiceClient _queueServiceClient;

        /// <inheritdoc />
        public ChatHub(ILogger<ChatHub> logger, QueueServiceClient queueServiceClient)
        {
            _logger = logger;
            _queueServiceClient = queueServiceClient;
        }

        public async Task SendMessage(Message message)
        {
            await Clients.All.SendAsync("getMessage", message);
        }
    }
}