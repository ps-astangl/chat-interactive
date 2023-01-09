using System.Collections.Concurrent;
using Azure;
using Azure.Data.Tables;
using ChatApp.Models;

namespace ChatApp.Repository;

public interface ITableStorageRepository
{
    Task AddMessageToChannel(Message message);
    Task<Message> GetMessageById(string messageId, string commendId);
    List<Message> GetMessagesForChannel(string channelName);
}

public class TableStorageRepository : ITableStorageRepository
{
    private readonly ILogger<TableStorageRepository> _logger;
    private readonly TableServiceClient _tableServiceClient;

    public TableStorageRepository(ILogger<TableStorageRepository> logger, TableServiceClient tableServiceClient)
    {
        _logger = logger;
        _tableServiceClient = tableServiceClient;
    }

    /// <inheritdoc />
    public async Task AddMessageToChannel(Message message)
    {
        TableClient tableClient = GetTableClient();
        await tableClient.CreateIfNotExistsAsync();
        _logger.LogInformation(":: Setting message to table");
        await tableClient.UpsertEntityAsync<StorageMessage>(message.ToStorageMessage());
    }


    public Task<Message> GetMessageById(string channelName, string commentId)
    {
        TableClient tableClient = GetTableClient();
        return tableClient.GetEntityAsync<StorageMessage>(channelName, commentId)
            .ContinueWith(x =>
            {
                var valueResult = x.Result.Value;
                return new Message
                {
                    Sender = valueResult.Sender,
                    Text = valueResult.Text,
                    ConnectionId = valueResult.ConnectionId,
                    Topic = valueResult.Topic,
                    Channel = valueResult.Channel,
                    CommentId = valueResult.CommentId,
                    IsBot = valueResult.IsBot,
                    IsThinking = valueResult.IsThinking
                };
            });
    }


    public List<Message> GetMessagesForChannel(string channelName)
    {
        TableClient tableClient = GetTableClient();
        var result = tableClient.Query<StorageMessage>(filter: x => x.Channel == channelName, maxPerPage: 10);

        return result
            .OrderBy(x => x.Timestamp)
            .Select(x => new Message
            {
                Sender = x.Sender,
                Text = x.Text,
                ConnectionId = x.ConnectionId,
                Topic = x.Topic,
                Channel = x.Channel,
                CommentId = x.CommentId,
                IsBot = x.IsBot
            }).ToList();
    }

    private TableClient GetTableClient(string tableName = "messages") => _tableServiceClient.GetTableClient(tableName);
}