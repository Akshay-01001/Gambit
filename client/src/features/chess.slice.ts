import { createSlice } from '@reduxjs/toolkit';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { SquarePiece } from '../types/inex';

export interface ChessState {
    game_status: 'active' | 'checkmate' | 'stalemate' | 'draw' | 'threefold_repetition' | 'insufficient_material';
    fen: string,
    board: SquarePiece[],
    legalMoves: Square[],
    selectedSquare: SquarePiece | null,
    turn: 'w' | 'b',
    winner: 'w' | 'b' | null,
    isCheck: boolean
    isGameOver: boolean
}

const initialState: ChessState = {
    game_status: 'active',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    board: new Chess().board().flat(),
    legalMoves: [],
    selectedSquare: null,
    turn: 'w',
    winner: null,
    isCheck: false,
    isGameOver: false
}

function deriveStatus(chess: Chess) {
    let game_status: ChessState['game_status'] = 'active';
    let winner: ChessState['winner'] = null;

    if (chess.isCheckmate()) {
        game_status = 'checkmate';
        winner = chess.turn() === 'w' ? 'b' : 'w';
    } else if (chess.isStalemate()) {
        game_status = 'stalemate';
    } else if (chess.isThreefoldRepetition()) {
        game_status = 'threefold_repetition';
    } else if (chess.isInsufficientMaterial()) {
        game_status = 'insufficient_material';
    } else if (chess.isDraw()) {
        game_status = 'draw';
    }

    return {
        game_status,
        winner,
        isCheck: chess.isCheck(),
    };
}

export const chessSlice = createSlice({
    name: 'chess',
    initialState,
    reducers: {
        resetGame() {
            return initialState;
        },
        selectSquare(state, action: { payload: SquarePiece | null }) {
            const selectedSquare = action.payload;

            if (!selectedSquare) {
                state.selectedSquare = null;
                state.legalMoves = [];
                return;
            }

            const chess = new Chess(state.fen);

            if (!state.selectedSquare || state.selectedSquare.square !== selectedSquare.square) {
                state.selectedSquare = selectedSquare;
                state.legalMoves = chess.moves({
                    square: selectedSquare.square,
                    verbose: true
                }).map((m) => m.to);
            } else {
                state.selectedSquare = null;
                state.legalMoves = [];
            }
        },
        makeMove(state, action: { payload: Square }) {
            const move = action.payload;
            const chess = new Chess(state.fen);
            chess.move({
                from: state.selectedSquare.square,
                to: move,
                promotion: 'q'
            });
            state.fen = chess.fen();
            state.board = chess.board().flat()
            state.legalMoves = []
            state.selectedSquare = null;
            if (state.turn === 'w') {
                state.turn = 'b'
            } else {
                state.turn = 'w'
            }

            const { game_status, isCheck, winner } = deriveStatus(chess);
            state.winner = winner;
            state.game_status = game_status;
            state.isCheck = isCheck;
            state.isGameOver = chess.isGameOver()
        }
    }
});

export const { resetGame, selectSquare, makeMove } = chessSlice.actions;
export default chessSlice.reducer;
