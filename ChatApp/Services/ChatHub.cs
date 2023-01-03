using ChatApp.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services
{
    public interface IChatHub
    {
        Task ReceiveMessage(Message message);
        Task SendMessage(Message message);
        Task Connect(Message message);
        Task Disconnect(Message message);
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

        /// <summary>
        /// Invoked by the client to send a message to the server. Or by the server to push a message to the client.
        /// </summary>
        /// <param name="message"></param>
        public async Task SendMessage(Message message)
        {
            _logger.LogInformation(":: Sending message to client {ClientId}", message.ConnectionId);
            await Clients.All.SendMessage(message);
        }

        /// <summary>
        /// Invoked by the client to send a message to the server.
        /// The server will then broadcast the message to all connected clients.
        /// </summary>
        /// <param name="message"></param>
        public async Task ReceiveMessage(Message message)
        {
            _logger.LogInformation(":: Received message from client");

            // Send message to all clients
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
                // Send message to all connected clients (multiple users)
                await Clients.All.SendMessage(message);
                // If we use this then the message will be sent to the client that sent it, not to all connected clients
                // await Clients.Client(message.ConnectionId).SendMessage(message);
                return;
            }
            await _chatHubService.SendMessageToQueue(queueMessage);
        }

        /// <summary>
        /// Invoked by the client on a method named "Connect" when the client is connected to the server.
        /// This method will broadcast a message to all connected clients.
        /// (Dictated by the front-end to state the user has entered)
        /// </summary>
        /// <param name="message"></param>
        public async Task Connect(Message message)
        {
            _logger.LogInformation(":: Connect From Client {Id}", message.ConnectionId);
            await Clients.All.SendMessage(message);
        }

        /// <summary>
        /// Invoked by the client on a method named "Disconnect" when the client is disconnected from the server.
        /// This method will broadcast a message to all connected clients to state the user has left.
        /// </summary>
        /// <remarks>This is simply for sending predefined messages</remarks>
        /// <param name="message"></param>
        public async Task Disconnect(Message message)
        {
            _logger.LogInformation(":: Disconnect From Client {Id}", message.ConnectionId);
            await Clients.All.SendMessage(message);
        }
    }
}