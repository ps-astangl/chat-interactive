using Azure;
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
    private readonly QueueServiceClient _queueServiceClient;
    public ChatController(ILogger<ChatController> logger, QueueServiceClient queueServiceClient)
    {
        _logger = logger;
        _queueServiceClient = queueServiceClient;
    }

    [HttpGet]
    public ActionResult Get()
    {
        try
        {
            Response<QueueClient>? createResponse = _queueServiceClient.CreateQueue("test");
        
            if (createResponse.GetRawResponse().IsError)
                return Ok(createResponse.GetRawResponse());

            Response? deleteResponse = _queueServiceClient.DeleteQueue("test");

            if (deleteResponse.IsError)
                return Ok(deleteResponse);

            return Ok("Ok");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error");
            return Ok(new {error = e});
        }

    }
}