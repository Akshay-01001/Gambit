import React, { createContext, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { setUser, type UserState } from '../features/user.slice'
import { getUserDetails } from '../utils/apiFunctions';

type AuthContextType = {
    isLoading: boolean;
    isLoggedIn: boolean;
    isOnboarded: boolean;
    isEmailVerified: boolean;
    fetchUserDetails: () => Promise<void>;
    setIsLoggedIn: (value: boolean) => void
    setIsEmailVerified: (value: boolean) => void
};

const AuthContext = createContext<AuthContextType>({
    isLoading: true,
    isLoggedIn: false,
    isOnboarded: false,
    isEmailVerified: false,
    fetchUserDetails: async () => { },
    setIsLoggedIn: () => { },
    setIsEmailVerified: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const dispatch = useDispatch();

    const fetchUserDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getUserDetails<UserState>('/api/auth/me');
            if (res.data.success) {
                setIsLoggedIn(true);
                setIsOnboarded(res.data?.data?.isCompletedOnboarding || false);
                setIsEmailVerified(res?.data?.data?.isVerified || false)
                if (res.data.data) {
                    dispatch(setUser(res.data?.data));
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            fetchUserDetails();
        }, 0);

        return () => {
            clearTimeout(timeOutId);
        };
    }, [fetchUserDetails]);

    const value = {
        isLoading,
        isLoggedIn,
        isOnboarded,
        isEmailVerified,
        fetchUserDetails,
        setIsLoggedIn,
        setIsEmailVerified
    }

    return (
        <AuthContext value={value}>
            {children}
        </AuthContext>
    )
}

export default AuthContext;
