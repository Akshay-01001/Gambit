import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { API_BASE_URL } from '../utils/constants';

const AuthContext = createContext({
    isLoading: true,
    isLoggedIn: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetUserDetails = async () => {
            setIsLoading(true);
            try {
                const data = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    withCredentials: true
                });
                if (data.data.success) {
                    setIsLoggedIn(true)
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
        <AuthContext.Provider value={{ isLoading, isLoggedIn} }>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
