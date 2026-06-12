import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Mail, Lock, Building, ArrowRight, User, Camera, Eye, EyeOff } from 'lucide-react';

// Department name se technology mapping (case-insensitive partial match)
const DEPT_TECH_MAP = {
    'engineering':      ['React', 'Node.js', 'Angular', 'Vue.js', 'Python', 'Java', 'C#', 'DevOps', 'TypeScript', 'Go'],
    'it':               ['React', 'Node.js', 'Python', 'Java', 'DevOps', 'C#', 'TypeScript', 'Linux', 'Networking', 'Cybersecurity'],
    'it support':       ['Linux', 'Networking', 'Cybersecurity', 'Windows Server', 'DevOps', 'Cloud (AWS)', 'Python'],
    'human resources':  ['HR Software', 'Excel / Sheets', 'Zoho People', 'BambooHR', 'Darwinbox', 'SAP HR'],
    'hr':               ['HR Software', 'Excel / Sheets', 'Zoho People', 'BambooHR', 'Darwinbox', 'SAP HR'],
    'finance':          ['Tally', 'SAP FICO', 'Excel / Sheets', 'QuickBooks', 'Zoho Books', 'Power BI'],
    'accounts':         ['Tally', 'SAP FICO', 'Excel / Sheets', 'QuickBooks', 'Zoho Books'],
    'marketing':        ['Google Ads', 'Meta Ads', 'SEO / SEM', 'Content Marketing', 'Canva', 'HubSpot', 'Mailchimp'],
    'sales':            ['Salesforce', 'Zoho CRM', 'HubSpot CRM', 'Excel / Sheets', 'Cold Calling', 'Lead Generation'],
    'operations':       ['Excel / Sheets', 'ERP Systems', 'SAP', 'Power BI', 'Tableau', 'Lean / Six Sigma'],
    'design':           ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Sketch', 'InVision'],
    'ui':               ['Figma', 'Adobe XD', 'UI/UX', 'Sketch', 'Photoshop', 'Illustrator'],
    'ux':               ['Figma', 'Adobe XD', 'UI/UX', 'User Research', 'Prototyping'],
    'data':             ['Python', 'Data Science', 'Machine Learning', 'SQL', 'Power BI', 'Tableau', 'R'],
    'analytics':        ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel / Sheets', 'Data Science'],
    'devops':           ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
    'product':          ['Product Management', 'Jira', 'Figma', 'Agile / Scrum', 'Roadmapping'],
    'customer':         ['CRM Tools', 'Zendesk', 'Freshdesk', 'Communication', 'Excel / Sheets'],
    'legal':            ['Legal Research', 'MS Word', 'Contract Management', 'ComplianceTools'],
    'admin':            ['MS Office', 'Excel / Sheets', 'Tally', 'Communication', 'Scheduling Tools'],
};

const DEFAULT_TECHS = ['React', 'Node.js', 'Angular', 'Vue.js', 'Python', 'Java', 'C#', 'DevOps', 'UI/UX', 'Data Science'];

const STATIC_DEPARTMENTS = [
    'Engineering',
    'IT Support',
    'Human Resources',
    'Finance',
    'Accounts',
    'Marketing',
    'Sales',
    'Operations',
    'Design',
    'Data & Analytics',
    'DevOps',
    'Product Management',
    'Customer Support',
    'Legal',
    'Administration',
];

const getTechsForDept = (deptName) => {
    if (!deptName) return [];
    const lower = deptName.toLowerCase();
    for (const key of Object.keys(DEPT_TECH_MAP)) {
        if (lower.includes(key)) return DEPT_TECH_MAP[key];
    }
    return DEFAULT_TECHS;
};

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', technology: '' });
    const [photo, setPhoto] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const [departments, setDepartments] = useState([]);
    const [deptLoading, setDeptLoading] = useState(true);
    const [manualDept, setManualDept] = useState(false);
    const { register, error } = useContext(AuthContext);
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const fileRef = useRef();

    useEffect(() => {
        setDeptLoading(true);
        authAPI.getDepartments()
            .then(r => {
                const data = r.data.data || [];
                if (data.length > 0) {
                    setDepartments(data);
                } else {
                    // DB mein departments nahi hain — static list use karo
                    setDepartments(STATIC_DEPARTMENTS.map((name, i) => ({ _id: name, name })));
                }
            })
            .catch(() => {
                // API fail — static fallback
                setDepartments(STATIC_DEPARTMENTS.map((name, i) => ({ _id: name, name })));
            })
            .finally(() => setDeptLoading(false));
    }, []);

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
            // MongoDB ObjectId ho toh directly bhejo, warna department name bhejo
            const deptValue = formData.department || null;
            const userRes = await register(formData.name, formData.email, formData.password, deptValue, formData.technology, photo);
            setCreatedUser(userRes);
            setShowConfirm(true);
        } catch (err) {
            setLocalError(err?.response?.data?.error || 'Registration failed. Please check your details.');
            setIsLoading(false);
        }
    };

    // Department _id se name nikalo for tech mapping
    const selectedDeptName = departments.find(d => d._id === formData.department)?.name || formData.department || '';
    const availableTechs = getTechsForDept(selectedDeptName);

    const handleDeptChange = (val) => {
        setFormData(f => ({ ...f, department: val, technology: '' }));
    };

    const inputStyle = {
        width: '100%', padding: '0.875rem 1rem 0.875rem 3rem',
        border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem',
        outline: 'none', background: '#FFFFFF', color: '#111827', boxSizing: 'border-box'
    };
    const onFocus = (e) => { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)'; };
    const onBlur = (e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
            <div style={{ flex: '1.2', display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: '4rem', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', position: 'relative', overflow: 'hidden' }} className="auth-left-panel">
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(16,185,129,0.4)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}><Building size={28} color="#10B981" /></div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'white' }}>HRMS Workspace</h1>
                    </div>
                    <div style={{ marginTop: '10vh' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white', letterSpacing: '-1px' }}>Join the team.<br />Start growing<br />with us.</h2>
                        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '450px', lineHeight: 1.6 }}>Register now to access your personalized employee dashboard, manage leaves, view attendance, and track your salary.</p>
                    </div>
                </div>
                <p style={{ position: 'relative', zIndex: 1, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>© 2026 HRMS Inc. All rights reserved.</p>
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Create Account</h2>
                        <p style={{ color: '#6B7280', fontSize: '1rem' }}>Enter your details to register as an employee.</p>
                    </div>

                    {(error || localError) && (
                        <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error || localError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {/* Photo Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div onClick={() => fileRef.current.click()} style={{ width: '90px', height: '90px', borderRadius: '50%', background: photoPreview ? 'transparent' : 'linear-gradient(135deg,#10B981,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '3px solid #10B981', position: 'relative' }}>
                                {photoPreview ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={36} color="white" />}
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#10B981', borderRadius: '50%', padding: '4px', display: 'flex' }}><Camera size={14} color="white" /></div>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Click to upload photo (max 2MB)</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><User size={20} /></div>
                                <input type="text" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required maxLength={50} minLength={2} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><Mail size={20} /></div>
                                <input type="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" required maxLength={100} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><Lock size={20} /></div>
                                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required minLength={6} maxLength={32} style={{ ...inputStyle, paddingRight: '3rem' }} onFocus={onFocus} onBlur={onBlur} />
                                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Department</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#9CA3AF', display: 'flex' }}><Building size={20} /></div>
                                {deptLoading ? (
                                    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', paddingLeft: '3rem' }}>
                                        <div style={{ width: '14px', height: '14px', border: '2px solid #D1D5DB', borderTop: '2px solid #10B981', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                                        Loading...
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={e => handleDeptChange(e.target.value)}
                                            required
                                            style={{ ...inputStyle, appearance: 'none', color: formData.department ? '#111827' : '#9CA3AF' }}
                                            onFocus={onFocus} onBlur={onBlur}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.length > 0
                                                ? departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)
                                                : <option value="" disabled>No departments found — contact admin</option>
                                            }
                                        </select>
                                        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', color: '#9CA3AF', pointerEvents: 'none' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Technology — opens based on department */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                                Primary Technology
                                {formData.department && (
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 500, color: '#10B981' }}>
                                        ({availableTechs.length} options)
                                    </span>
                                )}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    name="technology"
                                    value={formData.technology}
                                    onChange={e => setFormData({ ...formData, technology: e.target.value })}
                                    required
                                    disabled={!formData.department}
                                    style={{ ...inputStyle, appearance: 'none', color: formData.technology ? '#111827' : '#9CA3AF', opacity: !formData.department ? 0.5 : 1, cursor: !formData.department ? 'not-allowed' : 'pointer' }}
                                    onFocus={onFocus} onBlur={onBlur}
                                >
                                    <option value="">{formData.department ? 'Select Technology' : 'First select a department'}</option>
                                    {availableTechs.map(tech => (
                                        <option key={tech} value={tech}>{tech}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', color: '#9CA3AF', pointerEvents: 'none' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)' }}>
                            {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Already have an account? <Link to="/" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>Sign In here</Link></p>
                        
                    </div>
                </div>
            </div>

            {showConfirm && createdUser && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowConfirm(false)}>
                    <div className="modal-box" style={{ maxWidth: '540px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Account Created ✅</h3>
                            <button onClick={() => setShowConfirm(false)} className="btn-ghost">Close</button>
                        </div>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#374151' }}>Welcome <strong>{createdUser.name}</strong> — your account has been created successfully.</p>
                        <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Employee ID</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#4F46E5', background: '#EEF2FF', padding: '0.2rem 0.75rem', borderRadius: '0.375rem' }}>{createdUser.employeeId || '—'}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Department</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                                                    {departments.find(d => d._id === formData.department)?.name || formData.department || '—'}
                                                </span>
                            </div>
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Technology</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{formData.technology || '—'}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Email</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{createdUser.email}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => { setShowConfirm(false); setIsLoading(false); navigate('/'); }}>Sign In</button>
                            <button className="btn btn-primary" onClick={() => { setShowConfirm(false); setIsLoading(false); navigate('/employee'); }}>Go to Dashboard</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }`}</style>
        </div>
    );
};

export default Register;
