import OnboardingLayout from "./OnboardingLayout"

const Page3 = () => {
    return (
        <OnboardingLayout currentStep={3}>
            <div className='mt-6'>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-mail h-5 w-5">
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    </svg>
                </div>
                <h1 className='mt-4 font-display text-3xl font-bold'>
                    Verify Your Email
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                    We sent a 6-digit code to your email. Enter it below to finish setup.
                </p>
            </div>
            <div className='mt-10 space-y-6'>
                <div className='flex items-center gap-4'>
                    <input type="text" maxLength={1} className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                    <input type="text" maxLength={1} className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                    <input type="text" maxLength={1} className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                    <input type="text" maxLength={1} className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                    <input type="text" maxLength={1} className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                    <input type="text" maxLength={1} className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                </div>
                <p className='text-sm text-muted-foreground'>
                    Didn't receive the code? <span className='text-primary'>Resend</span>
                </p>
            </div>
            <div className='mt-8'>
                <button type="button" className="w-full bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors hover:bg-primary/90 cursor-pointer">
                    Verify Email
                </button>
            </div>
        </OnboardingLayout>
    )
}

export default Page3