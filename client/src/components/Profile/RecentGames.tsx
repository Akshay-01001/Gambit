import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RecentGameCard from './RecentGameCard';
import api from '../../utils/api';
import { setLoading, setPageData, setCurrentPage } from '../../features/game.slice';
import type { GameData } from '../../types/socketEvents';
import type { RootState } from '../../store/store';

const RecentGames = () => {
    const dispatch = useDispatch();
    const { id: userId } = useSelector((state: RootState) => state.user);
    const { pages, currentPage, totalPages, loading } = useSelector((state: RootState) => state.game);

    const currentGames = pages[currentPage] || [];

    useEffect(() => {
        if (!userId) return;

        const fetchGames = async () => {
            if (pages[currentPage]) {
                // data present, don't call api
                return;
            }

            try {
                dispatch(setLoading(true));
                const response = await api.get('/api/game/recent-games', {
                    params: { page: currentPage, limit: 5 }
                });

                if (response.data?.data) {
                    dispatch(setPageData({
                        page: currentPage,
                        games: response.data.data.data,
                        totalPages: response.data.data.totalPages
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch games", error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchGames();
    }, [currentPage, userId, pages, dispatch]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            dispatch(setCurrentPage(currentPage - 1));
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            dispatch(setCurrentPage(currentPage + 1));
        }
    };

    const handlePageClick = (page: number) => {
        dispatch(setCurrentPage(page));
    };

    const getGameResult = (game: GameData) => {
        if (game.result === 'DRAW') return 'DRAW';
        if (game.result === 'WHITE_WIN' && game.whitePlayerId === userId) return 'WON';
        if (game.result === 'BLACK_WIN' && game.blackPlayerId === userId) return 'WON';
        return 'LOST';
    };

    return (
        <div className="bg-card rounded-2xl p-6 border flex flex-col h-full">
            <h2 className="text-xl font-display font-bold mb-6">Recent games</h2>

            <div className="flex flex-col gap-3 overflow-y-auto flex-1 mb-4">
                {loading && currentGames.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                ) : currentGames.length > 0 ? (
                    currentGames.map((game) => (
                        <RecentGameCard
                            key={game.id}
                            id={game.id}
                            gameMode={game.gameType || 'Standard'}
                            date={new Date(game.createdAt).toLocaleString()}
                            result={getGameResult(game)}
                        />
                    ))
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <span className="text-sm text-muted-foreground">No recent games</span>
                    </div>
                )}
            </div>

            {/* Pagination UI */}
            {totalPages > 0 && (
                <div className="flex items-center justify-center gap-1 mt-auto">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                        const page = idx + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${currentPage === page ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentGames;
