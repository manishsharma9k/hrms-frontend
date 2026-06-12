import React, { createContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // Check if already logged in on mount
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                if (localStorage.getItem('token')) {
                    const res = await authAPI.me();
                    setUser(res.data.data);
                }
            } catch {
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();

        // Listen for 401s from interceptor — only logout if token is truly gone
        const handleAuthLogout = () => {
            if (!localStorage.getItem('token')) {
                setUser(null);
            }
        };
        window.addEventListener('auth:logout', handleAuthLogout);
        return () => window.removeEventListener('auth:logout', handleAuthLogout);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await authAPI.login({ email, password });
            localStorage.setItem('token', res.data.token);
            const meRes = await authAPI.me();
            setUser(meRes.data.data);
            return meRes.data.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        }
    };

    const register = async (name, email, password, department, technology, photo) => {
        try {
            setError(null);
            const res = await authAPI.register({ name, email, password, department, technology, role: 'employee', photo });
            localStorage.setItem('token', res.data.token);
            const meRes = await authAPI.me();
            setUser(meRes.data.data);
            return meRes.data.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch {}
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = async (data) => {
        try {
            await authAPI.updateProfile(data);
            const meRes = await authAPI.me();
            setUser(meRes.data.data);
            return meRes.data.data;
        } catch (err) {
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, error, login, register, logout, api, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
