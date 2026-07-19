import React from 'react'
import CountrySelect from './CountrySelect'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import OnboardingLayout from './OnboardingLayout';

const Page1 = () => {
    const { isOnboarded } = useAuth();

    if (isOnboarded) {
        return <Navigate to="/" replace />;
    }

    return (
        <OnboardingLayout currentStep={1}>
            <div className='mt-6'>
                <h1 className='text-3xl font-display font-bold'>Tell us about you</h1>
                <p className='mt-2 text-sm text-muted-foreground'>Pick a username and your country. This shows up next to your rating.</p>
            </div>
            <div className='mt-10'>
                <form action="" className='space-y-6'>
                    <div className='flex flex-col space-y-2'>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            placeholder='e.g knight_rider'
                            name="username"
                            id="username"
                            className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                        />
                        <p className='mt-1 text-xs text-muted-foreground'>3–20 chars · letters, numbers, underscores</p>
                    </div>
                    <div className='flex flex-col space-y-2'>
                        <label htmlFor="country">Country</label>
                        <CountrySelect />
                    </div>
                </form>
            </div>
            <div className='mt-8'>
                <button type="button" className="w-full bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors hover:bg-primary/90">
                    Continue
                </button>
            </div>
        </OnboardingLayout>
    )
}

export default Page1;
