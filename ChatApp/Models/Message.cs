namespace ChatApp.Models
{
    public class Message: IMessage
    {
        public string Sender { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public int CommentId { get; set; }
        public bool IsBot { get; set; }
        public int ParentId { get; set; } = 0;
        public string ParentAuthor { get; set; } = string.Empty;
        public string ParentText { get; set; } = string.Empty;
    }

    public interface IMessage {
        public string Sender { get; set; }
        public string Text { get; set; }
        public string  ConnectionId  { get; set; }
        public string Topic  { get; set; }
        public int CommentId { get; set; }
        public bool IsBot { get; set; }
        public int ParentId { get; set; }
        public string ParentAuthor { get; set; }
        public string ParentText { get; set; }
    }
}