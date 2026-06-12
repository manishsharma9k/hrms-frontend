import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight, LogIn, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const successMsg = location.state?.success || '';
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin', { replace: true });
            else navigate('/employee', { replace: true });
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');
        setShowConfirm(true);
    };

    const handleConfirmLogin = async () => {
        setShowConfirm(false);
        setIsLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'admin') {
                toast.success(`Welcome, Admin ${user.name}! 🛡️`);
                navigate('/admin');
            } else {
                setLocalError('Access denied. This portal is for admins only.');
                toast.error('Access denied. Admins only.');
                setIsLoading(false);
            }
        } catch {
            setLocalError('Invalid email or password');
            toast.error('Invalid email or password');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
            {showConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '380px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.75rem 1.75rem 0' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <Shield size={22} color="#7C3AED" />
                            </div>
                            <p style={{ margin: '0 0 0.375rem', fontWeight: 700, fontSize: '1.05rem', color: '#0F172A' }}>Confirm Admin Sign In</p>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>Sign in as admin with <strong>{email}</strong>?</p>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>Admin access grants full control over the system. Ensure this is you.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem 1.75rem' }}>
                            <button onClick={() => setShowConfirm(false)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.625rem', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}><X size={14} /> Cancel</button>
                            <button onClick={handleConfirmLogin} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.625rem', background: '#7C3AED', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}><LogIn size={14} /> Yes, Sign In</button>
                        </div>
                    </div>
                </div>
            )}
            <div style={{
                flex: '1.2', display: 'none', flexDirection: 'column',
                justifyContent: 'space-between', padding: '4rem',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                color: 'white', position: 'relative', overflow: 'hidden'
            }} className="auth-left-panel">
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(124, 58, 237, 0.4)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={28} color="#7C3AED" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>HRMS Admin</h1>
                    </div>
                    <div style={{ marginTop: '10vh' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white', letterSpacing: '-1px' }}>
                            Admin Control<br />Panel.<br />Secured.
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '450px', lineHeight: 1.6 }}>
                            Manage employees, approve leaves, oversee departments and keep your organization running smoothly.
                        </p>
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '4px', background: 'white', borderRadius: '2px' }}></div>
                        <div style={{ width: '20px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                        <div style={{ width: '20px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>© 2026 HRMS Inc. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{
                flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%', backgroundColor: '#ffffff'
            }}>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.08)', color: '#7C3AED', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                            <Shield size={14} /> Admin Portal
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Admin Sign In</h2>
                        <p style={{ color: '#6B7280', fontSize: '1rem' }}>Enter your admin credentials to continue.</p>
                    </div>

                    {successMsg && (
                        <div style={{ background: '#F0FDF4', borderLeft: '4px solid #10B981', color: '#065F46', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            ✅ {successMsg}
                        </div>
                    )}

                    {(error || localError) && (
                        <div style={{
                            background: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B',
                            padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem'
                        }}>
                            {localError || error}
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
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@company.com" required maxLength={100}
                                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', background: '#FFFFFF', color: '#111827' }}
                                    onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Password</label>
                                <Link to="/forgotpassword" style={{ fontSize: '0.875rem', color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}>
                                    <Lock size={20} strokeWidth={2} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" required minLength={6} maxLength={32}
                                    style={{ width: '100%', padding: '0.875rem 3rem 0.875rem 3rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', background: '#FFFFFF', color: '#111827' }}
                                    onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            style={{
                                width: '100%', padding: '0.875rem', marginTop: '1rem',
                                background: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.5rem',
                                fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(124,58,237,0.3)'
                            }}
                            onMouseEnter={(e) => !isLoading && (e.target.style.background = '#6D28D9')}
                            onMouseLeave={(e) => !isLoading && (e.target.style.background = '#7C3AED')}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In as Admin'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                            New admin? <Link to="/admin-register" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                        </p>
                        
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }
            `}</style>
        </div>
    );
};

export default AdminLogin;
