import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {ChatService} from "../../services/chat-service.service";
import {Message} from "../../interfaces/message";

@Component({
  selector: 'chat-conversation-card',
  templateUrl: './chat-conversation-card.component.html'
})
export class ChatConversationCardComponent implements OnInit, AfterViewInit, AfterContentInit  {
  ngAfterContentInit(): void {
    if (!this.message.isBot) {
      this.message.isThinking = false;
      this.avatar = `/assets/Me.png`;
    }
  }

  @Input() message: Message;
  @Input() isThinking: boolean = false;

  avatar: string;

  public now: Date = new Date();
  constructor() {
    this.getCurrentTime();
  }

  getCurrentTime(): void {
    this.now = new Date();
  }

  ngOnInit(): void {
    this.avatar = `/assets/${this.message.sender}.png`;
  }

  ngAfterViewInit() {
    this.setPollingTimeout();
  }

  setPollingTimeout(): void {
    setTimeout(() => {
      if (this.message.isBot && this.message.isThinking) {
        this.message.isThinking = false;
        this.message.text = 'Sorry, I fucked up. I Might be drunk.';
      }
    }, 1000 * 60);
  }
}