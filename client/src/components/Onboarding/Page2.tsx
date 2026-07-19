import OnboardingLayout from "./OnboardingLayout"

const Page2 = () => {
    return (
        <OnboardingLayout currentStep={2}>
            <div className='mt-6'>
                <h1 className='text-3xl font-display font-bold'>Choose your avatar</h1>
                <p className='mt-2 text-sm text-muted-foreground'>Pick one of ours or upload your own.</p>
            </div>
            <div className='mt-10'>
            </div>
            <div className='mt-8'>
                <button type="button" className="w-full bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors hover:bg-primary/90">
                    Continue
                </button>
            </div>
        </OnboardingLayout>
    )
}

export default Page2;
