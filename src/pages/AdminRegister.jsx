import React, { useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight, User, KeyRound, Camera } from 'lucide-react';

const AdminRegister = () => {
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', adminSecret: '' });
    const [photo, setPhoto] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileRef = useRef();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setLocalError('Photo must be under 2MB'); return; }
        const reader = new FileReader();
        reader.onloadend = () => { setPhoto(reader.result); setPhotoPreview(reader.result); };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/admin/register', { ...formData, photo });
            // Don't store token or auto-login — redirect to admin login
            navigate('/admin-login', { state: { success: 'Admin account created! Please sign in.' } });
        } catch (err) {
            setLocalError(err.response?.data?.error || 'Registration failed');
            setIsLoading(false);
        }
    };

    const inputStyle = { width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', outline: 'none', background: '#FFFFFF', color: '#111827', boxSizing: 'border-box' };
    const onFocus = (e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'; };
    const onBlur = (e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
            <div style={{ flex: '1.2', display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: '4rem', background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)', color: 'white', position: 'relative', overflow: 'hidden' }} className="auth-left-panel">
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(124,58,237,0.4)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}><Shield size={28} color="#7C3AED" /></div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'white' }}>HRMS Admin</h1>
                    </div>
                    <div style={{ marginTop: '10vh' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white', letterSpacing: '-1px' }}>Create your<br />Admin<br />Account.</h2>
                        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '450px', lineHeight: 1.6 }}>Admin accounts require a secret key. Contact your system administrator to get access.</p>
                    </div>
                </div>
                <p style={{ position: 'relative', zIndex: 1, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>© 2026 HRMS Inc. All rights reserved.</p>
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.08)', color: '#7C3AED', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                            <Shield size={14} /> Admin Portal
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Create Admin Account</h2>
                        <p style={{ color: '#6B7280', fontSize: '1rem' }}>Fill in your details and provide the admin secret key.</p>
                    </div>

                    {localError && (
                        <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {localError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {/* Photo Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div onClick={() => fileRef.current.click()} style={{ width: '90px', height: '90px', borderRadius: '50%', background: photoPreview ? 'transparent' : 'linear-gradient(135deg,#7C3AED,#4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '3px solid #7C3AED', position: 'relative' }}>
                                {photoPreview ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={36} color="white" />}
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#7C3AED', borderRadius: '50%', padding: '4px', display: 'flex' }}><Camera size={14} color="white" /></div>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Click to upload photo (max 2MB)</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><User size={20} /></div>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Admin" required maxLength={50} minLength={2} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><Mail size={20} /></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@company.com" required maxLength={100} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><Lock size={20} /></div>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} maxLength={32} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Admin Secret Key</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><KeyRound size={20} /></div>
                                <input type="password" name="adminSecret" value={formData.adminSecret} onChange={handleChange} placeholder="Enter secret key" required maxLength={64} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.4rem' }}>Contact your system administrator for the secret key.</p>
                        </div>

                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(124,58,237,0.3)' }}>
                            {isLoading ? 'Creating Account...' : 'Create Admin Account'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Already have an account? <Link to="/admin-login" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link></p>
                    </div>
                </div>
            </div>

            <style>{`@media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }`}</style>
        </div>
    );
};

export default AdminRegister;
