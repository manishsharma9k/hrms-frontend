import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Building2, Briefcase, Phone, IndianRupee, Edit3, Save, X, Camera, Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyProfile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const fileRef = useRef(null);

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', designation: '', department: '', photo: '' });
    const [departments, setDepartments] = useState([]);

    const [showPwdForm, setShowPwdForm] = useState(false);
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdSaving, setPwdSaving] = useState(false);
    const [showPwd, setShowPwd] = useState({ cur: false, new: false, con: false });

    const openEdit = () => {
        setForm({ name: user?.name || '', phone: user?.phone || '', designation: user?.designation || '', department: user?.department?._id || '', photo: user?.photo || '' });
        setEditMode(true);
    };

    useEffect(() => {
        authAPI.getDepartments().then(r => setDepartments(r.data.data || [])).catch(() => {});
    }, []);

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 400 / img.width);
            canvas.width = img.width * scale; canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            setForm(f => ({ ...f, photo: canvas.toDataURL('image/jpeg', 0.75) }));
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Name cannot be empty');
        setSaving(true);
        try {
            await updateProfile({ name: form.name.trim(), phone: form.phone, designation: form.designation, department: form.department, photo: form.photo });
            toast.success('Profile updated successfully ✓');
            setEditMode(false);
        } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
        if (pwdForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
        setPwdSaving(true);
        try {
            await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
            toast.success('Password changed successfully ✓');
            setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPwdForm(false);
        } catch (err) { toast.error(err?.response?.data?.error || 'Failed to change password'); }
        finally { setPwdSaving(false); }
    };

    const avatarBg = `hsl(${(user?.name || 'A').charCodeAt(0) * 10},65%,55%)`;
    const photo = editMode ? form.photo : user?.photo;

    const infoItems = [
        { icon: <Mail size={15} color="#4F46E5" />, label: 'Email', value: user?.email, editable: false },
        { icon: <Building2 size={15} color="#10B981" />, label: 'Department', value: editMode ? null : (user?.department?.name || '—'), key: 'department', editable: true, type: 'select' },
        { icon: <Briefcase size={15} color="#F59E0B" />, label: 'Designation', value: editMode ? null : (user?.designation || '—'), key: 'designation', editable: true, placeholder: 'e.g. Software Engineer' },
        { icon: <Phone size={15} color="#06B6D4" />, label: 'Phone', value: editMode ? null : (user?.phone || '—'), key: 'phone', editable: true, placeholder: '9876543210', type: 'tel' },
        ...(user?.salary ? [{ icon: <IndianRupee size={15} color="#8B5CF6" />, label: 'Salary', value: `₹${user.salary.toLocaleString('en-IN')}`, editable: false }] : []),
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>

            {/* ── Profile Card ── */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Banner */}
                <div style={{ height: '100px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem' }}>
                        {!editMode ? (
                            <button onClick={openEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                <Edit3 size={13} /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setEditMode(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.875rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                    <X size={13} /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#10B981', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                    {saving ? <><span className="btn-spinner" /> Saving...</> : <><Save size={13} /> Save</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Avatar + Name */}
                <div style={{ padding: '0 1.75rem 1.75rem', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: '-40px', marginBottom: '0.875rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: avatarBg, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                            {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 800, fontSize: '2rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                        {editMode && (
                            <button onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#4F46E5', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Camera size={12} color="#fff" />
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    </div>

                    {editMode ? (
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={50} style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', border: '2px solid #4F46E5', borderRadius: '0.5rem', padding: '0.3rem 0.625rem', outline: 'none', marginBottom: '0.25rem', display: 'block' }} />
                    ) : (
                        <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{user?.name}</h2>
                    )}
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{user?.designation || 'Employee'} · {user?.department?.name || 'N/A'}</p>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                        {infoItems.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.625rem', border: '1px solid #F1F5F9' }}>
                                <div style={{ flexShrink: 0, marginTop: '2px' }}>{item.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '0.62rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                    {editMode && item.editable ? (
                                        item.type === 'select' ? (
                                            <select
                                                value={form[item.key] || ''}
                                                onChange={e => setForm(f => ({ ...f, [item.key]: e.target.value }))}
                                                style={{ marginTop: '0.2rem', width: '100%', fontSize: '0.8rem', fontWeight: 600, color: form[item.key] ? '#0F172A' : '#64748B', border: '1px solid #CBD5E1', borderRadius: '0.375rem', padding: '0.3rem 0.5rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                value={form[item.key] || ''}
                                                onChange={e => setForm(f => ({ ...f, [item.key]: e.target.value }))}
                                                placeholder={item.placeholder}
                                                type={item.type || 'text'}
                                                style={{ marginTop: '0.2rem', width: '100%', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '0.375rem', padding: '0.3rem 0.5rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                                            />
                                        )
                                    ) : (
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Change Password ── */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPwdForm ? '1.25rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}><Shield size={16} color="#EF4444" /></div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Password & Security</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>Change your account password</p>
                        </div>
                    </div>
                    <button onClick={() => setShowPwdForm(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.875rem', background: showPwdForm ? '#F1F5F9' : 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '0.5rem', color: showPwdForm ? '#64748B' : '#EF4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                        {showPwdForm ? <><X size={13} /> Cancel</> : <><Lock size={13} /> Change Password</>}
                    </button>
                </div>

                {showPwdForm && (
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {[
                            { label: 'Current Password', key: 'currentPassword', show: showPwd.cur, toggle: () => setShowPwd(p => ({ ...p, cur: !p.cur })) },
                            { label: 'New Password', key: 'newPassword', show: showPwd.new, toggle: () => setShowPwd(p => ({ ...p, new: !p.new })) },
                            { label: 'Confirm New Password', key: 'confirmPassword', show: showPwd.con, toggle: () => setShowPwd(p => ({ ...p, con: !p.con })) },
                        ].map(f => (
                            <div key={f.key} className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">{f.label}</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={f.show ? 'text' : 'password'} className="form-input" value={pwdForm[f.key]} onChange={e => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))} required minLength={f.key === 'currentPassword' ? 1 : 6} style={{ paddingRight: '2.5rem' }} />
                                    <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                                        {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="submit" disabled={pwdSaving} className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {pwdSaving ? <><span className="btn-spinner" /> Changing...</> : <><CheckCircle size={14} /> Update Password</>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MyProfile;
