import CountrySelect from './CountrySelect'

const OnboardingPage = () => {
    return (
        <div className='h-screen w-screen bg-background'>
            <div className='mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10 border  border-red-500'>
                <div className='w-full'>
                    <div className='h-1 grid grid-cols-3 gap-2'>
                        <div className='bg-primary rounded-md'></div>
                        <div className='bg-border rounded-md'></div>
                        <div className='bg-border rounded-md'></div>
                    </div>
                    <div className='mt-2 text-sm text-primary font-semibold'>Step 1 Of 3</div>
                </div>
                <div className='mt-6'>
                    <h1 className='text-3xl font-display font-bold'>Tell us about you</h1>
                    <p className='mt-2 text-sm text-muted-foreground'>Pick a username and your country. This shows up next to your rating.</p>
                </div>
                <div className='mt-10'>
                    <form action="" className='mt-10 space-y-6'>
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
            </div >
        </div >
    )
}

export default OnboardingPage