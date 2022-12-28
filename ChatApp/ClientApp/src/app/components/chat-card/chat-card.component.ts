import {Component, OnInit} from '@angular/core';
import {Message} from "../../interfaces/message";
import {ChatService} from "../../services/chat-service.service";

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html'
})
export class ChatCardComponent implements OnInit {

  messages: Message[] = [];
  messageInput: string = ''

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getMessages()
      .subscribe((x) => {
      console.log(x);
      this.messages = x;
    });
  }

  sendMessage() {
    this.chatService.sendMessage(this.messageInput);
    this.messageInput = '';
  }

  Clear() {
    this.messages = [];
  }
}