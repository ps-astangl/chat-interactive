using System.Text.Json;
using Azure.Storage.Queues;
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
    public dynamic? Get([FromServices] QueueServiceClient queueServiceClient, [FromQuery] string? message)
    {
        // Create temp queue -- Guid for job. Put in message
        var jobId = Guid.NewGuid().ToString();
        // queueServiceClient.CreateQueue(jobId);

        // Let processing queue handle writing the response to the temp queue
        var prompt = new { text = message, jobId = jobId };

        // { "text": "Hello", "jobId": "1234", "sender": "ChatApp" }

        QueueClient queueClient = queueServiceClient.GetQueueClient("dump");

        queueClient.SendMessage(JsonSerializer.Serialize(prompt));

        var foo = new { id = jobId };

        return Ok(foo);
    }

    [HttpGet(("[action]"))]
    public dynamic? HasResponse([FromServices] QueueServiceClient queueClient, [FromQuery] string id, [FromQuery] bool shouldDelete = false)
    {
        return new { text = "Hello", sender = "ChatApp"};
        // var client = queueClient.GetQueueClient(id);
        // var response = client.ReceiveMessage();
        // // { "text": "Hello", "sender": "ChatApp" }
        // if (response.Value != null)
        // {
        //     queueClient.DeleteQueue(id);
        //     var result = JsonSerializer.Deserialize<dynamic>(response.Value.MessageText);
        //     return result;
        // }
        // if (shouldDelete)
        //     queueClient.DeleteQueue(id);
        // return null;
    }
}