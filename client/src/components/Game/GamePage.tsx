import { useSelector } from "react-redux"
import type { RootState } from "../../store/store";
import Navbar from "../Home/Navbar";
import Board from "./Board";
import { gameManager } from "../../game/gameManager";
import Countdown from "react-countdown";
import ResignModal from "./ResignModal";
import { useState, useMemo } from "react";
import DrawModal from "./DrawModal";

const formatTime = (ms: number | null) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const GamePage = () => {
    const { id } = useSelector((state: RootState) => state.user);
    const { turn, blackTimeLeft, whiteTimeLeft, turnStartedAt, whitePlayerId, blackPlayerId, players, status, timeControl, gameType, pgn, result, endReason } = useSelector((state: RootState) => state.chess);
    const [isResignModalOpen, setIsResignModalOpen] = useState(false);
    const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

    const isUserBlack = id === blackPlayerId;

    const opponentName = isUserBlack ? (players.white?.username || "Opponent") : (players.black?.username || "Opponent");
    const opponentTime = isUserBlack ? whiteTimeLeft : blackTimeLeft;
    const opponentTurnColor = isUserBlack ? 'w' : 'b';

    const isSpectator = id !== whitePlayerId && id !== blackPlayerId;
    const userName = isSpectator ? (players.white?.username || "White") : "You";
    const userTime = isUserBlack ? blackTimeLeft : whiteTimeLeft;
    const userTurnColor = isUserBlack ? 'b' : 'w';

    const handleResignModalOpen = (isOpen: boolean) => {
        setIsResignModalOpen(isOpen);
    }

    const handleDrawModalOpen = (isOpen: boolean) => {
        setIsDrawModalOpen(isOpen);
    }

    const gameOverMessage = useMemo(() => {
        if (!result || !endReason) return null;

        switch (endReason) {
            case "RESIGNATION":
                return result === "WHITE_WIN" ? "Black resigned. White wins." : "White resigned. Black wins.";
            case "CHECKMATE":
                return result === "WHITE_WIN" ? "White wins by checkmate." : "Black wins by checkmate.";
            case "TIMEOUT":
                return result === "WHITE_WIN" ? "Black ran out of time. White wins." : "White ran out of time. Black wins.";
            case "DRAW_AGREEMENT":
                return "Game drawn by agreement.";
            case "STALEMATE":
                return "Game drawn by stalemate.";
            case "INSUFFICIENT_MATERIAL":
                return "Game drawn by insufficient material.";
            case "THREEFOLD_REPETITION":
                return "Game drawn by threefold repetition.";
            case "FIFTY_MOVE_RULE":
                return "Game drawn by fifty-move rule.";
            case "ABANDONMENT":
                return result === "WHITE_WIN" ? "Black abandoned the game. White wins." : "White abandoned the game. Black wins.";
            default:
                return "Game Over.";
        }
    }, [result, endReason]);

    return (
        <div className="min-h-screen w-screen bg-background flex flex-col text-white">
            <Navbar />
            <div className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                    {/* Left Column - Board Area */}
                    <div className="flex flex-col w-full lg:max-w-2xl gap-4">
                        {/* Opponent Info */}
                        <div className="bg-card px-4 py-3 flex items-center justify-between rounded-lg shadow-sm">
                            <span className="text-sm font-medium">{opponentName}</span>
                            <span className="px-3 py-1 bg-[#a2d149] rounded-md text-black font-bold text-sm tabular-nums">
                                {turn === opponentTurnColor && opponentTime ? (
                                    <Countdown
                                        date={(turnStartedAt || 0) + opponentTime}
                                        renderer={({ minutes, seconds }) => `${minutes}:${seconds.toString().padStart(2, "0")}`}
                                        onComplete={() => gameManager.resign()}
                                    />
                                ) : (
                                    formatTime(opponentTime)
                                )}
                            </span>
                        </div>

                        {/* Board */}
                        <div className="w-full shadow-2xl rounded-xl overflow-hidden">
                            <Board />
                        </div>

                        {/* User Info */}
                        <div className="bg-card px-4 py-3 flex items-center justify-between rounded-lg shadow-sm">
                            <span className="text-sm font-medium">{userName}</span>
                            <span className="px-3 py-1 bg-[#a2d149] rounded-md text-black font-bold text-sm tabular-nums">
                                {turn === userTurnColor && userTime ? (
                                    <Countdown
                                        date={(turnStartedAt || 0) + userTime}
                                        renderer={({ minutes, seconds }) => `${minutes}:${seconds.toString().padStart(2, "0")}`}
                                        onComplete={() => gameManager.resign()}
                                    />
                                ) : (
                                    formatTime(userTime)
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="w-full lg:w-80 flex flex-col gap-4">

                        {/* Time Control Box */}
                        <div className="bg-card p-6 rounded-xl flex flex-col gap-2 shadow-sm border border-[#2c2c2a]">
                            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Time Control</span>
                            <h2 className="text-xl font-bold text-white">60 min • Rapid</h2>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                Two players, one device. Pass the board on each move.
                            </p>
                        </div>

                        {/* Game Over Message Box */}
                        {gameOverMessage && (
                            <div className={`p-4 rounded-xl flex flex-col gap-1 shadow-sm border ${result === "DRAW" ? "bg-[#2a2a2a] border-[#404040]" : "bg-[#1c2e1f] border-[#2d4a31]"}`}>
                                <h3 className={`font-bold ${result === "DRAW" ? "text-gray-300" : "text-[#88c558]"}`}>{gameOverMessage}</h3>
                                <p className="text-sm text-gray-400">Game saved to your history.</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-2">
                            <button className="w-full py-3.5 bg-secondary hover:bg-secondary/80 transition-colors rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-[#3a3a3a] cursor-pointer"
                                disabled={status === "playing"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                                </svg>
                                New game
                            </button>
                            <button className="w-full py-3.5 bg-background hover:bg-background/80 transition-colors rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-[#3a3a3a] cursor-pointer"
                                onClick={() => handleDrawModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                </svg>
                                Draw
                            </button>
                            <button
                                className="w-full py-3.5 bg-destructive hover:bg-destructive/90 transition-colors rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                onClick={() => handleResignModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                    <line x1="4" x2="4" y1="22" y2="15" />
                                </svg>
                                Resign
                            </button>
                            <button
                                className="w-full mt-2 py-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold hover:bg-accent hover:rounded-md cursor-pointer"
                                onClick={() => handleResignModalOpen(false)}
                            >
                                Back to home
                            </button>
                        </div>
                    </div>
                </div>
                {
                    isResignModalOpen &&
                    <ResignModal handleResignModalOpen={handleResignModalOpen} />
                }
                {
                    isDrawModalOpen &&
                    <DrawModal handleDrawModalOpen={handleDrawModalOpen} />
                }
            </div>
        </div>
    )
}

export default GamePage;
