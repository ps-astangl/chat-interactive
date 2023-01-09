import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr'; // import signalR

import {delay, Subject} from 'rxjs';
import {Message} from "../interfaces/message";


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private message$: Subject<Message>;
    public connection: signalR.HubConnection;
    public connectionId: string;

    constructor() {
        this.message$ = new Subject<Message>();
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('/hub')
            .build();
    }

    public connect(): Promise<void> {
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            return this.connection.start()
                .then(() => {
                    this.connectionId = this.connection.connectionId
                })
                .catch(err => console.log(err))
                .finally(() => {
                    this.connectionId = this.connection.connectionId
                });
        }
        return Promise.resolve();
    }

    public disconnect(): Promise<void> {
        this.connectionId = null;
        return this.connection
            .stop()
            .then(() => {
                this.connectionId = null;
            })
            .catch(err => console.log(err))
            .finally(() => {
                this.connectionId = null;
            });
    }

    public getMessage(next): void {
        this.connection.on('SendMessage', (message: Message) => {
            next(message);
        });
    }
    
    public getMessages(next): void {
        this.connection.on('SendMessages',  (messages: Message[]) => {
            next(messages);
        });
    }

    public getCurrentConnectionId(): string | null {
        return this.connectionId;
    }

    public getConnection(): signalR.HubConnection {
        return this.connection;
    }

    public getConnectionState(): signalR.HubConnectionState {
        return this.connection.state;
    }
}