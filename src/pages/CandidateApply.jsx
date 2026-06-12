import React, { useState } from 'react';
import { Building, Briefcase, CheckCircle, Clock, FileText, Mail, MapPin, Phone, Send, ShieldCheck, Sparkles, UploadCloud, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicRecruitmentAPI } from '../services/api';

const initialForm = {
    name: '',
    email: '',
    phone: '',
    role: '',
    exp: '',
    location: '',
    notes: '',
    cv: null,
};

const fieldStyle = {
    width: '100%',
    border: '1px solid #D6DEE9',
    borderRadius: '0.85rem',
    padding: '0.9rem 1rem',
    fontSize: '0.95rem',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
};

const CandidateApply = () => {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const setValue = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });

        try {
            await publicRecruitmentAPI.apply(data);
            setForm(initialForm);
            setStatus('success');
        } catch (err) {
            setStatus(err.response?.data?.error || 'Unable to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const focusInput = (e) => {
        e.target.style.borderColor = '#4F46E5';
        e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.1)';
    };

    const blurInput = (e) => {
        e.target.style.borderColor = '#D6DEE9';
        e.target.style.boxShadow = 'none';
    };

    if (status === 'success') {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'linear-gradient(135deg,#F8FAFC 0%,#EEF2FF 100%)' }}>
                <div style={{ width: '100%', maxWidth: '520px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.35rem', padding: '2.25rem', textAlign: 'center', boxShadow: '0 28px 80px rgba(15,23,42,0.12)' }}>
                    <div style={{ width: 72, height: 72, display: 'grid', placeItems: 'center', borderRadius: '1.15rem', background: '#ECFDF5', color: '#059669', margin: '0 auto 1.1rem', border: '1px solid #A7F3D0' }}>
                        <CheckCircle size={38} />
                    </div>
                    <h1 style={{ margin: '0 0 0.55rem', color: '#0F172A', fontSize: '1.85rem', lineHeight: 1.15 }}>Application Submitted</h1>
                    <p style={{ margin: '0 0 1.6rem', color: '#64748B', lineHeight: 1.65 }}>Thank you. Your candidate profile is now visible in the HRMS recruitment dashboard.</p>
                    <button onClick={() => setStatus('')} style={{ border: 'none', background: 'linear-gradient(135deg,#4F46E5,#4338CA)', color: '#fff', borderRadius: '0.85rem', padding: '0.85rem 1.25rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 16px 32px rgba(79,70,229,0.24)' }}>Submit another response</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <div style={{ position: 'relative', background: 'linear-gradient(135deg,#101827 0%,#312E81 58%,#4F46E5 100%)', color: '#fff', padding: '1.5rem 1.25rem 8.5rem', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.14), transparent 28%), radial-gradient(circle at 86% 18%, rgba(14,165,233,0.2), transparent 30%)' }} />
                <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: '#fff', textDecoration: 'none', fontWeight: 900, marginBottom: '2.75rem' }}>
                        <span style={{ width: 44, height: 44, borderRadius: '0.85rem', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center' }}><Building size={22} /></span>
                        HRMS Workspace
                    </Link>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2rem', alignItems: 'end' }} className="candidate-hero-grid">
                        <div style={{ maxWidth: 680 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 900, marginBottom: '1rem' }}>
                                <Briefcase size={14} /> Candidate Application
                            </div>
                            <h1 style={{ margin: 0, fontSize: 'clamp(2.35rem, 6vw, 4.6rem)', lineHeight: 1.02, letterSpacing: 0 }}>Start your next role with HRMS.</h1>
                            <p style={{ margin: '1rem 0 0', color: 'rgba(255,255,255,0.78)', fontSize: '1.06rem', lineHeight: 1.65, maxWidth: 590 }}>Tell us who you are, what you build best, and where you want to grow. Your application goes directly to the recruitment pipeline for HR review.</p>
                            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
                                {['Fast HR review', 'Resume optional', 'Direct dashboard entry'].map(item => (
                                    <span key={item} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '0.48rem 0.8rem', fontSize: '0.78rem', fontWeight: 900 }}>{item}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem' }}>
                            {['Submit profile', 'HR shortlisting', 'Interview pipeline'].map((item, index) => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: index === 1 ? '0.85rem 0' : '0', borderTop: index === 1 ? '1px solid rgba(255,255,255,0.12)' : 'none', borderBottom: index === 1 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                                    <span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.14)', fontSize: '0.75rem', fontWeight: 900 }}>{index + 1}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main style={{ maxWidth: 1120, margin: '-6.5rem auto 0', padding: '0 1.25rem 3rem', position: 'relative' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '1rem' }} className="candidate-form-grid">
                    <aside style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.35rem', boxShadow: '0 24px 70px rgba(15,23,42,0.08)', alignSelf: 'start' }}>
                        <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: '0.9rem', background: '#EEF2FF', color: '#4F46E5', marginBottom: '1rem' }}>
                            <FileText size={24} />
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#0F172A' }}>Before you submit</h2>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6 }}>Keep your contact details accurate, mention your strongest skills, and attach a recent resume if available.</p>
                        <div style={{ marginTop: '1.2rem', display: 'grid', gap: '0.65rem' }}>
                            {['Required: name and role', 'Optional: resume upload', 'Visible to HR instantly', 'Use real contact details'].map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#334155', fontSize: '0.84rem', fontWeight: 700 }}>
                                    <CheckCircle size={15} color="#059669" /> {item}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'grid', gap: '0.8rem' }}>
                            <InfoBlock icon={<Clock size={16} />} title="Review timeline" text="HR usually reviews new applications from the recruitment dashboard." />
                            <InfoBlock icon={<ShieldCheck size={16} />} title="Privacy note" text="Your details are used only for hiring and internal HR follow-up." />
                            <InfoBlock icon={<Sparkles size={16} />} title="Profile tip" text="Add skills, portfolio links, notice period, and expected role in notes." />
                        </div>
                    </aside>

                    <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: 'clamp(1.25rem, 4vw, 2rem)', boxShadow: '0 24px 70px rgba(15,23,42,0.08)' }}>
                        {status && status !== 'success' && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '0.85rem', padding: '0.9rem 1rem', marginBottom: '1.2rem', fontWeight: 800 }}>{status}</div>
                        )}

                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1rem', marginBottom: '1.1rem' }}>
                            <p style={{ margin: '0 0 0.35rem', color: '#0F172A', fontSize: '1rem', fontWeight: 900 }}>Candidate Intake Form</p>
                            <p style={{ margin: 0, color: '#64748B', fontSize: '0.86rem', lineHeight: 1.55 }}>Please complete the form carefully. Fields marked with * are required, and the rest help HR shortlist faster.</p>
                        </div>

                        <SectionTitle title="Candidate Details" description="Basic information HR needs to identify and contact you." />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.35rem' }}>
                            <Field icon={<User size={17} />} label="Full Name *"><input style={fieldStyle} value={form.name} onChange={e => setValue('name', e.target.value)} onFocus={focusInput} onBlur={blurInput} required maxLength={80} placeholder="Enter your full name" /></Field>
                            <Field icon={<Mail size={17} />} label="Email Address"><input type="email" style={fieldStyle} value={form.email} onChange={e => setValue('email', e.target.value)} onFocus={focusInput} onBlur={blurInput} maxLength={100} placeholder="you@example.com" /></Field>
                            <Field icon={<Phone size={17} />} label="Phone Number"><input style={fieldStyle} value={form.phone} onChange={e => setValue('phone', e.target.value)} onFocus={focusInput} onBlur={blurInput} maxLength={20} placeholder="+91 98765 43210" /></Field>
                            <Field icon={<MapPin size={17} />} label="Current Location"><input style={fieldStyle} value={form.location} onChange={e => setValue('location', e.target.value)} onFocus={focusInput} onBlur={blurInput} maxLength={80} placeholder="Lucknow, Uttar Pradesh" /></Field>
                        </div>

                        <SectionTitle title="Role Information" description="Tell us what position fits your profile." />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                            {['Software Development', 'HR & Operations', 'Sales & Marketing', 'Design & Product'].map(item => (
                                <button type="button" key={item} onClick={() => setValue('role', item)} style={{ border: '1px solid #E0E7FF', background: form.role === item ? '#EEF2FF' : '#fff', color: '#4338CA', borderRadius: '0.75rem', padding: '0.7rem', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer' }}>
                                    {item}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.35rem' }}>
                            <Field icon={<Briefcase size={17} />} label="Role Applied For *"><input style={fieldStyle} value={form.role} onChange={e => setValue('role', e.target.value)} onFocus={focusInput} onBlur={blurInput} required maxLength={80} placeholder="Frontend Developer" /></Field>
                            <Field icon={<FileText size={17} />} label="Experience"><input style={fieldStyle} value={form.exp} onChange={e => setValue('exp', e.target.value)} onFocus={focusInput} onBlur={blurInput} maxLength={40} placeholder="2 years" /></Field>
                        </div>

                        <SectionTitle title="Profile Summary" description="Add skills, portfolio links, notice period, expected salary, or anything useful." />
                        <Field icon={<FileText size={17} />} label="Notes / Skills">
                            <textarea style={{ ...fieldStyle, minHeight: 140, resize: 'vertical', fontFamily: 'inherit' }} value={form.notes} onChange={e => setValue('notes', e.target.value)} onFocus={focusInput} onBlur={blurInput} maxLength={800} placeholder="Example: React, Node.js, MongoDB. Portfolio: https://... Notice period: 30 days. Expected role: Frontend Developer." />
                        </Field>

                        <div style={{ marginTop: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1E293B', fontWeight: 900, fontSize: '0.9rem', marginBottom: '0.55rem' }}><UploadCloud size={17} /> Resume / CV</span>
                            <label style={{ display: 'grid', placeItems: 'center', border: '1.5px dashed #C7D2FE', background: '#F8FAFF', borderRadius: '1rem', padding: '1.2rem', cursor: 'pointer', textAlign: 'center' }}>
                                <UploadCloud size={26} color="#4F46E5" />
                                <span style={{ marginTop: '0.5rem', color: '#0F172A', fontWeight: 900, fontSize: '0.92rem' }}>{form.cv ? form.cv.name : 'Upload resume file'}</span>
                                <span style={{ marginTop: '0.25rem', color: '#64748B', fontSize: '0.78rem' }}>PDF, DOC, or DOCX up to 5MB</span>
                                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setValue('cv', e.target.files?.[0] || null)} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <button disabled={loading} type="submit" style={{ width: '100%', marginTop: '1.5rem', border: 'none', borderRadius: '0.9rem', padding: '1rem', background: loading ? '#94A3B8' : 'linear-gradient(135deg,#4F46E5,#4338CA)', color: '#fff', fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: loading ? 'none' : '0 16px 32px rgba(79,70,229,0.24)' }}>
                            <Send size={18} /> {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <p style={{ margin: '0.9rem 0 0', color: '#64748B', fontSize: '0.78rem', lineHeight: 1.55, textAlign: 'center' }}>
                            By submitting, you confirm that the information provided is accurate and can be reviewed by the HR team for recruitment purposes.
                        </p>
                    </section>
                </form>
            </main>

            <style>{`
                @media(max-width:900px){
                    .candidate-hero-grid,
                    .candidate-form-grid{grid-template-columns:1fr!important}
                }
            `}</style>
        </div>
    );
};

const SectionTitle = ({ title, description }) => (
    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.1rem', margin: '1.1rem 0 0.9rem' }}>
        <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1rem' }}>{title}</h3>
        <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.82rem', lineHeight: 1.5 }}>{description}</p>
    </div>
);

const Field = ({ label, icon, children }) => (
    <label style={{ display: 'block' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1E293B', fontWeight: 900, fontSize: '0.9rem', marginBottom: '0.55rem' }}>{icon}{label}</span>
        {children}
    </label>
);

const InfoBlock = ({ icon, title, text }) => (
    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
        <span style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: '0.65rem', background: '#F8FAFC', color: '#4F46E5', flexShrink: 0 }}>{icon}</span>
        <span>
            <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.82rem' }}>{title}</strong>
            <span style={{ display: 'block', color: '#64748B', fontSize: '0.76rem', lineHeight: 1.45, marginTop: '0.15rem' }}>{text}</span>
        </span>
    </div>
);

export default CandidateApply;
