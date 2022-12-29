import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Message} from "../../interfaces/message";
import {ChatService} from "../../services/chat-service.service";

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html'
})
export class ChatCardComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  private author: string = 'Me';
  messages: Message[] = [];
  messageInput: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.connect();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

  send(): void {
      this.messages.push({ sender: this.author, text: this.messageInput })
      this.messageInput = '';
      this.scrollToBottom();
      this.chatService.getMessage((message: Message) => {
          this.messages.push(message);
      });
    }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
