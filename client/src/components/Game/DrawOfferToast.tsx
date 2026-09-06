import React from 'react';

interface DrawOfferToastProps {
    closeToast?: () => void;
    onAccept: () => void;
}

const DrawOfferToast: React.FC<DrawOfferToastProps> = ({ closeToast, onAccept }) => {
    return (
        <div className="flex gap-3 items-center">
            <p className="font-semibold text-sm">Opponent wants to draw</p>
            <div className="flex gap-2">
                <button
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#a2d149] hover:bg-[#8bb43f] text-black px-3 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                    onClick={() => {
                        onAccept();
                        if (closeToast) closeToast();
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                        <path d="M9.55 17.05L4 11.5l1.4-1.4 4.15 4.15 8.65-8.65 1.4 1.4z"/>
                    </svg>
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-white px-3 py-1.5 rounded-lg text-sm font-bold border border-[#3a3a3a] transition-colors cursor-pointer"
                    onClick={closeToast}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DrawOfferToast;
