using Azure.Storage.Queues;
using ChatApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Controllers;

[ApiController]
[Route("[controller]")]
public class ChatController : ControllerBase
{
    private readonly ILogger<ChatController> _logger;
    private readonly IHubContext<ChatHub> _hubContext;
    private QueueServiceClient _queueServiceClient;
    public ChatController(ILogger<ChatController> logger, QueueServiceClient queueServiceClient, IHubContext<ChatHub> hubContext)
    {
        _logger = logger;
        _queueServiceClient = queueServiceClient;
        _hubContext = hubContext;
    }
}