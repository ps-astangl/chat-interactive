import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TitleBarComponent} from './components/title-bar/title-bar.component';
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {ChatCardComponent} from './components/chat-card/chat-card.component';
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatLineModule, MatOptionModule} from "@angular/material/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";
import {ChatService} from "./services/chat-service.service";
import {MarkedPipe} from './pipes/marked-pipe.pipe';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSelectModule} from "@angular/material/select";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatExpansionModule} from "@angular/material/expansion";
import {ChatConversationCardComponent} from "./components/chat-converation-card/chat-conversation-card.component";
import {MatTableModule} from "@angular/material/table";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ConnectionIndicatorComponent} from './components/connection-indicator/connection-indicator.component';
import {MatTreeModule} from "@angular/material/tree";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {CdkAccordionModule} from "@angular/cdk/accordion";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {NotFoundComponent} from './components/not-found/not-found.component';
import {LoginComponent} from './components/login/login.component';
import {StoreModule} from '@ngrx/store';
import {loginRequestReducer} from "./state/reducers/login.reducer";
import {collectionReducer} from "./state/reducers/collection.reducer"
import {SafePipe} from "./pipes/safe-pipe";
import {MatMenuModule} from "@angular/material/menu";
import {MatTooltipModule} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    AppComponent,
    TitleBarComponent,
    ChatCardComponent,
    MarkedPipe,
      SafePipe,
      ChatConversationCardComponent,
      ConnectionIndicatorComponent,
      NotFoundComponent,
      LoginComponent
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
        MatButtonToggleModule,
        MatOptionModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatTableModule,
        MatSidenavModule,
        MatTreeModule,
        CdkVirtualScrollViewport,
        CdkAccordionModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        StoreModule.forRoot({login: loginRequestReducer, collection: collectionReducer}),
        MatMenuModule,
        MatTooltipModule
    ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }