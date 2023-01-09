export interface Message {
  sender: string;
  text: string;
  prompt: string;
  channel: string;
  topic: string;
  connectionId: string;
  commentId: number;
  isThinking: boolean;
  isBot: boolean;
}