const Hero = () => {
    return (
        <>
            <div className="header flex items-center min-h-125 md:h-152.5 px-6 md:px-10">
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
                        <button className="px-8 py-3 rounded-md font-bold text-lg transition-opacity hover:opacity-90 shadow-lg home-play-btn cursor-pointer">Play Now</button>
                    </div>
                </div>
            </div>

            <div className='home-feature-section flex flex-col md:flex-row items-start md:items-center justify-around py-12 md:py-0 md:h-50 gap-10 md:gap-4 px-6 md:px-10'>
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
        </>
    )
}

export default Hero