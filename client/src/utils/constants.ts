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