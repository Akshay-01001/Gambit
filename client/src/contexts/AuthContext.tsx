import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { API_BASE_URL } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user.slice'

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
            const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsLoggedIn(true);
                setIsOnboarded(res.data.data.isCompletedOnboarding);
                dispatch(
                    setUser(res.data.data)
                )
            }
        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                try {
                    const refreshRes = await axios.get(`${API_BASE_URL}/api/auth/refresh`, {
                        withCredentials: true
                    });
                    if (refreshRes.data.success) {
                        const retryRes = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                            withCredentials: true
                        });
                        if (retryRes.data.success) {
                            setIsLoggedIn(true);
                            setIsOnboarded(retryRes.data.data.isCompletedOnboarding);
                            dispatch(
                                setUser(retryRes.data.data)
                            )
                        }
                    }
                } catch {
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
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
