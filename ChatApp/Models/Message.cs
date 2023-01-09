using Azure;
using Azure.Data.Tables;

namespace ChatApp.Models
{
    public class StorageMessage : Message, ITableEntity
    {
        /// <inheritdoc />
        public string PartitionKey { get; set; } = string.Empty;

        /// <inheritdoc />
        public string RowKey { get; set; } = string.Empty; 

        /// <inheritdoc />
        public DateTimeOffset? Timestamp { get; set; }

        /// <inheritdoc />
        public ETag ETag { get; set; }
    }

    public class Message: IMessage
    {
        public string Sender { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public int CommentId { get; set; }
        public bool IsBot { get; set; }
        public bool IsThinking { get; set; }
        
        public StorageMessage ToStorageMessage()
        {
            return new StorageMessage
            {
                PartitionKey = Channel, // PartitionKey is the Channel
                RowKey = CommentId.ToString(), // Id for Partition
                Topic = Topic,
                CommentId = CommentId,
                Sender = Sender,
                Text = Text,
                Channel = Channel,
                ConnectionId = ConnectionId,
                IsBot = IsBot,
                IsThinking = IsThinking,
                Prompt = Prompt,
                Timestamp = DateTimeOffset.UtcNow
            };
        }
    }
    
    public interface IMessage {
        public string Sender { get; set; }
        public string Text { get; set; }
        public string Channel { get; set; }
        public string  ConnectionId  { get; set; }
        public string Topic  { get; set; }
        public int CommentId { get; set; }
        public bool IsBot { get; set; }
        public bool IsThinking { get; set; }
    }
}