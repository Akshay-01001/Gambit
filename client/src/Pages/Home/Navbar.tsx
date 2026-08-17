import { useNavigate } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useEffect, useRef, useState } from 'react';
import { logout } from '../../utils/apiFunctions';

const Navbar = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const { user } = useSelector((state: RootState) => state)
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isPopOverOpen, setIsPopOverOpen] = useState(false);
    const { setIsLoggedIn } = useAuth();
    const dispatch = useDispatch();

    const handleLoginButtonClick = () => {
        navigate("/login")
    }

    useEffect(() => {
        if (!isPopOverOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                popoverRef.current?.contains(target) ||
                dropdownRef.current?.contains(target)
            ) return;

            setIsPopOverOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopOverOpen]);

    const handleLogout = async () => {
        try {
            const response = await logout("/api/auth/logout");
            if (response.data.success) {
                setIsLoggedIn(false)
                navigate("/login");
                dispatch({ type: "LOG_OUT" });
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="w-full h-16 flex items-center justify-between px-6 md:px-10 border-b z-50 sticky top-0 backdrop-blur-md home-navbar bg-background/80">
            {/* Left: Logo */}
            <div className="flex items-center cursor-pointer">
                <span className="gambit-logo h-9 w-9 flex justify-center items-center p-1 rounded-md">
                    <img src='/logo.svg' alt="logo" className="h-full w-full" />
                </span>
                <span className="font-bold text-xl ml-3 tracking-wide home-text-primary">Gambit</span>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center justify-center gap-8 flex-1">
                <a href="#" className="font-medium hover:opacity-75 transition-opacity home-text-primary">Home</a>
            </div>

            {/* Right: Auth Buttons */}
            {(!auth.isLoggedIn && !auth.isLoading) &&
                <div className="flex items-center justify-end gap-4 md:gap-6">
                    <button className="px-4 py-1.5 md:px-5 md:py-2 rounded-md font-bold transition-opacity hover:opacity-90 home-btn-primary" onClick={handleLoginButtonClick}>Login</button>
                </div>
            }
            {
                auth.isLoggedIn &&
                <div className="flex items-center gap-3 text-sm cursor-pointer px-2 py-1 hover:bg-accent hover:rounded-md" ref={dropdownRef} onClick={() => setIsPopOverOpen(prev => !prev)}>
                    <img src={user.avatarUrl} className='h-6 w-6 rounded-full' alt="" />
                    <span>{user.username}</span>
                </div>
            }
            {auth.isLoggedIn && <div className={`
                        absolute top-13 right-5 z-50 w-48 overflow-hidden rounded-md
                        bg-popover shadow-md origin-top-right
                        transition-all duration-200 ease-out
                        ${isPopOverOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }
                    `}
                ref={popoverRef}
            >
                <button className='flex h-10 w-full items-center gap-2 border-t px-3 text-left cursor-pointer hover:bg-accent'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user mr-2 h-4 w-4" aria-hidden="true">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <p className='text-sm'>Profile</p>
                </button>
                <button className='flex h-10 w-full items-center gap-2 px-3 text-left cursor-pointer hover:bg-accent' onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-out mr-2 h-4 w-4" aria-hidden="true">
                        <path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    </svg>
                    <p className='text-sm'>Sign out</p>
                </button>
            </div>}
        </div>
    )
}

export default Navbar