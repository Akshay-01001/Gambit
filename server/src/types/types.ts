import { Square } from "chess.js"
import { AuthenticatedWebSocket } from "../socket/socket"

export type GameStatus = "waiting" | "playing" | "check" | "checkmate" | "stalemate"
    | "draw" | "resigned" | "timeout" | "abandone"

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
            rating: number,
            country: string
        } | null,
        white: {
            username: string,
            userId: string,
            rating: number,
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
        }
    }
}

export interface Player {
    playerId: string
    gameId: string | null
    socketId: string | null
    disconnectedAt?: number | null
    ws: AuthenticatedWebSocket
}

export interface Game {
    id: string;
    whitePlayerId: string | null;
    blackPlayerId: string | null;
    gameType: string;
    status: string;
    result: string | null;
    endReason: string | null;
    timeControl: number;
    whiteTimeLeft: number;
    blackTimeLeft: number;
    fen: string;
    pgn: string;
    moveCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGameManager {
    addPlayer: (playerId: string, socketId: string, ws: AuthenticatedWebSocket) => Player
    removePlayerConnection: (playerId: string) => void
    addToWaiting: (playerId: string) => void
    removeFromWaiting: (playerId: string) => void
    getGame: (gameId: string) => void
    getPlayerGame: (playerId: string) => void
    clearGame: (gameId: string) => void
}
