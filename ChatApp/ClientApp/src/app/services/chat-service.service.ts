import {Injectable} from '@angular/core';
import {map, Observable, of, switchMap} from "rxjs";
import {Message} from "../interfaces/message";
import {HttpClient, HttpResponse} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class ChatService {
    constructor(private http: HttpClient) {
    }

    private messages: Message[] = [];
    private id : string|null = null;

    getMessages(): Observable<Message[]> {
        return of(this.messages);
    }

    sendMessage(text: string): void {
        this.messages.push({sender: 'You', text: text});

        this.http.get(`/Chat?message=${text}`).subscribe((response: any) => {
            response.id = this.id;
        });

        while (this.id !== null) {
            this.http.get(`/Chat/HasResponse?id=${this.id}`).subscribe((response: any) => {
                this.messages.push({sender: 'Bot', text: response.message});
                this.id = null;
            });
            setTimeout( () => { /*Your Code*/ }, 1000 );
        }
      }

    pollForMessages(jobId: string) {
        return this.http.get(`/Chat/HasResponse?jobId=${jobId}`);
    }
}