import { useSelector } from "react-redux"
import type { RootState } from "../../store/store";
import Navbar from "../../Pages/Home/Navbar";
import Board from "./Board";
import { gameManager } from "../../game/gameManager";

const GamePage = () => {
    const { username } = useSelector((state: RootState) => state.user);

    return (
        <div className="min-h-screen w-screen bg-background flex flex-col text-white">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                    {/* Left Column - Board Area */}
                    <div className="flex flex-col w-full lg:max-w-2xl gap-4">
                        {/* Opponent Info */}
                        <div className="bg-card px-4 py-3 flex items-center justify-between rounded-lg shadow-sm">
                            <span className="text-sm font-medium">Opponent (Black)</span>
                            <span className="px-3 py-1 bg-[#a2d149] rounded-md text-black font-bold text-sm">32:46</span>
                        </div>

                        {/* Board */}
                        <div className="w-full shadow-2xl rounded-xl overflow-hidden">
                            <Board />
                        </div>

                        {/* User Info */}
                        <div className="bg-card px-4 py-3 flex items-center justify-between rounded-lg shadow-sm">
                            <span className="text-sm font-medium">{username} (White)</span>
                            <span className="px-3 py-1 bg-[#a2d149] rounded-md text-black font-bold text-sm">32:46</span>
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

                        {/* Moves Box */}
                        <div className="bg-card p-6 rounded-xl flex flex-col gap-2 min-h-35 shadow-sm border border-[#2c2c2a]">
                            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Moves</span>
                            <div className="flex flex-col gap-1 mt-2 text-sm text-gray-300 font-medium">
                                <div className="grid grid-cols-2 gap-4 hover:bg-[#2c2c2a] px-2 py-1 rounded">
                                    <span>1. e3</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-2">
                            <button className="w-full py-3.5 bg-secondary hover:bg-secondary/80 transition-colors rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-[#3a3a3a] cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                                </svg>
                                New game
                            </button>
                            <button className="w-full py-3.5 bg-background hover:bg-background/80 transition-colors rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-[#3a3a3a] cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                </svg>
                                Draw
                            </button>
                            <button
                                className="w-full py-3.5 bg-destructive hover:bg-destructive/90 transition-colors rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                onClick={() => gameManager.resign()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                    <line x1="4" x2="4" y1="22" y2="15" />
                                </svg>
                                Resign
                            </button>
                            <button className="w-full mt-2 py-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold hover:bg-accent hover:rounded-md cursor-pointer">
                                Back to home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GamePage;
