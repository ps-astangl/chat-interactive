import { createActionGroup, props } from '@ngrx/store';
import {LoginRequest} from "../../interfaces/login-request";


export const LogInRequestActions = createActionGroup({
    source: 'LoginRequest',
    events: {
        'AddLogInRequest': props<{ username: string, channel: string }>(),
    }
});

export const LoginAuthService = createActionGroup({
    source: 'Login Auth Service',
    events: {
        'ListLogin': props<{ loginRequests: ReadonlyArray<LoginRequest> }>(),
        'FindLogIn': props<{ loginRequest: LoginRequest }>(),
    }
});