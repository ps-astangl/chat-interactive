using Azure.Core;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services
{
    public class ChatHub : Hub
    {
        public Task SendMessage1(string user, string message)
        {
            return Clients.All.SendAsync("ReceiveOne", "Bot",  $"{user} said: {message}");
        }
    }
}