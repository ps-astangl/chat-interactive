using Azure;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using ChatApp.Controllers;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace ChatApp.Services
{
    public class ChatHubService : IHostedService
    {
        Timer? _timer;
        private readonly ILogger<ChatHubService> _logger;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly QueueServiceClient _queueServiceClient;

        public ChatHubService(ILogger<ChatHubService> logger, IHubContext<ChatHub> hubContext,
            QueueServiceClient queueServiceClient)
        {
            _logger = logger;
            _hubContext = hubContext;
            _queueServiceClient = queueServiceClient;
        }

        /// <inheritdoc />
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation(":: ChatHubService is starting");
            _timer = new Timer(MonitorMessages, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            return Task.CompletedTask;
        }

        private void MonitorMessages(object? state)
        {
            var client = _queueServiceClient.GetQueueClient("output");
            Response<QueueMessage> message = client.ReceiveMessage();

            if (message == null)
                return;

            var text = message?.Value?.MessageText;

            if (!string.IsNullOrEmpty(text))
            {
                var outMessage = JsonConvert.DeserializeObject<Message>(text);
                _hubContext.Clients.All.SendAsync("SendMessage", outMessage);
                client.DeleteMessage(message?.Value?.MessageId ?? "", message?.Value?.PopReceipt ?? "");
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