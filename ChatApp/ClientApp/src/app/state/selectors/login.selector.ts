import { createSelector, createFeatureSelector } from '@ngrx/store';
import {LoginRequest} from "../../interfaces/login-request";

export const selectCollectionState = createFeatureSelector<ReadonlyArray<LoginRequest>>('collection');
export const selectLoginState = createSelector(
    selectCollectionState,
    (collection) => {
        if (collection.length > 0) {
            return [collection[collection.length - 1]];
        }
        else {

        }
        return [];
    }
);