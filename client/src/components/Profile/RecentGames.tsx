import React from 'react';
import RecentGameCard, { type GameResult } from './RecentGameCard';

const dummyGames = [
    { id: '1', gameMode: '3 min - Blitz', date: '9/7/2026, 8:04:14 PM', result: 'WON' as GameResult },
    { id: '2', gameMode: '10 min - Rapid', date: '8/6/2026, 9:04:14 PM', result: 'LOST' as GameResult },
    { id: '3', gameMode: '3 min - Blitz', date: '8/5/2026, 9:04:14 PM', result: 'DRAW' as GameResult },
    { id: '4', gameMode: '5 min - Blitz', date: '7/2/2026, 1:12:00 PM', result: 'WON' as GameResult },
    { id: '5', gameMode: '10 min - Rapid', date: '6/15/2026, 10:30:22 AM', result: 'LOST' as GameResult },
];

const RecentGames: React.FC = () => {
    return (
        <div className="bg-card rounded-2xl p-6 border flex flex-col h-full">
            <h2 className="text-xl font-display font-bold mb-6">Recent games</h2>

            <div className="flex flex-col gap-3 overflow-y-auto">
                {dummyGames.map((game) => (
                    <RecentGameCard
                        key={game.id}
                        id={game.id}
                        gameMode={game.gameMode}
                        date={game.date}
                        result={game.result}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentGames;
