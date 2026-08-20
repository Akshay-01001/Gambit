import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { RootState } from "../../store/store";
import { setStatus } from "../../features/chess.slice";
import { gameManager } from "../../game/gameManager";
import Navbar from "../Home/Navbar";
import { GAME_TYPES } from "../../utils/constants";

const gameModes = [
    {
        title: "Bullet",
        description: "Lightning-fast. Pure instinct.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket h-4 w-4 text-primary" aria-hidden="true">
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"></path>
                <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"></path>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"></path>
            </svg>
        ),
        options: [
            { time: "1 min", label: "Bullet", socket_data: GAME_TYPES["bullet_1"] },
            { time: "2 min", label: "Bullet", socket_data: GAME_TYPES["bullet_2"] }
        ]
    },
    {
        title: "Blitz",
        description: "Sharp tactics, quick decisions.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-4 w-4 text-primary" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
        ),
        options: [
            { time: "3 min", label: "Blitz", socket_data: GAME_TYPES["blitz_3"] },
            { time: "5 min", label: "Blitz", socket_data: GAME_TYPES["blitz_5"] }
        ]
    },
    {
        title: "Rapid",
        description: "Room to think and plan.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer h-4 w-4 text-primary" aria-hidden="true">
                <line x1="10" x2="14" y1="2" y2="2"></line>
                <line x1="12" x2="15" y1="14" y2="11"></line>
                <circle cx="12" cy="14" r="8"></circle>
            </svg>
        ),
        options: [
            { time: "10 min", label: "Rapid", socket_data: GAME_TYPES["rapid_10"] },
            { time: "15 min", label: "Rapid", socket_data: GAME_TYPES["rapid_15"] }
        ]
    }
];

const PlayPage = () => {
    const { status, id: gameId } = useSelector((state: RootState) => state.chess);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (status === "playing" && gameId) {
            navigate(`/game/${gameId}`);
        }
    }, [status, gameId, navigate]);

    const handlePlay = (payload: { game_type: string; game_time: number }) => {
        dispatch(setStatus("waiting"));
        gameManager.findGame(payload);
    };

    return (
        <div className="min-h-screen w-screen bg-background flex flex-col text-white">
            <Navbar />
            <div className="mx-auto max-w-5xl px-6 py-12 w-full">

                {status === "waiting" ? (
                    <div className="flex-1 flex flex-col items-center justify-center mt-32 gap-6">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                        <p className="text-lg text-muted-foreground">Searching for opponent...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-10 flex flex-col gap-3">
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">New Game</span>
                            <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">Pick your pace</p>
                            <div className="max-w-xl text-muted-foreground">
                                Every mode is a local two-player game on one device — pass the board after each move.
                            </div>
                        </div>

                        <div className="space-y-8">
                            {gameModes.map((mode, idx) => (
                                <section key={idx}>
                                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        {mode.icon}
                                        <span className="uppercase tracking-wider">{mode.title}</span>
                                        <span className="text-xs opacity-60">
                                            · {mode.description}
                                        </span>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {mode.options.map((option, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handlePlay(option.socket_data)}
                                                className="group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 text-left transition hover:border-primary/60 hover:bg-card/80 cursor-pointer"
                                            >
                                                <div>
                                                    <div className="font-display text-2xl font-bold tabular-nums">
                                                        {option.time}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {option.label}
                                                    </div>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true">
                                                    <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlayPage;
