import { useState } from 'react'
import './login.css'
import { Navigate, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../utils/constants';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const baseUrl = API_BASE_URL || 'http://localhost:8000';

    const handleLogoClick = () => {
        navigate("/");
    }

    const redirectAfterAuth = () => {
        window.location.replace('/');
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string | null }) => {
        if (!credentialResponse.credential) {
            setErrorMessage('Google login failed. Please try again.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await axios.post(
                `${baseUrl}/api/auth/google`,
                { idToken: credentialResponse.credential },
                { withCredentials: true }
            );

            redirectAfterAuth();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Google login failed. Please try again.');
            } else {
                setErrorMessage('Google login failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            setErrorMessage('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

            await axios.post(
                `${baseUrl}${endpoint}`,
                { email: email.trim(), password },
                { withCredentials: true }
            );

            redirectAfterAuth();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Authentication failed. Please try again.');
            } else {
                setErrorMessage('Authentication failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoggedIn) {
        return <Navigate to={"/"} />
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

                    <GoogleOAuthProvider clientId='664700514063-n59iij2qkg3tq7ep1590omtvklfh5kr3.apps.googleusercontent.com'>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setErrorMessage('Google login failed. Please try again.')}
                        />
                    </GoogleOAuthProvider>

                    <div className="flex items-center w-full">
                        <div className="grow border-t divider"></div>
                        <span className="px-4 text-xs text-muted">or email</span>
                        <div className="grow border-t divider"></div>
                    </div>

                    {errorMessage && (
                        <div className='rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600'>
                            {errorMessage}
                        </div>
                    )}

                    <form className='flex flex-col gap-4' onSubmit={handleEmailSubmit}>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium input-label'>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className='input-field w-full border rounded-xl px-4 py-2.5 focus:outline-none transition-colors text-sm'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium input-label'>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                className='input-field w-full border rounded-xl px-4 py-2.5 focus:outline-none transition-colors text-sm'
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className='login-button w-full font-semibold rounded-xl py-2.5 mt-4 hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-70'
                        >
                            {isSubmitting ? 'Please wait...' : isLogin ? 'Log in' : 'Sign up'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login