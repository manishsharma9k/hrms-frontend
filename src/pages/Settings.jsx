import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase, Lock, Camera, Save, Eye, EyeOff, CheckCircle, Building2, IndianRupee, Calendar } from 'lucide-react';
import { authAPI } from '../services/api';

const Settings = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const fileRef = useRef();
    const [tab, setTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [profile, setProfile] = useState({ name: '', phone: '', designation: '', photo: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        if (user) setProfile({ name: user.name || '', phone: user.phone || '', designation: user.designation || '', photo: user.photo || '' });
    }, [user]);

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setMsg({ type: 'error', text: 'Photo must be under 2MB' }); return; }
        // Compress to max 400px wide before storing as base64
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 400 / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setProfile(p => ({ ...p, photo: compressed }));
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await updateProfile({ name: profile.name, phone: profile.phone, designation: profile.designation, photo: profile.photo });
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) { setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to update profile' }); }
        setSaving(false);
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) { setMsg({ type: 'error', text: 'New passwords do not match' }); return; }
        if (passwords.newPassword.length < 6) { setMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return; }
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            setMsg({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password' }); }
        setSaving(false);
    };

    const isAdmin = user?.role === 'admin';
    const accent = isAdmin ? '#7C3AED' : '#4F46E5';

    const PwdInput = ({ label, field, placeholder }) => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd[field] ? 'text' : 'password'} value={passwords[field]} onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}>
                    {showPwd[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Settings</h2>
                    <p className="page-subtitle">Manage your profile, security and preferences</p>
                </div>
            </div>

            {/* Profile Banner */}
            <div className="card" style={{ padding: '1.5rem', background: `linear-gradient(135deg, ${accent}12, ${accent}06)`, border: `1px solid ${accent}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg,${accent},${accent}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${accent}40` }}>
                            {profile.photo ? <img src={profile.photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <button onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, background: accent, border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex' }}>
                            <Camera size={12} color="white" />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{user?.name}</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748B' }}>ID: <strong style={{ color: '#0F172A', marginLeft: '0.35rem', fontFamily: 'monospace' }}>{user?.employeeId || '—'}</strong></p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Mail size={13} />{user?.email}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ background: `${accent}15`, color: accent, fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', textTransform: 'capitalize' }}>{user?.role}</span>
                            {user?.department?.name && <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>{user.department.name}</span>}
                            {user?.designation && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>{user.designation}</span>}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {[
                            { icon: <Building2 size={14} />, label: 'Department', value: user?.department?.name || '—' },
                            { icon: <Phone size={14} />, label: 'Phone', value: user?.phone || '—' },
                            ...(user?.salary ? [{ icon: <IndianRupee size={14} />, label: 'Salary', value: `₹${user.salary.toLocaleString('en-IN')}` }] : []),
                            { icon: <Calendar size={14} />, label: 'Joined', value: user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>{item.icon}{item.label}</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '0.625rem', width: 'fit-content' }}>
                {[{ id: 'profile', label: 'Edit Profile', icon: <User size={14} /> }, { id: 'password', label: 'Change Password', icon: <Lock size={14} /> }].map(t => (
                    <button key={t.id} onClick={() => { setTab(t.id); setMsg({ type: '', text: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? accent : '#64748B', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {/* Message */}
            {msg.text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: msg.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: msg.type === 'success' ? '#065F46' : '#991B1B', fontSize: '0.85rem', fontWeight: 500, border: `1px solid ${msg.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
                    <CheckCircle size={16} />{msg.text}
                </div>
            )}

            {/* Profile Form */}
            {tab === 'profile' && (
                <div className="card" style={{ padding: '1.5rem', maxWidth: '600px' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Personal Information</h3>
                    <form onSubmit={saveProfile}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" style={{ paddingLeft: '2.25rem' }} required maxLength={50} minLength={2} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input className="form-input" value={user?.email || ''} disabled style={{ paddingLeft: '2.25rem', background: '#F8FAFC', color: '#94A3B8' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        className="form-input"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={e => {
                                            const val = e.target.value.replace(/[^0-9+]/g, '');
                                            if (val.length <= 13) setProfile(p => ({ ...p, phone: val }));
                                        }}
                                        placeholder="9876543210"
                                        style={{ paddingLeft: '2.25rem' }}
                                        maxLength={13}
                                        minLength={10}
                                        pattern="[0-9+]{10,13}"
                                        title="Enter 10-digit mobile number"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Designation</label>
                                <div style={{ position: 'relative' }}>
                                    <Briefcase size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input className="form-input" value={profile.designation} onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Software Engineer" style={{ paddingLeft: '2.25rem' }} maxLength={60} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ background: accent, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {saving ? <><span className="btn-spinner" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Password Form */}
            {tab === 'password' && (
                <div className="card" style={{ padding: '1.5rem', maxWidth: '480px' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Change Password</h3>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: '#64748B' }}>Use a strong password with at least 6 characters.</p>
                    <form onSubmit={savePassword}>
                        <PwdInput label="Current Password" field="current" placeholder="Enter current password" />
                        <PwdInput label="New Password" field="new" placeholder="Enter new password" />
                        <PwdInput label="Confirm New Password" field="confirm" placeholder="Confirm new password" />
                        {passwords.newPassword && passwords.confirmPassword && (
                            <div style={{ marginBottom: '1rem', fontSize: '0.78rem', color: passwords.newPassword === passwords.confirmPassword ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle size={13} />{passwords.newPassword === passwords.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </div>
                        )}
                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ background: accent }}>
                            <Lock size={15} />{saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
