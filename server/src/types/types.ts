import { Square } from "chess.js"
import { AuthenticatedWebSocket } from "../socket/socket"
import type { GameType, GameStatus, GameResult, GameEndReason, GameTurn } from "../generated/prisma/enums"

export type ChessUIStatus = "waiting" | "playing" | "check" | "checkmate" | "stalemate"
    | "draw" | "resigned" | "timeout" | "abandone"

export type ChessUIResult = "1-0" | "0-1" | "1/2 - 1/2" | null

export interface ChessState {
    gameId: string | null
    fen: string
    turn: GameTurn
    selectedSquare: Square | null
    legalMoves: string[]
    lastMove: {
        from: Square,
        to: Square,
    } | null
    status: ChessUIStatus
    winner: GameTurn
    result: ChessUIResult
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
            color: GameTurn | null
        }
    }
}

export interface PlayerInfo {
    username: string;
    avatarUrl: string;
    country: string;
    blitzRating?: number;
    rapidRating?: number;
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
    gameType: GameType;
    status: GameStatus;
    result: GameResult | null;
    endReason: GameEndReason | null;
    timeControl: number;
    whiteTimeLeft: number;
    blackTimeLeft: number;
    fen: string;
    pgn: string;
    turn: GameTurn;
    moveCount: number;
    createdAt: Date;
    updatedAt: Date;
    blackPlayer?: PlayerInfo;
    whitePlayer?: PlayerInfo;
    turnStartedAt: number;
}

export interface MoveData {
    fen: string;
    pgn: string;
    turn: GameTurn;
    moveCount: number;
    whiteTimeLeft: number;
    blackTimeLeft: number;
    turnStartedAt: number;
}

export interface EndGameData {
    result: GameResult;
    endReason: GameEndReason;
    fen?: string;
    pgn?: string;
    turn?: GameTurn;
    moveCount?: number;
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
    turnStartedAt?: number;
}

export interface IGameManager {
    addPlayer: (playerId: string, socketId: string, ws: AuthenticatedWebSocket) => Player
    removePlayerConnection: (playerId: string) => void
    addToWaiting: (playerId: string, prefs: { game_type: string, game_time: number }) => void
    removeFromWaiting: (playerId: string) => void
    getGame: (gameId: string) => Game | undefined
    getPlayerGame: (playerId: string) => Game | undefined
    clearGame: (gameId: string) => void
    setTurnTimer: (gameId: string, timer: NodeJS.Timeout) => void
    clearTurnTimer: (gameId: string) => void
}
