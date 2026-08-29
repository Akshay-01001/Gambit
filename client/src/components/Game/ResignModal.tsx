import { createPortal } from "react-dom";

interface ResignModalProps {
    handleResignModalOpen: (isOpen: boolean) => void
}

const ResignModal: React.FC<ResignModalProps> = ({ handleResignModalOpen }) => {
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-sm rounded-2xl border border-[#2c2c2a] shadow-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-4 text-center items-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                            <line x1="4" x2="4" y1="22" y2="15" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Are you sure you want to resign?
                    </h2>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        className="flex-1 py-3 bg-secondary hover:bg-secondary/80 transition-colors rounded-xl text-white font-semibold border border-[#3a3a3a] cursor-pointer"
                        onClick={() => handleResignModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button className="flex-1 py-3 bg-destructive hover:bg-destructive/90 transition-colors rounded-xl text-white font-bold shadow-lg cursor-pointer">
                        Resign
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ResignModal;
