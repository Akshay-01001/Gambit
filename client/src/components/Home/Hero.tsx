import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

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
                        A clean, fast place to play chess. Sign in, pick a time
                        control, and start playing in seconds.
                    </div>

                    <div className="mt-8 md:mt-10">
                        <button
                            className="px-8 py-3 rounded-md font-bold text-lg transition-opacity hover:opacity-90 shadow-lg home-play-btn cursor-pointer"
                            onClick={() => handleNavigate('/play')}
                        >
                            Play Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="home-feature-section flex flex-col md:flex-row items-start md:items-center justify-around py-12 md:py-0 md:h-50 gap-10 md:gap-4 px-6 md:px-10">
                <div className="flex gap-4 max-w-xs">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trophy h-5 w-5"
                        >
                            <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path>
                            <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path>
                            <path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path>
                            <path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path>
                        </svg>
                    </span>
                    <div className="flex flex-col">
                        <p className="text-lg font-bold home-text-primary">
                            Track your rating
                        </p>
                        <span className="mt-1 text-sm md:text-base home-text-muted">
                            Your rating updates as you win, lose, and draw.
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 max-w-xs">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-zap h-5 w-5"
                        >
                            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                        </svg>
                    </span>
                    <div className="flex flex-col">
                        <p className="text-lg font-bold home-text-primary">
                            Play instantly
                        </p>
                        <span className="mt-1 text-sm md:text-base home-text-muted">
                            Find matches in seconds with zero delay or lag.
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 max-w-xs">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-timer h-5 w-5"
                        >
                            <line x1="10" x2="14" y1="2" y2="2"></line>
                            <line x1="12" x2="15" y1="14" y2="11"></line>
                            <circle cx="12" cy="14" r="8"></circle>
                        </svg>
                    </span>
                    <div className="flex flex-col">
                        <p className="text-lg font-bold home-text-primary">
                            Learn and improve
                        </p>
                        <span className="mt-1 text-sm md:text-base home-text-muted">
                            Analyze your past games to climb the ranks.
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
