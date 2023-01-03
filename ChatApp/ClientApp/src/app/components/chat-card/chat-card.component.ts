import {
    AfterContentInit,
    AfterViewChecked,
    AfterViewInit,
    Component,
    OnChanges,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Message} from "../../interfaces/message";
import {ChatService} from "../../services/chat-service.service";
import * as signalR from "@microsoft/signalr";
import {MatSelectChange} from "@angular/material/select";
import {BotConfiguration} from "../../interfaces/bot-configuration";
import {FormControl, Validators} from "@angular/forms";


@Component({
    selector: "app-chat-card",
    templateUrl: "./chat-card.component.html"
})
export class ChatCardComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
    messageInput: string;
    connectionId: string;
    messages: Message[] = [];
    connectionState: signalR.HubConnectionState;
    author: string;
    topic: string;
    user: string = 'Anonymous';
    askBot: boolean = true;
    userFormControl = new FormControl('', [Validators.required, Validators.minLength(1)])
    bots: BotConfiguration[] = [
        {botName: 'PabloBot', 'topic': 'Wholesome'},
        {botName: 'Laura', topic: 'Candles'},
        {botName: 'Kimmie', topic: 'OnlyFans'},
        {botName: 'Spez', topic: 'Programming'},
        {botName: 'SportsFan', topic: 'The Mets'},
        {botName: 'PoetBot', topic: 'Cats And Dogs'},
        {botName: 'Yuli', topic: 'Technology'},
        {botName: 'Nick', topic: 'The Netherlands'},
        {botName: 'CoopBot', 'topic': 'AskCoopAnything'},
        {botName: 'Susan', 'topic': 'FlightAttendant'},
    ];
    panelOpenState: boolean = false;

    constructor(private chatService: ChatService) {
        let bot = this.bots[Math.floor(Math.random() * this.bots.length)];
        this.author = bot.botName;
        this.topic = bot.topic;
    }

    ngOnInit(): void {
        this.connectionState = this.chatService.getConnectionState();
        this.panelOpenState = true;
        this.monitorConnectionState();
    }

    ngAfterViewInit() {
    }

    ngAfterContentInit() {
    }

    ngOnDestroy(): void {
        this.disconnect();
    }

    connect(): void {
        this.chatService.connect().then(() => {
            this.connectionId = this.chatService.getCurrentConnectionId();
            this.connectionState = this.chatService.getConnectionState();
            let message = this.createEmptyMessage(this.user, '_has joined chat_', this.topic);
            this.chatService.getConnection()
                .send('Connect', message)
                .then(() => {
                    this.panelOpenState = false;
                });
        });
    }

    disconnect(): void {
        let message = this.createEmptyMessage(this.user, '_has left chat_', this.topic);
        this.chatService.getConnection()
            .send('Disconnect', message)
            .then(() => {
                this.chatService.disconnect().then(() => {
                    this.connectionState = this.chatService.getConnectionState();
                    this.connectionId = null;
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {});});
    }

    pushCardToStack(message: Message): void {
        this.messages.push(message);
        return;
    }

    updateCardResponse(message: Message): void {
        this.messages.find(x => x.commentId === message.commentId).text = message.text;
        this.messages.find(x => x.commentId === message.commentId).isThinking = false;
        return;
    }

    getRandomId(): number {
        return Math.floor(Math.random() * 1000000000);
    }

    send(): void {
        // Set your last message
        let thisUser = this.user;
        let thisTopic = this.topic;
        let userMessage = this.createMessage(this.messageInput, this.getRandomId(), thisUser, thisTopic, true, false);
        this.chatService.getConnection().send('ReceiveMessage', userMessage).then(() => {});
        this.pushCardToStack(userMessage);

        if (this.askBot) {
            if (userMessage.text.trim().startsWith('@')) {
                let taggedName = userMessage.text.trim().split(' ')[0].replace('@', '');
                let foundBot = this.bots.find(x => x.botName === taggedName)?.botName;
                if (foundBot) {
                    this.setBotFromString(foundBot);
                }
            }
            let botAuthor = this.author;
            let message = this.createMessage(userMessage.text, this.getRandomId(), botAuthor, thisTopic, true, true);

            this.chatService.getConnection().send('ReceiveMessage', message).then(() => {});
            this.pushCardToStack(message);
        }

        this.messageInput = '';
    }

    createMessage(text: string, commentId: number, user: string, topic, isThinking: boolean, isBot: boolean): Message {
        return {
            sender: user,
            text: text,
            topic: topic,
            connectionId: this.connectionId,
            commentId: commentId,
            isThinking: isThinking,
            isBot: isBot
        };
    }

    createEmptyMessage(sender: string = '', text: string = '', topic: string = ''): Message {
        return {
            sender: sender,
            text: text,
            topic: topic,
            connectionId: this.connectionId,
            commentId: this.getRandomId(),
            isThinking: false,
            isBot: false
        };
    }

    setBotFromString(botName: string) {
        this.author = botName;
        this.setTopicFromString(this.bots.find(bot => bot.botName === botName).topic);
    }

    setBot($event: MatSelectChange) {
        this.author = $event.value;
        this.setTopicFromString(this.bots.find(bot => bot.botName === $event.value).topic);
    }

    setTopicFromString(topic: string) {
        this.topic = topic;
    }

    setTopic($event: Event) {
        this.topic = $event.target['value'];
    }

    setUser($event: Event) {
        this.user = $event.target['value'];
        this.userFormControl.setValue(this.user);
    }

    checkUserForm(): boolean {
        return this.userFormControl.hasError('required');
    }

    monitorConnectionState(): void {
        setInterval(() => {
            this.connectionState = this.chatService.getConnectionState();
            this.chatService.getMessage((message: Message) => {
                message.text = message.text.replace(/\\n/g, '\n');
                // sets the isThinking flag to false and pops the thinking bullshit message
                if (this.messages.find(x => x.commentId === message.commentId)) {
                    // TODO: Emit an update event to the card
                    this.updateCardResponse(message);
                } else {
                    this.pushCardToStack(message);
                }
            });
        }, 1000);
    }

    setAskBot($event: MatSelectChange) {
        this.askBot = $event.value;
    }
}