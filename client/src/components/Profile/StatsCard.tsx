import React from 'react';

interface StatsCardProps {
    title: string;
    count: number;
    subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, subtitle }) => {
    return (
        <div className="flex flex-col items-center justify-center py-4 px-6 bg-card rounded-xl border border-transparent shadow-sm">
            <span className="text-2xl font-bold font-display">{count}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">{title}</span>
            {subtitle && <span className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</span>}
        </div>
    );
};

export default StatsCard;
