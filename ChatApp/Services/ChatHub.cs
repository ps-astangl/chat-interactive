using ChatApp.Models;
using ChatApp.Repository;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;

namespace ChatApp.Services
{
    public interface IChatHub
    {
        Task ReceiveMessage(Message message);
        Task SendMessages(Message[] messages);
        Task SendMessage(Message message);
        Task Connect(Message message);
        Task Disconnect(Message message);
    }

    public class ChatHub : Hub<IChatHub>
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly IChatHubService _chatHubService;
        private readonly ITableStorageRepository _tableStorageRepository;

        /// <inheritdoc />
        public ChatHub(ILogger<ChatHub> logger, IChatHubService chatHubService, ITableStorageRepository tableStorageRepository)
        {
            _logger = logger;
            _chatHubService = chatHubService;
            _tableStorageRepository = tableStorageRepository;
        }
        /// <summary>
        /// Invoked by the client to send a message to the server.
        /// The server will then broadcast the message to all connected clients.
        /// </summary>
        /// <param name="message"></param>
        public async Task ReceiveMessage(Message message)
        {
            _logger.LogInformation(":: Received message from client for Person {Person} on Channel {Channel}", message.Sender, message.Channel);

            if (message.IsBot)
            {
                message.ConnectionId = ChatHubService.ChatOutputQueueName;
                await _chatHubService.SendMessageToQueue(message);
            }
            await _tableStorageRepository.AddMessageToChannel(message.ToStorageMessage());
            await Clients.Group(message.Channel).SendMessage(message);
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
            await Groups.AddToGroupAsync(message.ConnectionId, message.Channel);

            var messages = _tableStorageRepository.GetMessagesForChannel(message.Channel);

            async void Action(Message x)
            {
                await Clients.Client(message.ConnectionId).SendMessage(x);
            }

            messages.ForEach(Action);
            
            await Clients.Group(message.Channel).SendMessage(message);
        }
        
        public async Task GetMessagesForChannel(string channel)
        {
            _logger.LogInformation(":: GetMessagesForChannel {Channel}", channel);
            var messages = _tableStorageRepository.GetMessagesForChannel(channel);
            await Clients.Group(channel).SendMessages(messages.ToArray());
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
            await Groups.RemoveFromGroupAsync(message.ConnectionId, message.Channel);
            await Clients.Group(message.Channel).SendMessage(message);
        }
    }
}