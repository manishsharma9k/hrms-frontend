import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Building, ArrowRight, LogIn, MapPin, CheckCircle, AlertTriangle, X, Eye, EyeOff, QrCode, Copy, Share2, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const inputStyle = {
    width: '100%',
    padding: '0.95rem 3rem',
    border: '1px solid #CBD5E1',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    outline: 'none',
    background: '#fff',
    color: '#0F172A',
    boxSizing: 'border-box',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [locStatus, setLocStatus] = useState('idle');
    const [locCoords, setLocCoords] = useState(null);
    const [showLocModal, setShowLocModal] = useState(true);
    const [showQrModal, setShowQrModal] = useState(false);
    const loginUrl = window.location.origin;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(loginUrl)}`;

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin', { replace: true });
            else navigate('/employee', { replace: true });
        }
    }, [user, navigate]);

    // Show error from Google OAuth redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const googleError = urlParams.get('error');
        if (googleError) {
            setLocalError(decodeURIComponent(googleError));
            window.history.replaceState({}, '', '/');
        }
    }, []);

    const requestLocation = () => {
        if (!navigator.geolocation) { setLocStatus('denied'); setShowLocModal(false); return; }
        setLocStatus('requesting');
        setShowLocModal(false);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const latStr = lat.toFixed(6);
                const lngStr = lng.toFixed(6);
                let address = `${latStr}, ${lngStr}`;
                let fullAddress = {};
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const a = data.address || {};
                    fullAddress = {
                        road: a.road || a.pedestrian || a.footway || a.path || '',
                        area: a.suburb || a.neighbourhood || a.quarter || a.village || a.county || '',
                        city: a.city || a.town || a.district || '',
                        state: a.state || '',
                        pincode: a.postcode || '',
                        country: a.country || '',
                        display: data.display_name || '',
                    };
                    address = [fullAddress.road, fullAddress.area, fullAddress.city, fullAddress.state, fullAddress.pincode].filter(Boolean).join(', ');
                } catch {}
                setLocCoords({ lat: latStr, lng: lngStr, address, fullAddress });
                setLocStatus('granted');
            },
            () => setLocStatus('denied'),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const denyLocation = () => {
        setLocStatus('denied');
        setShowLocModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');
        setShowConfirm(true);
    };

    const handleConfirmLogin = async () => {
        setShowConfirm(false);
        setIsLoading(true);
        try {
            const signedInUser = await login(email, password);
            if (signedInUser.role === 'admin') {
                toast.error('Please use the Admin Login portal.');
                setLocalError('This portal is for employees only. Use Admin Login.');
                setIsLoading(false);
                return;
            }
            if (locCoords) localStorage.setItem('loginLocation', JSON.stringify(locCoords));
            toast.success(`Welcome back, ${signedInUser.name}!`);
            navigate('/employee');
        } catch {
            setLocalError('Invalid email or password');
            toast.error('Invalid email or password');
            setIsLoading(false);
        }
    };

    const locBanner = () => {
        if (locStatus === 'requesting') return { bg: '#EEF2FF', border: '#C7D2FE', color: '#4338CA', icon: <MapPin size={16} />, text: 'Requesting location access...' };
        if (locStatus === 'granted') return { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857', icon: <CheckCircle size={16} />, text: `Location verified - ${locCoords?.address || `${locCoords?.lat}, ${locCoords?.lng}`}` };
        if (locStatus === 'denied') return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: <AlertTriangle size={16} />, text: 'Location access denied - required to sign in' };
        return null;
    };
    const banner = locBanner();

    const focusInput = (e) => {
        e.target.style.borderColor = '#4F46E5';
        e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.1)';
    };

    const blurInput = (e) => {
        e.target.style.borderColor = '#CBD5E1';
        e.target.style.boxShadow = 'none';
    };

    const copyLoginLink = async () => {
        try {
            await navigator.clipboard?.writeText(loginUrl);
            toast.success('Login link copied');
        } catch {
            toast.error('Could not copy link');
        }
    };

    const shareLoginQr = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'HRMS Employee Login', text: 'Scan or open this link to access HRMS Employee Login.', url: loginUrl });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }
        copyLoginLink();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {showLocModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.68)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', width: '100%', maxWidth: '380px', boxShadow: '0 30px 80px rgba(15,23,42,0.28)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ background: 'linear-gradient(135deg,#111827,#4338CA)', padding: '2rem 2rem 1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <MapPin size={30} color="#fff" />
                            </div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Location Access Required</p>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>HRMS needs your location to verify attendance when you sign in.</p>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <ul style={{ textAlign: 'left', margin: '0 0 1.5rem', padding: '0 0 0 1.25rem', fontSize: '0.84rem', color: '#475569', lineHeight: 2 }}>
                                <li>Attendance verification</li>
                                <li>Secure sign-in tracking</li>
                                <li>Location is never shared publicly</li>
                            </ul>
                            <button onClick={requestLocation} style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg,#4F46E5,#4338CA)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.625rem', boxShadow: '0 14px 28px rgba(79,70,229,0.25)' }}>
                                <MapPin size={16} /> Allow Location
                            </button>
                            <button onClick={denyLocation} style={{ width: '100%', padding: '0.7rem', background: '#fff', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '0.7rem', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer' }}>
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.58)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', width: '100%', maxWidth: '390px', boxShadow: '0 30px 80px rgba(15,23,42,0.24)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.75rem 1.75rem 0' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '0.9rem', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <LogIn size={22} color="#4F46E5" />
                            </div>
                            <p style={{ margin: '0 0 0.375rem', fontWeight: 800, fontSize: '1.08rem', color: '#0F172A' }}>Confirm Sign In</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>Sign in as <strong>{email}</strong>?</p>
                            {locCoords && (
                                <div style={{ margin: '0.75rem 0 0', padding: '0.65rem 0.8rem', background: '#F0FDF4', borderRadius: '0.7rem', border: '1px solid #BBF7D0' }}>
                                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} /> Location Captured</p>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#065F46', lineHeight: 1.5 }}>{locCoords.address}</p>
                                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.66rem', color: '#64748B', fontFamily: 'monospace' }}>{locCoords.lat}, {locCoords.lng}</p>
                                </div>
                            )}
                            <p style={{ margin: '0.7rem 0 0', fontSize: '0.76rem', color: '#94A3B8' }}>Make sure you are on a trusted device.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem 1.75rem' }}>
                            <button onClick={() => setShowConfirm(false)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.7rem', background: '#F1F5F9', border: 'none', borderRadius: '0.65rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B', cursor: 'pointer' }}>
                                <X size={14} /> Cancel
                            </button>
                            <button onClick={handleConfirmLogin} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.7rem', background: '#4F46E5', border: 'none', borderRadius: '0.65rem', fontSize: '0.875rem', fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '0 10px 20px rgba(79,70,229,0.22)' }}>
                                <LogIn size={14} /> Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showQrModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(10px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setShowQrModal(false)}>
                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', width: '100%', maxWidth: '390px', boxShadow: '0 30px 80px rgba(15,23,42,0.26)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem', borderBottom: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: '0.7rem', background: '#EEF2FF', color: '#4F46E5' }}><QrCode size={19} /></div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 900, fontSize: '0.96rem', color: '#0F172A' }}>Employee Login QR</p>
                                    <p style={{ margin: '0.1rem 0 0', color: '#64748B', fontSize: '0.75rem' }}>Scan to open the employee portal</p>
                                </div>
                            </div>
                            <button onClick={() => setShowQrModal(false)} style={{ width: 32, height: 32, borderRadius: '0.55rem', border: 'none', background: '#F8FAFC', color: '#64748B', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '0.9rem', background: '#fff' }}>
                                <img src={qrUrl} alt="HRMS employee login QR code" style={{ width: 210, height: 210, display: 'block' }} />
                            </div>
                            <input readOnly value={loginUrl} style={{ width: '100%', padding: '0.72rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.7rem', fontSize: '0.82rem', color: '#475569', boxSizing: 'border-box', outline: 'none' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', width: '100%' }}>
                                <button type="button" onClick={copyLoginLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.7rem', color: '#475569', fontWeight: 800, cursor: 'pointer' }}><Copy size={15} /> Copy</button>
                                <button type="button" onClick={shareLoginQr} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '0.7rem', color: '#4338CA', fontWeight: 800, cursor: 'pointer' }}><Share2 size={15} /> Share</button>
                                <a href={qrUrl} download="hrms-login-qr.png" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '0.7rem', color: '#047857', fontWeight: 800, textDecoration: 'none' }}><Download size={15} /> QR</a>
                                <a href={loginUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.7rem', color: '#0F172A', fontWeight: 800, textDecoration: 'none' }}><ExternalLink size={15} /> Open</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ flex: '0 0 min(48vw, 760px)', display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(2.5rem, 4vw, 4.25rem)', background: 'linear-gradient(145deg,#111827 0%,#312E81 52%,#4F46E5 100%)', color: 'white', position: 'relative', overflow: 'hidden' }} className="auth-left-panel">
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 22% 22%, rgba(255,255,255,0.14), transparent 28%), radial-gradient(circle at 82% 80%, rgba(14,165,233,0.22), transparent 34%)' }} />
                <div style={{ position: 'absolute', inset: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.4rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.96)', padding: '0.56rem', borderRadius: '0.8rem', display: 'flex', boxShadow: '0 18px 36px rgba(15,23,42,0.18)' }}><Building size={26} color="#4F46E5" /></div>
                        <h1 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', fontWeight: 800, margin: 0, color: 'white' }}>HRMS Workspace</h1>
                    </div>
                    <div style={{ marginTop: '5vh' }}>
                        <h2 style={{ fontSize: 'clamp(2.8rem, 4.8vw, 4.25rem)', fontWeight: 900, lineHeight: 1.04, margin: '0 0 1.25rem', color: 'white' }}>
                            Your work,<br />your way,<br />every day.
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.76)', maxWidth: '420px', lineHeight: 1.6, margin: 0 }}>
                            Track attendance, apply for leaves, and view your salary - all in one focused workspace.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.65rem', maxWidth: '420px', marginTop: '2rem' }}>
                            {['Attendance', 'Leave', 'Payroll'].map(item => (
                                <div key={item} style={{ border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.08)', borderRadius: '0.7rem', padding: '0.7rem 0.8rem', color: 'rgba(255,255,255,0.88)', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <p style={{ position: 'relative', zIndex: 1, fontSize: '0.84rem', color: 'rgba(255,255,255,0.58)', margin: 0 }}>© 2026 HRMS Inc. All rights reserved.</p>
            </div>

            <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(1.25rem, 4vw, 3.5rem)', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
                <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: 'clamp(1.5rem, 4vw, 2.4rem)', boxShadow: '0 24px 70px rgba(15,23,42,0.08)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EEF2FF', color: '#4338CA', padding: '0.45rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '1.2rem', border: '1px solid #E0E7FF' }}>
                        <Building size={14} /> Employee Portal
                    </div>

                    <h2 style={{ fontSize: 'clamp(2.1rem, 5vw, 3rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 0.45rem', lineHeight: 1.05 }}>Welcome back</h2>
                    <p style={{ color: '#64748B', fontSize: '1.02rem', margin: '0 0 1.7rem', lineHeight: 1.55 }}>Sign in to your employee account.</p>

                    {banner && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', padding: '0.9rem 1rem', background: banner.bg, border: `1px solid ${banner.border}`, borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: banner.color, fontWeight: 700, lineHeight: 1.45 }}>
                            {banner.icon} <span>{banner.text}</span>
                        </div>
                    )}

                    {(error || localError) && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '0.875rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            {localError || error}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/api/auth/google`}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            width: '100%', padding: '0.85rem', marginBottom: '1.25rem',
                            background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '0.75rem',
                            fontSize: '0.95rem', fontWeight: 700, color: '#0F172A',
                            textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            cursor: 'pointer', transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Continue with Google
                    </a>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.55rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#94A3B8', display: 'flex' }}><Mail size={20} /></div>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required maxLength={100} style={{ ...inputStyle, paddingLeft: '3rem', paddingRight: '1rem' }} onFocus={focusInput} onBlur={blurInput} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.55rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>Password</label>
                                <Link to="/forgotpassword" style={{ fontSize: '0.88rem', color: '#4F46E5', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Forgot password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#94A3B8', display: 'flex' }}><Lock size={20} /></div>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} maxLength={32} style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                                <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.95rem', marginTop: '0.5rem', background: 'linear-gradient(135deg,#4F46E5,#4338CA)', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 16px 32px rgba(79,70,229,0.28)' }}>
                            {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                        </button>

                        {locStatus !== 'granted' && locStatus !== 'requesting' && (
                            <button type="button" onClick={() => setShowLocModal(true)} style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '0.75rem', fontSize: '0.92rem', fontWeight: 800, color: '#4338CA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} /> Allow Location (Optional)
                            </button>
                        )}
                    </form>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
                        <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                            New to HRMS? <Link to="/employee-register" style={{ color: '#4F46E5', fontWeight: 800, textDecoration: 'none' }}>Register as Employee</Link>
                        </p>
                        <button type="button" onClick={() => setShowQrModal(true)} style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.58rem 0.85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.7rem', color: '#475569', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}>
                            <QrCode size={15} /> Share Login QR
                        </button>
                        {/* <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                            Are you an admin? <Link to="/admin-login" style={{ color: '#7C3AED', fontWeight: 800, textDecoration: 'none' }}>Admin Login -&gt;</Link>
                        </p> */}
                    </div>
                </div>
            </div>

            <style>{`
                @media(min-width:1024px){.auth-left-panel{display:flex!important}}
            `}</style>
        </div>
    );
};

export default Login;
