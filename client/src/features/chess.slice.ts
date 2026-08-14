import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Square } from 'chess.js';

export type GameStatus = "waiting" | "playing" | "check" | "checkmate" | "stalemate"
    | "draw" | "resigned" | "timeout" | "abandone" | null

export type GameResult = "1-0" | "0-1" | "1/2 - 1/2" | null

export interface ChessState {
    gameId: string | null
    fen: string
    turn: "b" | "w"
    selectedSquare: Square | null
    legalMoves: string[]
    lastMove: {
        from: Square,
        to: Square,
    } | null
    status: GameStatus
    winner: "b" | "w"
    result: GameResult
    players: {
        black: {
            username: string,
            userId: string,
            rating: string,
            country: string
        } | null,
        white: {
            username: string,
            userId: string,
            rating: string,
            country: string
        } | null,
        clock: {
            white: string,
            black: string
        },
        promotion: {
            open: boolean,
            from: Square | null,
            to: Square | null,
            color: "b" | "w" | null
        },
    }
    gameOverModalOpen: boolean
}

const initialState: ChessState = {
    gameId: null,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    turn: "w",
    selectedSquare: null,
    legalMoves: [],
    lastMove: null,
    status: null,
    winner: null,
    result: null,
    players: {
        black: null,
        white: null,
        clock: {
            white: "",
            black: ""
        },
        promotion: {
            open: false,
            from: null,
            to: null,
            color: null
        },
    },
    gameOverModalOpen: false
}

export const chessSlice = createSlice({
    name: 'chess',
    initialState,
    reducers: {
        setFen(state, action: PayloadAction<string>) {
            state.fen = action.payload;
        },
        setSelectedSquare(state, action: PayloadAction<Square>) {
            state.selectedSquare = action.payload;
        },
        clearSelectedSquare(state) {
            state.selectedSquare = null;
        },
        setLegalMoves(state, action: PayloadAction<string[]>) {
            state.legalMoves = action.payload;
        },
        setLastMove(state, action: PayloadAction<{ from: Square, to: Square }>) {
            state.lastMove = action.payload;
        },
        clearLastMove(state) {
            state.lastMove = null;
        },
        setStatus(state, action: PayloadAction<GameStatus>) {
            state.status = action.payload;
        },
        setWinner(state, action: PayloadAction<"b" | "w">) {
            state.winner = action.payload;
        },
        setResult(state, action: PayloadAction<GameResult>) {
            state.result = action.payload;
        },
        setGameOverModal(state, acion: PayloadAction<boolean>) {
            state.gameOverModalOpen = acion.payload;
        },
        setTurn(state, acion: PayloadAction<"b" | "w">) {
            state.turn = acion.payload;
        },
        setPromotion(state, action: PayloadAction<{ from: Square; to: Square; color: "b" | "w" }>) {
            state.players.promotion = {
                open: true,
                from: action.payload.from,
                to: action.payload.to,
                color: action.payload.color
            };
        },
        clearPromotion(state) {
            state.players.promotion = {
                open: false,
                from: null,
                to: null,
                color: null
            };
        },
        setGame(state, acion: PayloadAction<Partial<ChessState>>) {
            return {
                ...state,
                ...acion.payload
            }
        }
    }
});

export const {
    setFen,
    setGame,
    setGameOverModal,
    setLastMove,
    setLegalMoves,
    setResult,
    setSelectedSquare,
    setStatus,
    setWinner,
    clearLastMove,
    clearSelectedSquare,
    setTurn,
    setPromotion,
    clearPromotion
} = chessSlice.actions;

export default chessSlice.reducer;
