import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {ChatCardComponent, MarkedPipe} from './components/chat-card/chat-card.component';
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatLineModule} from "@angular/material/core";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";
import {ChatService} from "./services/chat-service.service";
import {MarkdownModule} from "ngx-markdown";

@NgModule({
  declarations: [
    AppComponent,
    TitleBarComponent,
    ChatCardComponent,
    MarkedPipe
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatListModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatInputModule,
        MatLineModule,
        FormsModule,
        MarkdownModule
    ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
