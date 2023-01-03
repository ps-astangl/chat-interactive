export interface Message {
  sender: string;
  text: string;
  connectionId: string;
  topic: string;
  commentId: number;
  isThinking: boolean;
  isBot: boolean;
}