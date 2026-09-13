import React from 'react';
import EditProfile from './EditProfile';
import RecentGames from './RecentGames';

const HeroSection: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full pb-16">
            <EditProfile />
            <RecentGames />
        </div>
    );
};

export default HeroSection;
