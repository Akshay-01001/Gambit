import { Square } from "chess.js"

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
