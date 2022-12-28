import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {Message} from "../interfaces/message";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  constructor(private http: HttpClient) {
  }

  private messages: Message[] = [
  ];

  getMessages(): Observable<Message[]> {
    return of(this.messages);
  }

  sendMessage(text: string): void {
    this.messages.push({sender: 'You', text: text});
    this.http.get(`/Chat`)
        .subscribe((response: Message) => {
            this.messages.push(response);
        });
        return;
  }
}