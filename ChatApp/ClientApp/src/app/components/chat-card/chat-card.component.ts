import {
    AfterContentInit,
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {Message} from "../../interfaces/message";
import {ChatService} from "../../services/chat-service.service";
import * as signalR from "@microsoft/signalr";
import {MatSelectChange} from "@angular/material/select";
import {BotConfiguration} from "../../interfaces/bot-configuration";
import {Store} from "@ngrx/store";
import {selectLoginState} from "../../state/selectors/login.selector";
import {LogInRequestActions} from "../../state/actions/login.action";
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
    selector: "app-chat-card",
    templateUrl: "./chat-card.component.html"
})
export class ChatCardComponent implements OnInit, AfterViewInit, AfterContentInit, AfterViewChecked, OnDestroy {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    messageInput: string;
    connectionId: string;
    messages: Message[] = [];
    topicForm = new FormGroup({
        topic: new FormControl('', [Validators.required]),
    })
    connectionState: signalR.HubConnectionState;
    author: string;
    topic: string;
    channel: string;
    user: string;
    askBot: boolean = true;
    bots: BotConfiguration[] = [
        {botName: 'PabloBot', 'topic': 'Software Development That My Mom Can Understand'},
        {botName: 'CoopBot', 'topic': 'Ask Coop Anything'},
        {botName: 'PoetBot', topic: 'Wholesome'},
        {botName: 'SportsFan', topic: 'The NBA'},
        {botName: 'Yuli', topic: 'What Is GTP2?'},
        {botName: 'Nick', topic: 'How to program a new app for a chatbot'},
        {botName: 'Susan', 'topic': 'Flight Attendant 101 - How to be a flight attendant'},
        {botName: 'Laura', topic: 'Candles Coupons For Sale'},
        {botName: 'Kimmie', topic: 'Birds Dont Exist: Checkmate'},
        {botName: 'Spez', topic: 'I am the greatest CEO of all time and I am here to answer your questions'},
        {botName: 'ImageBot', topic: 'I Dont Need A Topic: I make Images'},
    ];
    panelOpenState: boolean = false;

    constructor(private chatService: ChatService, private store: Store, public router: Router) {
        let bot = this.bots.find(x => x.botName === 'ImageBot') //[Math.floor(Math.random() * this.bots.length)];
        this.author = bot.botName;
        this.topic = bot.topic;
        this.store.select(selectLoginState).pipe().subscribe((value) => {
            if (value.length > 0) {
                let lastValue = value[0];
                this.user = lastValue.username;
                this.channel = lastValue.channel;
            }
        });
    }

    ngOnInit(): void {
        this.connectionState = this.chatService.getConnectionState();
        this.panelOpenState = true;
        this.topicForm.controls.topic.valueChanges.subscribe(value => {
            if (value) {
                this.topic = value;
            }
        });
        this.monitorConnectionState();
    }

    ngAfterViewInit() {
    }

    ngAfterContentInit() {
        this.scrollToBottom();
    }
    
    ngAfterViewChecked() {
        this.pollForMessages();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) {}
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
    
    pollForMessages(): void {
        setTimeout(() => {
            this.chatService.getMessage((message: Message) => {
                message.text = message.text.replace(/\\n/g, '\n');
                // sets the isThinking flag to false and pops the thinking bullshit message
                if (this.messages.find(x => x.commentId === message.commentId)) {
                    this.scrollToBottom();
                    this.updateCardResponse(message);
                } else {
                    this.scrollToBottom();
                    this.pushCardToStack(message);
                }
            });
        }, 5000);
        
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

            this.chatService.getConnection().send('GetMessagesForChannel', this.channel).then(() => {});
            this.chatService.getMessages((messages: Message[]) => {
                messages.forEach(message => {
                    message.text = message.text.replace(/\\n/g, '\n');
                    // sets the isThinking flag to false and pops the thinking bullshit message
                    if (this.messages.find(x => x.commentId === message.commentId)) {
                        this.updateCardResponse(message);
                    } else {
                        this.pushCardToStack(message);
                    }
                    this.scrollToBottom();
                });
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
                    .finally(() => {
                    });
            });
    }

    pushCardToStack(message: Message): void {
        this.messages.push(message);
        return;
    }

    updateCardResponse(message: Message): void {
        this.messages.find(x => x.commentId === message.commentId).text = message.text;
        this.messages.find(x => x.commentId === message.commentId).isThinking = message.isThinking;
        return;
    }

    getRandomId(): number {
        return Math.floor(Math.random() * 1000000000);
    }

    send(): void {
        // Set your last message
        let thisUser = this.user;
        let thisTopic = this.topic;

        let userMessage = this.createMessage(this.messageInput, this.getRandomId(), thisUser, thisTopic, "", false, false);
        this.chatService.getConnection().send('ReceiveMessage', userMessage).then(() => {});

        if (this.askBot) {
            if (userMessage.text.trim().startsWith('@')) {
                let taggedName = userMessage.text.trim().split(' ')[0].replace('@', '');
                let foundBot = this.bots.find(x => x.botName === taggedName)?.botName;
                if (foundBot) {
                    this.setBotFromString(foundBot);
                }
            }
            let botAuthor = this.author;
            let message = this.createMessage("", this.getRandomId(), botAuthor, thisTopic, userMessage.text,true, true);
            this.chatService.getConnection().send('ReceiveMessage', message).then(() => {});
        }
        this.messageInput = '';
    }

    createMessage(text: string, commentId: number, user: string, topic: string, prompt: string, isThinking: boolean, isBot: boolean): Message {
        return {
            sender: user,
            text: text,
            prompt: prompt,
            topic: topic,
            channel: this.channel,
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
            prompt: '',
            channel: this.channel,
            connectionId: this.connectionId,
            commentId: this.getRandomId(),
            isThinking: false,
            isBot: false
        };
    }

    setBotFromString(botName: string): void {
        this.author = botName;
    }

    setBot($event: MatSelectChange): void {
        this.author = $event.value;
    }

    setTopicFromString(topic: string): void {
        this.topic = topic;
    }

    setTopic($event: Event): void {
        this.topic = $event.target['value'];
    }

    monitorConnectionState(): void {
        setInterval(() => {
            this.connectionState = this.chatService.getConnectionState();
            this.chatService.getMessage((message: Message) => {
                message.text = message.text.replace(/\\n/g, '\n');
                // sets the isThinking flag to false and pops the thinking bullshit message
                if (this.messages.find(x => x.commentId === message.commentId)) {
                    this.updateCardResponse(message);
                } else {
                    this.pushCardToStack(message);
                }
            });
        }, 5000);
    }

    setAskBot($event: MatSelectChange): void {
        this.askBot = $event.value;
    }

    logout() {
        this.store.dispatch(LogInRequestActions.addloginrequest({channel: null, username: null}));
        this.router.navigate(['/login']).then();
    }

    clearChat() {
        this.messages = [];
    }

    refreshChat() {
        this.chatService.getConnection().send('GetMessagesForChannel', this.channel).then(() => {});
        this.scrollToBottom();
    }
}