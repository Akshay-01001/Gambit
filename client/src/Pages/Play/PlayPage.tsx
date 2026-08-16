import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { RootState } from "../../store/store";
import { setStatus } from "../../features/chess.slice";
import { gameManager } from "../../game/gameManager";
import Navbar from "../Home/Navbar";

const PlayPage = () => {
    const { status, gameId } = useSelector((state: RootState) => state.chess);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // When MATCH_CREATED is received, the gameManager dispatches setGame with
    // gameId + status="playing". This effect watches for that and navigates.
    useEffect(() => {
        if (status === "playing" && gameId) {
            navigate(`/game/${gameId}`);
        }
    }, [status, gameId, navigate]);

    const handlePlay = () => {
        dispatch(setStatus("waiting"));
        gameManager.findGame();
    };

    return (
        <div className="min-h-screen w-screen bg-background flex flex-col text-white">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                {status === "waiting" ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                        <p className="text-lg text-gray-300">Searching for opponent...</p>
                    </div>
                ) : (
                    <button
                        onClick={handlePlay}
                        className="bg-primary px-10 py-4 rounded-xl text-2xl font-bold cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        Play
                    </button>
                )}
            </div>
        </div>
    );
};

export default PlayPage;
