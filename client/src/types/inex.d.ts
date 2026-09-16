import { PieceSymbol, Square, Color } from 'chess.js';

interface SquarePiece {
    type: PieceSymbol;
    square: Square;
    color: Color;
}

export type GameStatus =
    | 'waiting'
    | 'playing'
    | 'check'
    | 'checkmate'
    | 'stalemate'
    | 'draw'
    | 'resigned'
    | 'timeout'
    | 'abandone'
    | 'completed'
    | null;

export type GameResult =
    '1-0' | '0-1' | '1/2 - 1/2' | 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW' | null;

export interface ChessState {
    id: string | null;
    whitePlayerId: string | null;
    blackPlayerId: string | null;
    gameType: string | null;
    timeControl: number | null;
    whiteTimeLeft: number | null;
    blackTimeLeft: number | null;
    turnStartedAt: number | null;
    fen: string;
    pgn: string;
    moveCount: number;
    createdAt: Date | string | null;
    updatedAt: Date | string | null;
    turn: 'b' | 'w';
    selectedSquare: Square | null;
    legalMoves: Square[];
    lastMove: {
        from: Square;
        to: Square;
    } | null;
    status: GameStatus;
    winner: 'b' | 'w' | null;
    result: GameResult;
    endReason: string | null;
    players: {
        black: {
            username: string;
            avatarUrl: string;
            blitzRating?: number;
            rapidRating?: number;
            country: string;
        } | null;
        white: {
            username: string;
            avatarUrl: string;
            blitzRating?: number;
            rapidRating?: number;
            country: string;
        } | null;
        clock: {
            white: string;
            black: string;
        };
        promotion: {
            open: boolean;
            from: Square | null;
            to: Square | null;
            color: 'b' | 'w' | null;
        };
    };
    gameOverModalOpen: boolean;
    showDrawOfferNotification: boolean;
}
