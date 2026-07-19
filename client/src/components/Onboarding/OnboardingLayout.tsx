import { type ReactNode } from 'react';
import '../Login/login.css'; // import the css to get .gambit-logo

interface OnboardingLayoutProps {
    children: ReactNode;
    currentStep: number;
    totalSteps?: number;
}

const OnboardingLayout = ({ children, currentStep, totalSteps = 3 }: OnboardingLayoutProps) => {
    return (
        <div className='min-h-screen w-screen bg-background flex justify-center items-start px-6 py-10'>
            <div className='w-full max-w-2xl px-6 flex flex-col'>
                {/* Logo Section */}
                <div className='flex items-center'>
                    <div className="flex items-center cursor-pointer">
                        <span className="gambit-logo h-10 w-10 flex justify-center items-center rounded-lg">
                            <img src='/logo.svg' alt="logo" className="h-6 w-6" />
                        </span>
                        <span className="font-bold text-xl ml-3 tracking-wide">Gambit</span>
                    </div>
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
