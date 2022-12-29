using Azure.Storage.Queues;
using ChatApp.Controllers;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services
{
    public class ChatHubService : IHostedService
    {
        Timer? _timer;
        private readonly ILogger<ChatHubService> _logger;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly QueueServiceClient _queueServiceClient;

        public ChatHubService(ILogger<ChatHubService> logger, IHubContext<ChatHub> hubContext, QueueServiceClient queueServiceClient)
        {
            _logger = logger;
            _hubContext = hubContext;
            _queueServiceClient = queueServiceClient;
        }

        /// <inheritdoc />
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            return Task.CompletedTask;
        }

        private void DoWork(object? state)
        {
            var client = _queueServiceClient.GetQueueClient("output");
            var message = client.ReceiveMessage();
            if (message == null)
                return;

            var text = message.Value.MessageText;
            if (!string.IsNullOrEmpty(text))
            {
                _hubContext.Clients.All.SendAsync("SendMessage",
                    new Message
                    {
                        sender = "Bot",
                        text = text
                    });
            }
        }

        /// <inheritdoc />
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }
    }
}