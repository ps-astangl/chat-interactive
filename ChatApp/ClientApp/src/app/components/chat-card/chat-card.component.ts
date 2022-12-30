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

    constructor(private chatService: ChatService) {
    }

    ngOnInit(): void {
        this.chatService.connect();
        this.poll();
    }

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    ngOnDestroy(): void {
        this.chatService.disconnect();
    }

    poll(): void {
        this.chatService.getMessage((message: Message) => {
            this.messages.push(message);
        });
    }

    send(): void {
        let message = this.createMessage(this.author, this.messageInput);

        this.messages.push(message)

        this.chatService.getConnection().send('ReceiveMessage', message).then(() => {
        });

        this.messageInput = '';

        this.scrollToBottom();
    }

    createMessage(sender: string, text: string): Message {
        return {sender: sender, text: text};
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) {
        }
    }
}