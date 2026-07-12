import { useState } from 'react'
import './login.css'
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate("/");
    }

    return (
        <div className="h-screen w-screen flex login-wrapper overflow-y-auto">
            {/* Left side - Hidden on mobile */}
            <div className="hidden md:flex w-1/2 left-wrapper justify-center relative">
                <div className='flex flex-col mt-10 w-[80%] h-[90%] justify-between'>
                    <div className="w-full flex">
                        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                            <span className="gambit-logo h-10 w-10 flex justify-center items-center rounded-lg">
                                <img src='./logo.svg' alt="logo" className="h-6 w-6" />
                            </span>
                            <span className="font-bold text-xl ml-3 tracking-wide">Gambit</span>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3 mb-12'>
                        <div className='text-5xl font-bold leading-tight tracking-tight'>
                            <h1>The board is set.</h1>
                            <h1 className='heading-bottom'>Your move.</h1>
                        </div>
                        <div className='max-w-sm text-lg footer-text mt-3'>
                            Sign in to save your rating, review your games, and jump straight into a match.
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Full width on mobile, half on desktop */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-10 relative">

                <div className='w-full max-w-sm flex flex-col gap-6'>
                    {/* Mobile Logo */}
                    <div className="md:hidden flex">
                        <div className="flex items-center cursor-pointer">
                            <span className="gambit-logo h-10 w-10 flex justify-center items-center rounded-lg">
                                <img src='./logo.svg' alt="logo" className="h-6 w-6" />
                            </span>
                            <span className="font-bold text-xl ml-3 tracking-wide">Gambit</span>
                        </div>
                    </div>

                    <div className='flex flex-col gap-1 header-right'>
                        <h1 className='text-3xl font-bold tracking-tight'>
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </h1>
                    </div>

                    <div className='w-full flex toggle-container p-1 rounded-xl border'>
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`w-1/2 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${isLogin ? 'toggle-btn-active border shadow-sm text-foreground' : 'toggle-btn'}`}
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`w-1/2 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${!isLogin ? 'toggle-btn-active border shadow-sm text-foreground' : 'toggle-btn'}`}
                        >
                            Sign up
                        </button>
                    </div>

                    <button className='google-btn w-full flex items-center justify-center gap-3 border rounded-xl py-2.5 transition-colors'>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                        <span className='text-sm font-medium'>Continue with Google</span>
                    </button>

                    <div className="flex items-center w-full">
                        <div className="grow border-t divider"></div>
                        <span className="px-4 text-xs text-muted">or email</span>
                        <div className="grow border-t divider"></div>
                    </div>

                    <form className='flex flex-col gap-4' onSubmit={(e) => e.preventDefault()}>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium input-label'>Email</label>
                            <input
                                type="email"
                                className='input-field w-full border rounded-xl px-4 py-2.5 focus:outline-none transition-colors text-sm'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium input-label'>Password</label>
                            <input
                                type="password"
                                className='input-field w-full border rounded-xl px-4 py-2.5 focus:outline-none transition-colors text-sm'
                            />
                        </div>

                        <button className='login-button w-full font-semibold rounded-xl py-2.5 mt-4 hover:opacity-90 transition-opacity cursor-pointer'>
                            {isLogin ? 'Log in' : 'Sign up'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login