import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr'; // import signalR

import {Subject} from 'rxjs';
import {Message} from "../interfaces/message";


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private message$: Subject<Message>;
    private connection: signalR.HubConnection;

    constructor() {
        this.message$ = new Subject<Message>();
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('/hub')
            .build();
        this.connect();
    }

    public connect() {
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            this.connection.start()
                .catch(err => console.log(err));
        }
    }
    public disconnect() {
        this.connection.stop();
    }

    public getMessage(next) {
        this.connection.on('SendMessage', (message: Message) => {
            next(message);
        });
    }
}
