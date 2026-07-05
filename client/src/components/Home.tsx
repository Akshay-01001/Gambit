import './Home.css';

export const Home = () => {
    return (
        <div className="h-screen w-screen overflow-y-auto home-container">
            <div className="w-full h-16 flex items-center justify-between px-6 md:px-10 border-b z-50 sticky top-0 backdrop-blur-md home-navbar">
                {/* Left: Logo */}
                <div className="flex items-center flex-1">
                    <span className="gambit-logo h-9 w-9 flex justify-center p-2 rounded-md">
                        <img src='./logo.svg' alt="logo" />
                    </span>
                    <span className="font-bold text-xl ml-3 tracking-wide home-text-primary">Gambit</span>
                </div>

                {/* Center: Navigation */}
                <div className="hidden md:flex items-center justify-center gap-8 flex-1">
                    <a href="#" className="font-medium hover:opacity-75 transition-opacity home-text-primary">Home</a>
                    <a href="#" className="font-medium hover:opacity-75 transition-opacity home-text-muted">Profile</a>
                </div>

                {/* Right: Auth Buttons */}
                <div className="flex items-center justify-end flex-1 gap-4 md:gap-6">
                    <button className="font-medium hover:opacity-75 transition-opacity home-text-primary">Login</button>
                    <button className="px-4 py-1.5 md:px-5 md:py-2 rounded-md font-bold transition-opacity hover:opacity-90 home-btn-primary">Sign up</button>
                </div>
            </div>

            <div className="header flex items-center min-h-[500px] md:h-[610px] px-6 md:px-10">
                <div className="max-w-7xl w-full mx-auto pb-12 md:pb-0">
                    <div className="pill px-3 rounded-full py-1.5 flex items-center gap-2 w-fit text-xs md:text-sm font-medium shadow-sm">
                        <span className="h-2 w-2 rounded-full home-pill-icon"></span>
                        <span>Free to play. Forever.</span>
                    </div>
                    <div className="text-5xl md:text-7xl font-bold flex flex-col gap-2 pt-6 md:pt-8 tracking-tight home-text-primary">
                        <span>Your Next Move,</span>
                        <span className="heading-bottom">On the clock.</span>
                    </div>
                    <div className="header-bottom mt-6 max-w-lg text-base md:text-lg leading-relaxed">
                        A clean, fast place to play chess. Sign in, pick a time control, and start playing in seconds.
                    </div>
                    <div className="mt-8 md:mt-10">
                        <button className="px-8 py-3 rounded-md font-bold text-lg transition-opacity hover:opacity-90 shadow-lg home-play-btn">Play Now</button>
                    </div>
                </div>
            </div>

            <div className='home-feature-section flex flex-col md:flex-row items-start md:items-center justify-around py-12 md:py-0 md:h-[200px] gap-10 md:gap-4 px-6 md:px-10'>
                <div className='flex gap-4 max-w-xs'>
                    <span className="trophy-logo h-12 w-12 shrink-0 flex justify-center p-2.5 rounded-md">
                        <img src='./trophy.svg' alt="trophy" className="w-full h-full" />
                    </span>
                    <div className='flex flex-col'>
                        <p className='text-lg font-bold home-text-primary'>Track your rating</p>
                        <span className='mt-1 text-sm md:text-base home-text-muted'>Your rating updates as you win, lose, and draw.</span>
                    </div>
                </div>
                <div className='flex gap-4 max-w-xs'>
                    <span className="trophy-logo h-12 w-12 shrink-0 flex justify-center p-2.5 rounded-md">
                        <img src='./lightning.svg' alt="lightning" className="w-full h-full" />
                    </span>
                    <div className='flex flex-col'>
                        <p className='text-lg font-bold home-text-primary'>Play instantly</p>
                        <span className='mt-1 text-sm md:text-base home-text-muted'>Find matches in seconds with zero delay or lag.</span>
                    </div>
                </div>
                <div className='flex gap-4 max-w-xs'>
                    <span className="trophy-logo h-12 w-12 shrink-0 flex justify-center p-2.5 rounded-md">
                        <img src='./trophy.svg' alt="trophy" className="w-full h-full" />
                    </span>
                    <div className='flex flex-col'>
                        <p className='text-lg font-bold home-text-primary'>Learn and improve</p>
                        <span className='mt-1 text-sm md:text-base home-text-muted'>Analyze your past games to climb the ranks.</span>
                    </div>
                </div>
            </div>

            <footer className="flex items-center justify-between py-8 px-6 md:px-10 w-full home-text-muted text-sm font-medium">
                <span>© 2026 Gambit</span>
                <span>Built for players.</span>
            </footer>
        </div>
    )
}
