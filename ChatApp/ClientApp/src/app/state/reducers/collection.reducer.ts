import {createReducer, on} from "@ngrx/store";
import {LogInRequestActions} from "../actions/login.action";
import {LoginRequest} from "../../interfaces/login-request";

export const initialState: ReadonlyArray<{username:string, channel:string}> = [];

export const collectionReducer = createReducer(
    initialState,
    on(LogInRequestActions.addloginrequest, (state, {username, channel}) => {
        if (state.find((login) => login.username === username && login.channel === channel)) {
            return state;
        }
        else {
            return [...state, {username, channel}]
        }
    })
);