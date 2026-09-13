import React from 'react';

export type GameResult = 'WON' | 'LOST' | 'DRAW';

export interface RecentGameCardProps {
    id: string;
    gameMode: string;
    date: string;
    result: GameResult;
}

const RecentGameCard: React.FC<RecentGameCardProps> = ({ gameMode, date, result }) => {
    // Determine badge styles based on the result
    let badgeStyles = "";
    
    switch (result) {
        case 'WON':
            badgeStyles = "bg-green-500/10 text-green-500 border border-green-500/20";
            break;
        case 'LOST':
            badgeStyles = "bg-red-500/10 text-red-500 border border-red-500/20";
            break;
        case 'DRAW':
            badgeStyles = "bg-gray-500/10 text-gray-400 border border-gray-500/20";
            break;
    }

    return (
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors">
            <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">{gameMode}</span>
                <span className="text-xs text-muted-foreground">{date}</span>
            </div>
            <div className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider ${badgeStyles}`}>
                {result}
            </div>
        </div>
    );
};

export default RecentGameCard;
