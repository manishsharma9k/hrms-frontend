import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            toast.error(decodeURIComponent(error));
            navigate('/');
            return;
        }

        if (token) {
            localStorage.setItem('token', token);
            authAPI.me().then(res => {
                setUser(res.data.data);
                toast.success(`Welcome back, ${res.data.data.name}!`);
                navigate('/employee');
            }).catch(() => {
                localStorage.removeItem('token');
                toast.error('Google login failed. Try again.');
                navigate('/');
            });
        } else {
            navigate('/');
        }
    }, []);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', border: '3px solid #EDE9FE', borderTop: '3px solid #4F46E5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ color: '#64748B', fontWeight: 600 }}>Signing you in with Google...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default GoogleAuthSuccess;
