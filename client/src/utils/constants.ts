export const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export const PIECES_MAP_BLACK: Record<string, string> = {
    'p': '/chess-pieces/bP.svg',
    'n': '/chess-pieces/bN.svg',
    'b': '/chess-pieces/bB.svg',
    'r': '/chess-pieces/bR.svg',
    'q': '/chess-pieces/bQ.svg',
    'k': '/chess-pieces/bK.svg'
};

export const PIECES_MAP_WHITE: Record<string, string> = {
    'p': '/chess-pieces/wP.svg',
    'n': '/chess-pieces/wN.svg',
    'b': '/chess-pieces/wB.svg',
    'r': '/chess-pieces/wR.svg',
    'q': '/chess-pieces/wQ.svg',
    'k': '/chess-pieces/wK.svg'
};

export const GAME_TYPES = {
    // Bullet
    bullet_1: {
        game_type: 'BULLET',
        game_time: 1 * 60 * 1000 // 1 minute in milliseconds
    },
    bullet_2: {
        game_type: 'BULLET',
        game_time: 2 * 60 * 1000 // 2 minutes
    },
    // Blitz
    blitz_3: {
        game_type: 'BLITZ',
        game_time: 3 * 60 * 1000 // 3 minutes
    },
    blitz_5: {
        game_type: 'BLITZ',
        game_time: 5 * 60 * 1000 // 5 minutes
    },
    // Rapid
    rapid_10: {
        game_type: 'RAPID',
        game_time: 10 * 60 * 1000 // 10 minutes
    },
    rapid_15: {
        game_type: 'RAPID',
        game_time: 15 * 60 * 1000 // 30 minutes
    }
};