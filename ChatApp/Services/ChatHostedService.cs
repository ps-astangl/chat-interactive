using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using ChatApp.Models;
using ChatApp.Repository;
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
        private readonly ITableStorageRepository _tableStorageRepository;

        /// <inheritdoc />
        public ChatHostedService(ILogger<ChatHostedService> logger, IHubContext<ChatHub> hubContext, QueueServiceClient queueServiceClient, ITableStorageRepository tableStorageRepository)
        {
            _hubContext = hubContext;
            _queueServiceClient = queueServiceClient;
            _tableStorageRepository = tableStorageRepository;
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
                    var json = message.MessageText;
                    var response = JsonConvert.DeserializeObject<Message>(json);
                    _logger.LogInformation(":: Received message from queue for {Bot} and Id {Id}", response.Sender, response.CommentId);
                    await queueClient.DeleteMessageAsync(message.MessageId, message.PopReceipt, stoppingToken);

                    // Update
                    await _tableStorageRepository.AddMessageToChannel(response.ToStorageMessage());
                    
                    _logger.LogInformation(JsonConvert.SerializeObject(response));

                    _logger.LogInformation(":: Sending Message To Client on Channel: {response.Channel} for Id: {Id}", response.Channel, response.CommentId);
                    await _hubContext.Clients.Group(response.Channel).SendAsync("SendMessage", response, cancellationToken: stoppingToken);
                }

                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}