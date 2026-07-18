import { configureStore } from '@reduxjs/toolkit'
import chessReducer from '../features/chess.slice'
import userReducer from '../features/user.slice'

export const store = configureStore({
    reducer: {
        chess: chessReducer,
        user: userReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
