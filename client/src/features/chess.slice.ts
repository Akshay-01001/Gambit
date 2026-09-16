import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Square } from 'chess.js';
import type { ChessState, GameResult, GameStatus } from '../types/inex';

const initialState: ChessState = {
    id: null,
    whitePlayerId: null,
    blackPlayerId: null,
    gameType: null,
    timeControl: null,
    whiteTimeLeft: null,
    blackTimeLeft: null,
    turnStartedAt: null,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    pgn: "",
    moveCount: 0,
    createdAt: null,
    updatedAt: null,
    turn: "w",
    selectedSquare: null,
    legalMoves: [],
    lastMove: null,
    status: null,
    winner: null,
    result: null,
    endReason: null,
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
    gameOverModalOpen: false,
    showDrawOfferNotification: false
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
        setLegalMoves(state, action: PayloadAction<Square[]>) {
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
