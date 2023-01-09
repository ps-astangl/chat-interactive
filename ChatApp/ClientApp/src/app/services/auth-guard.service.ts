import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {CanActivate, Router} from "@angular/router";
import {LoginRequest} from "../interfaces/login-request";
import {selectLoginState} from "../state/selectors/login.selector";


@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

    loginRequest: LoginRequest = {username: null, channel: null};
    isAuthenticated: boolean = false;

    constructor(public router: Router, private store: Store) {
    }

    canActivate(): boolean {
        let user = sessionStorage.getItem('username');
        let channel = sessionStorage.getItem('channel');
        if (user && channel) {
            return true;
        }
        this.store.select(selectLoginState).pipe().subscribe((value) => {
            if (value.length > 0) {
                let lastValue = value[0];
                sessionStorage.setItem("username", lastValue.username);
                sessionStorage.setItem("channel",  lastValue.channel);
                this.loginRequest.username = lastValue.username;
                this.loginRequest.channel =  lastValue.channel;
                this.isAuthenticated = true;
            }
        });
        if (!this.isAuthenticated) {
            this.router.navigate(['login']);
            return false;
        }
        else {
            return true;
        }
    }
}