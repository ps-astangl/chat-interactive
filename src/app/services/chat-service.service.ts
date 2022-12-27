import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {Message} from "../interfaces/message";

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  private messages: Message[] = [
  ];

  getMessages(): Observable<Message[]> {
    return of(this.messages);
  }

  sendMessage(text: string): void {
    this.messages.push({sender: 'You', text: text});
    let response = this.getResponse(text);
    this.messages.push(response);
  }

  getResponse(text: string): Message {
    return {sender: 'InContext Bot GPT2', text: "404 Bad API. An internal server error has occurred or something. See the dumping ground called App Insights for more details."};
  }
}
