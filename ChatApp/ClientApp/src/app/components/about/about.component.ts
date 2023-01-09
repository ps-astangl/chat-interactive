import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";



@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
    markdown: string;
    constructor(private httpClient:HttpClient) {
    }

    async ngOnInit() {
        this.markdown = await this.httpClient.get(`/assets/posts/about/about.md`,
            { responseType: 'text'}).toPromise();
    }
}