import { configureStore } from '@reduxjs/toolkit'
import chessReducer from '../features/chess.slice'

export const store = configureStore({
    reducer: {
        chess: chessReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
