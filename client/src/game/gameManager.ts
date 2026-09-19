import { setStatus, setGame } from '../features/chess.slice';
import {
    setSocketMessageCallback,
    connectSocket,
    sendMessage,
} from '../socket/socket';
import { store } from '../store/store';
import {
    SocketEvents,
    type ServerMessage,
    type ClientMessage,
} from '../types/socketEvents';
import type { ChessState } from '../types/inex';
import { toast } from 'react-toastify';
import React from 'react';
import DrawOfferToast from '../components/Game/DrawOfferToast';

class GameManager {
    private initialized = false;
    private matchmakingTimeout: ReturnType<typeof setTimeout> | null = null;

    private clearMatchmakingTimeout() {
        if (this.matchmakingTimeout) {
            clearTimeout(this.matchmakingTimeout);
            this.matchmakingTimeout = null;
        }
    }

    /**
     * Initialize the socket connection and register the message handler.
     * Guarded against duplicate calls (e.g., React Strict Mode double-mounting).
     */
    public init() {
        if (this.initialized) return;
        this.initialized = true;

        connectSocket();
        setSocketMessageCallback((data) => {
            this.handleServerMessage(data);
        });
    }

    // ─── Server Message Handler ──────────────────────

    private handleServerMessage(data: ServerMessage) {
        switch (data.type) {
            case SocketEvents.MATCH_CREATED: {
                this.clearMatchmakingTimeout();
                const { blackPlayer, whitePlayer, ...game } = data.game;
                store.dispatch(
                    setGame({
                        ...game,
                        status: 'playing',
                        players: {
                            black: blackPlayer || null,
                            white: whitePlayer || null,
                            clock: store.getState().chess.players?.clock || {
                                white: '10:00',
                                black: '10:00',
                            },
                            promotion: store.getState().chess.players
                                ?.promotion || {
                                open: false,
                                from: null,
                                to: null,
                                color: null,
                            },
                        },
                    }),
                );
                break;
            }

            case SocketEvents.GAME_STATE: {
                const { blackPlayer, whitePlayer, ...game } = data.game_state;
                store.dispatch(
                    setGame({
                        ...game,
                        status: game.status?.toLowerCase(),
                        players: {
                            black: blackPlayer || null,
                            white: whitePlayer || null,
                            clock: store.getState().chess.players?.clock || {
                                white: '10:00',
                                black: '10:00',
                            },
                            promotion: store.getState().chess.players
                                ?.promotion || {
                                open: false,
                                from: null,
                                to: null,
                                color: null,
                            },
                        },
                    }),
                );
                break;
            }

            case SocketEvents.NO_MATCH_FOUND:
                this.clearMatchmakingTimeout();
                // Reset the "waiting" status so the Play page shows the button again
                store.dispatch(setStatus(null));
                break;

            case SocketEvents.MOVE_MADE: {
                const game = data.game_state;
                store.dispatch(
                    setGame({
                        fen: game.fen,
                        pgn: game.pgn,
                        turn: game.turn,
                        moveCount: game.moveCount,
                        whiteTimeLeft: game.whiteTimeLeft,
                        blackTimeLeft: game.blackTimeLeft,
                        turnStartedAt: game.turnStartedAt,
                        selectedSquare: null,
                        legalMoves: [],
                    }),
                );
                break;
            }

            case SocketEvents.GAME_OVER: {
                const game = data.game_state;
                const { blackPlayer, whitePlayer, ...rest } = game;
                const currentPlayers = store.getState().chess.players;
                store.dispatch(
                    setGame({
                        ...rest,
                        status: game.status?.toLowerCase() as ChessState['status'],
                        result: game.result,
                        endReason: game.endReason,
                        turn: (game.fen.split(' ')[1] as 'w' | 'b') || game.turn,
                        players: {
                            black: blackPlayer || currentPlayers?.black || null,
                            white: whitePlayer || currentPlayers?.white || null,
                            clock: currentPlayers?.clock || { white: '', black: '' },
                            promotion: currentPlayers?.promotion || {
                                open: false,
                                from: null,
                                to: null,
                                color: null,
                            },
                        },
                    }),
                );
                break;
            }

            case SocketEvents.ERROR:
                console.error('Server error:', data.message);
                // If we're in 'waiting' state, reset so the user isn't stuck
                if (store.getState().chess.status === 'waiting') {
                    this.clearMatchmakingTimeout();
                    store.dispatch(setStatus(null));
                }
                break;

            case SocketEvents.DRAW_OFFERED:
                toast(
                    React.createElement(DrawOfferToast, {
                        onAccept: () => this.acceptDraw(),
                    }),
                    {
                        position: 'top-center',
                        autoClose: 60000,
                        closeOnClick: false,
                        draggable: false,
                        theme: 'dark',
                    },
                );
                break;

            default:
                console.warn(
                    'Unknown event type:',
                    (data as Record<string, unknown>).type,
                );
        }
    }

    // ─── Client → Server Actions ─────────────────────

    /**
     * Send a typed message to the server via WebSocket.
     * Uses sendMessage() which auto-queues if the socket isn't ready yet.
     */
    private sendEvent(message: ClientMessage) {
        sendMessage(message);
    }

    public findGame(payload: { game_type: string; game_time: number }) {
        this.sendEvent({ type: SocketEvents.FIND_GAME, payload });

        // Safety timeout: if the server never responds (e.g., socket dropped
        // mid-flight), reset the waiting state after 35s so the user isn't
        // stuck forever. This is slightly longer than the server's 30s
        // matchmaking timeout to avoid racing with NO_MATCH_FOUND.
        this.clearMatchmakingTimeout();
        this.matchmakingTimeout = setTimeout(() => {
            if (store.getState().chess.status === 'waiting') {
                store.dispatch(setStatus(null));
            }
            this.matchmakingTimeout = null;
        }, 35000);
    }

    public reJoinGame(gameId: string) {
        this.sendEvent({
            type: SocketEvents.REJOIN_GAME,
            gameId,
        });
    }

    public resign() {
        const state = store.getState();
        const gameId = state.chess.id;
        if (!gameId) return;

        this.sendEvent({ type: SocketEvents.RESIGN_GAME, gameId });
    }

    public makeMove(from: string, to: string, promotion?: string) {
        const payload = {
            from,
            to,
            ...(promotion && { promotion }),
        };

        this.sendEvent({
            type: SocketEvents.MAKE_MOVE,
            payload,
        });
    }

    public offerDraw() {
        const state = store.getState();
        const gameId = state.chess.id;
        if (!gameId) {
            return;
        }
        this.sendEvent({ type: SocketEvents.OFFER_DRAW, gameId });
    }

    public acceptDraw() {
        const state = store.getState();
        const gameId = state.chess.id;
        if (!gameId) {
            return;
        }
        this.sendEvent({ type: SocketEvents.ACCEPT_DRAW, gameId });
    }
}

// Export as a singleton so the same instance is used everywhere
export const gameManager = new GameManager();
