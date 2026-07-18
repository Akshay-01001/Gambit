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
    
    useEffect(() => {
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
                setIsLoggedIn(false);
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetUserDetails();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoading, isLoggedIn, isOnboarded} }>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
