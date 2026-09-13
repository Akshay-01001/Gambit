import React from 'react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import HeaderSection from './HeaderSection';
import HeroSection from './HeroSection';

const ProfilePage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-y-auto">
            <Navbar />
            <main className="flex-1 flex flex-col items-center pt-8 px-4 md:px-8 w-full max-w-5xl mx-auto">
                <HeaderSection />
                <HeroSection />
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;
