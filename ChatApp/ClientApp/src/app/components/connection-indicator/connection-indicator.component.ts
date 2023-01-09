import {AfterViewChecked, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {selectLoginState} from "../../state/selectors/login.selector";

@Component({
    selector: 'app-connection-indicator',
    templateUrl: './connection-indicator.component.html'
})
export class ConnectionIndicatorComponent {


    constructor( private store: Store) {
        this.store.select(selectLoginState).pipe().subscribe((value) => {
            if (value.length > 0) {
                let lastValue = value[0];
                this.user = lastValue.username;
                this.channel = lastValue.channel;
            }
        });
    }

    @Input() connectionState: string;
    @Input() author: string;
    @Input() topic: string;
    user: string;
    channel: string;
}