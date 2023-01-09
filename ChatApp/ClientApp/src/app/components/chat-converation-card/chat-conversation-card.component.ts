import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Message} from "../../interfaces/message";
import {ChatService} from "../../services/chat-service.service";

@Component({
    selector: 'chat-conversation-card',
    templateUrl: './chat-conversation-card.component.html'
})
export class ChatConversationCardComponent implements OnInit, AfterViewInit, AfterContentInit {

    ngAfterContentInit(): void {
        if (!this.message.isBot) {
            this.message.isThinking = false;
            this.avatar = `/assets/Me.png`;
        }
    }

    @Input() message: Message;
    @Input() isThinking: boolean = false;
    @Input() isImage: boolean = false;

    votes: number = 0;
    public hasVoted: boolean = false;

    avatar: string;
    public now: Date = new Date();

    constructor(private chatService: ChatService) {
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
                this.message.text = 'Sorry, I timed out. Something must be wrong...(unless you wanted me to make an image)';
            }
        }, 1000 * 60 * 5);
    }

    setPollingTimeoutRefresh(): void {
        setTimeout(() => {
            if (this.message.isBot && this.message.isThinking) {
                this.message.isThinking = false;
                this.message.text = 'Sorry, I timed out. Something must be wrong...(unless you wanted me to make an image)';
            }
        }, 1000 * 60 * 5);
    }

    downVote() {
        this.votes--;
        this.hasVoted = true;
    }

    upVote() {
        this.votes++;
        this.hasVoted = true;
    }

    deleteMessage() {
        return true;
    }
}