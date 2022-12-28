using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers;

[ApiController]
[Route("[controller]")]
public class ChatController : ControllerBase
{

    private readonly ILogger<ChatController> _logger;

    public ChatController(ILogger<ChatController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public dynamic? Get()
    {
        var responses =  new dynamic[]
        {
            new { sender = "John", text = "Hello" },
            new { sender = "Jane", text = "Hi" },
            new { sender = "John", text = "How are you?" },
            new { sender = "Jane", text = "I'm fine, thanks" },
            new { sender = "John", text = "Good to hear" }
        };
        return responses.ElementAtOrDefault(Random.Shared.Next(responses.Length));
    }
}