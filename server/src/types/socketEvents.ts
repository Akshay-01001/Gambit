export const SocketEvents = {
    // Client → Server
    FIND_GAME: "FIND_GAME",
    REJOIN_GAME: "REJOIN_GAME",
    MAKE_MOVE: "MAKE_MOVE",
    RESIGN_GAME: "RESIGN_GAME",

    // Server → Client
    MATCH_CREATED: "MATCH_CREATED",
    GAME_STATE: "GAME_STATE",
    NO_MATCH_FOUND: "NO_MATCH_FOUND",
    MOVE_MADE: "MOVE_MADE",
    GAME_OVER: "GAME_OVER",
    ERROR: "ERROR",
    PLAYER_DISCONNECTED: "PLAYER_DISCONNECTED",
    PLAYER_CONNECTED: "PLAYER_CONNECTED"
} as const;

export interface GameData {
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
    turn: "w" | "b";
    fen: string;
    pgn: string;
    moveCount: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type ClientMessage =
    | { type: typeof SocketEvents.FIND_GAME }
    | { type: typeof SocketEvents.REJOIN_GAME; gameId: string }
    | { type: typeof SocketEvents.MAKE_MOVE; payload: { from: string; to: string; promotion?: string } }
    | { type: typeof SocketEvents.RESIGN_GAME; gameId: string };

export type ServerMessage =
    | { type: typeof SocketEvents.MATCH_CREATED; gameId: string; game: GameData }
    | { type: typeof SocketEvents.GAME_STATE; game_state: GameData }
    | { type: typeof SocketEvents.NO_MATCH_FOUND }
    | { type: typeof SocketEvents.MOVE_MADE; game_state: GameData }
    | { type: typeof SocketEvents.GAME_OVER; game_state: GameData }
    | { type: typeof SocketEvents.ERROR; message: string }
    | { type: typeof SocketEvents.PLAYER_DISCONNECTED; player_id: string }
    | { type: typeof SocketEvents.PLAYER_CONNECTED; player_id: string };
