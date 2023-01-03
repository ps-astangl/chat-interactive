using System.Runtime.Serialization;
using ChatApp.Controllers;
using ChatApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services
{
    public interface IChatHub
    {
        Task ReceiveMessage(Message message);
        Task SendMessage(Message message);
        Task Connect(Message message);
        Task Disconnect(Message message);
        Task CheckQueue(Message message);
    }

    public class ChatHub : Hub<IChatHub>
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly IChatHubService _chatHubService;

        /// <inheritdoc />
        public ChatHub(ILogger<ChatHub> logger, IChatHubService chatHubService)
        {
            _logger = logger;
            _chatHubService = chatHubService;
        }

        public async Task SendMessage(Message message)
        {
            _logger.LogInformation($":: Sending message to client {message.ConnectionId}");
            await Clients.All.SendMessage(message);
        }

        public async Task CheckQueue(Message message)
        {
            _logger.LogInformation(":: Checking Queue For Response...");
            try
            {
                await _chatHubService.ReceiveMessageFromQueue(message.ConnectionId, 6 * 3);
            }
            catch (SerializationException serializationException)
            {
                _logger.LogError(":: SerializationException: " + serializationException.Message);
                message.Text = "Sorry, I am not able to understand your question. Please try again.";
                await Clients.All.SendMessage(message);
            }
        }

        public async Task ReceiveMessage(Message message)
        {
            _logger.LogInformation(":: Received message from client");

            Message queueMessage = new Message
            {
                Sender = message.Sender,
                Text = message.Text,
                Topic = message.Topic,
                CommentId = message.CommentId,
                ConnectionId = ChatHubService.ChatOutputQueueName,
                IsBot = message.IsBot
            };
            if (!queueMessage.IsBot)
            {
                await Clients.All.SendMessage(message);
                // await Clients.Client(message.ConnectionId).SendMessage(message);
                return;
            }

            // Send to queue
            await _chatHubService.SendMessageToQueue(queueMessage);

            // get message from queue and send to caller
            _logger.LogInformation(":: Waiting For 1 Minute");

            try
            {
                await _chatHubService.ReceiveMessageFromQueue(message.ConnectionId, 6 * 3);
            }
            catch (SerializationException serializationException)
            {
                _logger.LogError(":: SerializationException: " + serializationException.Message);
                queueMessage.Text = "Sorry, I am not able to understand your question. Please try again.";
                await Clients.All.SendMessage(queueMessage);
            }
        }

        public async Task Connect(Message message)
        {
            _logger.LogInformation(":: Connect From Client {Id}", message.ConnectionId);
            await Clients.All.SendMessage(message);
        }

        public async Task Disconnect(Message message)
        {
            _logger.LogInformation(":: Disconnect From Client {Id}", message.ConnectionId);
            await Clients.All.SendMessage(message);
        }
    }
}