import { useOnboarding } from '../../hooks/useOnboarding';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    totalSteps?: number;
}

const OnboardingLayout = ({ children, currentStep, totalSteps = 2 }: OnboardingLayoutProps) => {
    const { setCurrentStep } = useOnboarding();

    return (
        <div className='min-h-screen w-screen bg-background flex justify-center items-start px-6 py-10'>
            <div className='w-full max-w-2xl px-6 flex flex-col'>
                {/* Logo Section */}
                <div className='flex items-center justify-between'>
                    <div className="flex items-center cursor-pointer">
                        <span className="bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] h-10 w-10 flex justify-center items-center rounded-lg">
                            <img src='/logo.svg' alt="logo" className="h-6 w-6" />
                        </span>
                        <span className="font-bold text-xl ml-3 tracking-wide">Gambit</span>
                    </div>
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                            Back
                        </button>
                    )}
                </div>

                {/* Progress Bar Section */}
                <div className='w-full mt-10'>
                    <div className='flex items-center gap-2 mb-3'>
                        {Array.from({ length: totalSteps }).map((_, index) => {
                            const isCompleted = index < currentStep;
                            return (
                                <div
                                    key={index}
                                    className={`h-1 flex-1 rounded-full ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                                ></div>
                            );
                        })}
                    </div>
                    <div className='text-sm font-semibold text-primary'>
                        Step {currentStep} of {totalSteps}
                    </div>
                </div>

                {/* Form / Page Content */}
                <div className='w-full'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
