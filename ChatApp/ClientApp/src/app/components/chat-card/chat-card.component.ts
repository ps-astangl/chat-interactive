import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Message} from "../../interfaces/message";
import {ChatService} from "../../services/chat-service.service";

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html'
})
export class ChatCardComponent implements OnInit,AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  messages: Message[] = [];
  messageInput: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getMessages()
      .subscribe((x) => {
      this.messages = x;
    });
    this.scrollToBottom();
  }

  sendMessage() {
    this.chatService.sendMessage(this.messageInput);
    this.messageInput = '';
    this.scrollToBottom();
  }

  Clear() {
    this.messages = [];
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}