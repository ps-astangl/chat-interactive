using System.Runtime.Serialization;

namespace ChatApp.Services
{
    /// <summary>
    /// Exception thrown when a user tries to join a chat room that does not exist.
    /// </summary>
    public class ChatHubServiceException : Exception
    {
        public ChatHubServiceException(string message) : base(message)
        {
        }

        public ChatHubServiceException(string message, Exception innerException) : base(message, innerException)
        {
        }

        protected ChatHubServiceException(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }
    }
}