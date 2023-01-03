using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using ChatApp.Models;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace ChatApp.Services
{
    /// <summary>
    /// Background service for processing messages from the queue. Sends to client via SignalR when a message is received.
    /// </summary>
    public class ChatHostedService : BackgroundService
    {
        private readonly ILogger<ChatHostedService> _logger;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly QueueServiceClient _queueServiceClient;

        /// <inheritdoc />
        public ChatHostedService(ILogger<ChatHostedService> logger, IHubContext<ChatHub> hubContext, QueueServiceClient queueServiceClient)
        {
            _hubContext = hubContext;
            _queueServiceClient = queueServiceClient;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var queueClient = _queueServiceClient.GetQueueClient("chat-output");
            while (!stoppingToken.IsCancellationRequested)
            {
                QueueMessage message = await queueClient.ReceiveMessageAsync(cancellationToken: stoppingToken);

                if (message != null || message?.MessageText != null)
                {
                    _logger.LogInformation(":: Received message from queue");
                    var json = message.MessageText;
                    var response = JsonConvert.DeserializeObject<Message>(json);
                    await queueClient.DeleteMessageAsync(message.MessageId, message.PopReceipt, stoppingToken);
                    _logger.LogInformation(":: Sending Message To Client");
                    await _hubContext.Clients.All.SendAsync("SendMessage", response, cancellationToken: stoppingToken);
                }

                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}