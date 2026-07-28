import React, { createContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { setUser, type UserState } from '../features/user.slice'
import { getUserDetails } from '../utils/apiFunctions';

const AuthContext = createContext({
    isLoading: true,
    isLoggedIn: false,
    isOnboarded: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const dispatch = useDispatch();

    const fetUserDetails = async () => {
        setIsLoading(true);
        try {
            const res = await getUserDetails<UserState>('/api/auth/me');
            if (res.data.success) {
                setIsLoggedIn(true);
                setIsOnboarded(res.data?.data?.isCompletedOnboarding || false);
                if (res.data.data) {
                    dispatch(setUser(res.data?.data));
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            fetUserDetails();
        }, 0);

        return () => {
            clearTimeout(timeOutId);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isLoading, isLoggedIn, isOnboarded }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
