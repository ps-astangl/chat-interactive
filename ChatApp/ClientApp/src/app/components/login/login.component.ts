import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {LoginRequest} from "../../interfaces/login-request";
import {Store} from '@ngrx/store';
import {LogInRequestActions} from "../../state/actions/login.action";
import {selectLoginState} from "../../state/selectors/login.selector";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    channels = [
        'CoopAndPabloPlayHouse',
        'AskCoopAnything',
        'CatsAndDogs',
        'Sports',
        'Technology',
        'TheNetherlands',
        'FlightAttendant',
        'Candles',
        'Programming',
        'Art'
    ];

    loginRequest: LoginRequest = { username: '', channel: '' };

    loginForm = new FormGroup({
        username: new FormControl('', [Validators.required]),
        channel: new FormControl('', [Validators.required])
    })

    constructor(private router: Router, private store: Store) {
        this.store.select(selectLoginState).pipe().subscribe((value) => {
            if (value.length > 0) {
                let lastValue = value[0];
                this.loginRequest.username = lastValue.username;
                this.loginRequest.channel =  lastValue.channel;
            }
        });
    }
    ngOnInit(): void {
        this.loginForm.controls.username.valueChanges.subscribe(value => {
            if (value) {
                this.loginRequest.username = value;
                this.store.dispatch(LogInRequestActions.addloginrequest({channel: this.loginRequest.channel, username: this.loginRequest.username}));
            }
        });

        this.loginForm.controls.channel.valueChanges.subscribe((value) => {
            if (value) {
                this.loginRequest.channel = value;
                this.store.dispatch(LogInRequestActions.addloginrequest({channel: this.loginRequest.channel, username: this.loginRequest.username}));
            }
        });
    }


    onSubmit(): void {
        if (this.loginForm.valid) {
            this.router.navigate([''])
        } else {
            return;
        }
    }
}
