import { combineReducers, configureStore, type PayloadAction } from '@reduxjs/toolkit'
import chessReducer from '../features/chess.slice'
import userReducer from '../features/user.slice'
import onboardingReducer from '../features/onboarding.slice'

export const appReducer = combineReducers({
    chess: chessReducer,
    user: userReducer,
    onboarding: onboardingReducer
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: PayloadAction) => {
    if (action.type === 'LOG_OUT') {
        state = undefined;
    }
    return appReducer(state, action);
}

export const store = configureStore({
    reducer: rootReducer
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
