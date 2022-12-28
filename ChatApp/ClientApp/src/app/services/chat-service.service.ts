import {Injectable, OnInit} from '@angular/core';
import * as signalR from '@microsoft/signalr';          // import signalR
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {Message} from "../interfaces/message";

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    private connection: any = new signalR.HubConnectionBuilder().withUrl("/hub")   // mapping to the chathub as in startup.cs
        .configureLogging(signalR.LogLevel.Information)
        .build();

    readonly POST_URL = "/chat/send"

    private receivedMessageObject: Message = {} as Message;
    private sharedObj = new Subject<Message>();

    constructor(private http: HttpClient) {
        this.connection.onclose(async () => {
            await this.start();
        });
        this.connection.on("ReceiveOne", (user, message) => {
            this.mapReceivedMessage(user, message);
        });
        this.start();
    }

    public async start() {
        try {
            await this.connection.start();
            console.log("connected");
        } catch (err) {
            console.log(err);
            setTimeout(() => this.start(), 5000);
        }
    }

    private mapReceivedMessage(user: string, message: string): void {
        this.receivedMessageObject.sender = user;
        this.receivedMessageObject.text = message;
        this.sharedObj.next(this.receivedMessageObject);
    }

    /* ****************************** Public Mehods **************************************** */

    // Calls the controller method
    public broadcastMessage(msgDto: Message) {
        this.http.post(this.POST_URL, msgDto)
            .subscribe(data => {
                console.log(msgDto);
                console.log("I am here!");
                console.log(data);
            });
        // This can invoke the server method named as "SendMethod1" directly.

    }
    public invokeServerMethod(msgDto: Message): void {
        return this.connection.invoke("SendMessage1", msgDto.sender, msgDto.text)
            .catch(err => console.error(err));
    }

    public retrieveMappedObject(): Observable<Message> {
        return this.sharedObj.asObservable();
    }
}