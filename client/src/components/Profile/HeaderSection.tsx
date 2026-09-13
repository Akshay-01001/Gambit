import React from 'react';
import StatsCard from './StatsCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const HeaderSection: React.FC = () => {
    const { chessProfile, username, avatarUrl, email } = useSelector((state: RootState) => state.user);

    const statsData = [
        { title: 'Games', count: chessProfile?.totalGames || 0 },
        { title: 'Wins', count: chessProfile?.totalGamesWon || 0 },
        { title: 'Losses', count: chessProfile?.totalGamesLost || 0 },
        { title: 'Draws', count: chessProfile?.totalGamesDraw || 0 },
    ];

    return (
        <div className="w-full mb-8">
            <div className="w-full rounded-2xl p-8 relative overflow-hidden bg-card border flex flex-col justify-between" style={{ minHeight: '300px' }}>
                {/* Background Gradient Effect - matching reference image */}
                <div className="absolute top-0 right-0 w-2/3 h-full opacity-30 pointer-events-none" 
                     style={{ background: 'radial-gradient(circle at top right, var(--primary), transparent 70%)' }}>
                </div>

                {/* Profile Info */}
                <div className="flex items-center gap-6 relative z-10 mb-12">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-display font-bold shrink-0 overflow-hidden">
                        <img src={avatarUrl} alt="avarat" className='h-full w-full' />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold mb-1">{username}</h1>
                        <p className="text-muted-foreground mb-3">{email}</p>
                        <div className='flex gap-3 items-center'>  
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown">
                                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                                </svg>
                                Blitz {chessProfile?.blitzRating}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown">
                                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                                </svg>
                                Rapid {chessProfile?.rapidRating}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown">
                                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                                </svg>
                                Bullet {chessProfile?.bulletRating}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Container */}
                <div className="relative z-10 grid grid-cols-4 gap-4 w-full">
                    {statsData.map((stat, index) => (
                        <div key={index} className="bg-background/40 backdrop-blur-sm rounded-xl border border-white/5">
                            <StatsCard title={stat.title} count={stat.count} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeaderSection;
