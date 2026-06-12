import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, ShieldAlert, ArrowRight, Building } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { api } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setMessage('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/forgotpassword', { email });
            setMessage(res.data.data || 'Password reset link has been sent. Please check your backend console for the link.');
        } catch (err) {
            setLocalError(err.response?.data?.error || 'Something went wrong. Please check your email and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
            
            {/* Left Panel - Branding */}
            <div style={{
                flex: '1.2',
                display: 'none',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '4rem',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }} className="auth-left-panel">
                
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(245, 158, 11, 0.4)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building size={28} color="#F59E0B" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>HRMS Workspace</h1>
                    </div>
                    
                    <div style={{ marginTop: '10vh' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white', letterSpacing: '-1px' }}>
                            Forgot your<br />password?<br />No worries.
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '450px', lineHeight: 1.6 }}>
                            Enter your email address and we will help you securely reset your account password.
                        </p>
                    </div>
                </div>
                
                <div style={{ position: 'relative', zIndex: 1, marginTop: '4rem' }}>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>© 2026 HRMS Inc. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '2rem',
                maxWidth: '600px',
                margin: '0 auto',
                width: '100%',
                backgroundColor: '#ffffff'
            }}>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ 
                            background: 'rgba(245, 158, 11, 0.1)', 
                            width: '50px', height: '50px', 
                            borderRadius: '12px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <ShieldAlert size={24} color="#F59E0B" />
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Reset Password</h2>
                        <p style={{ color: '#6B7280', fontSize: '1rem' }}>Enter the email address associated with your account.</p>
                    </div>

                    {message && (
                        <div style={{ 
                            background: '#ECFDF5', borderLeft: '4px solid #10B981', color: '#065F46', 
                            padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center'
                        }}>
                            {message}
                        </div>
                    )}

                    {localError && (
                        <div style={{ 
                            background: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B', 
                            padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center'
                        }}>
                            {localError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}>
                                    <Mail size={20} strokeWidth={2} />
                                </div>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required maxLength={100}
                                    style={{
                                        width: '100%', padding: '0.875rem 1rem 0.875rem 3rem',
                                        border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem',
                                        outline: 'none', transition: 'all 0.2s', background: '#FFFFFF',
                                        color: '#111827'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ 
                                width: '100%', padding: '0.875rem', marginTop: '1rem',
                                background: '#F59E0B', color: 'white', border: 'none', borderRadius: '0.5rem',
                                fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 2px 4px -1px rgba(245, 158, 11, 0.1)'
                            }}
                            onMouseEnter={(e) => !isLoading && (e.target.style.background = '#D97706', e.target.style.transform = 'translateY(-1px)')}
                            onMouseLeave={(e) => !isLoading && (e.target.style.background = '#F59E0B', e.target.style.transform = 'translateY(0)')}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
                        </button>
                    </form>
                    
                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                            Remember your password? <Link to="/" style={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}>Back to Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
            
            <style>
                {`
                @media (min-width: 1024px) {
                    .auth-left-panel {
                        display: flex !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default ForgotPassword;
