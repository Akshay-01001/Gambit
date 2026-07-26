import { configureStore } from '@reduxjs/toolkit'
import chessReducer from '../features/chess.slice'
import userReducer from '../features/user.slice'
import onboardingReducer from '../features/onboarding.slice'

export const store = configureStore({
    reducer: {
        chess: chessReducer,
        user: userReducer,
        onboarding: onboardingReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
