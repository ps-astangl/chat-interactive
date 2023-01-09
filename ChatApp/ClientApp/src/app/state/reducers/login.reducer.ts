import {createReducer, on} from '@ngrx/store';
import {LoginRequest} from "../../interfaces/login-request";
import {LoginAuthService, LogInRequestActions} from "../actions/login.action";


export const initialState: ReadonlyArray<LoginRequest> = [];

export const loginRequestReducer = createReducer(
    initialState,
    on(LoginAuthService.listlogin, (_state, {loginRequests}) => loginRequests),
    on(LoginAuthService.findlogin, (state, {loginRequest}) => {
        if (state.find((login) => login.username === loginRequest.username && login.channel === loginRequest.channel)) {
            return state;
        } else {
            return [...state, loginRequest ]
        }
    }),
);