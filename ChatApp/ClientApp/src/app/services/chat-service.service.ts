import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr'; // import signalR

import {Subject} from 'rxjs';
import {Message} from "../interfaces/message";


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private message$: Subject<Message>;
    public connection: signalR.HubConnection;
    constructor() {
        this.message$ = new Subject<Message>();
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('/hub')
            .build();
        this.connect();
    }

    public connect(): void {
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            this.connection.start()
                .catch(err => console.log(err));
        }
    }
    public disconnect(): void {
        this.connection.stop();
    }

    public getMessage(next) {
        this.connection.on('SendMessage', (message: Message) => {
            next(message);
        });
    }

    public getConnection(): signalR.HubConnection  {
        return this.connection;
    }
}
