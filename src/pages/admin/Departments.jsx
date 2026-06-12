import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Building2, Plus, Edit2, Trash2, X, Users, Search, ArrowLeft, Mail, MapPin, DollarSign, UserCheck, ToggleLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { departmentsAPI, employeesAPI } from '../../services/api';

import PageLoader from '../../components/PageLoader';

const DEPT_COLORS = [
    { bg: 'rgba(79,70,229,0.1)', color: '#4F46E5', border: 'rgba(79,70,229,0.2)' },
    { bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.2)' },
    { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
    { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.2)' },
    { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: 'rgba(139,92,246,0.2)' },
    { bg: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: 'rgba(6,182,212,0.2)' },
    { bg: 'rgba(249,115,22,0.1)', color: '#F97316', border: 'rgba(249,115,22,0.2)' },
    { bg: 'rgba(236,72,153,0.1)', color: '#EC4899', border: 'rgba(236,72,153,0.2)' },
];

const Departments = () => {
    const { } = useContext(AuthContext);
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', hodName: '', location: '', contactEmail: '', budget: '', status: 'Active' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            const [dRes, eRes] = await Promise.all([departmentsAPI.getAll(), employeesAPI.getAll()]);
            setDepartments(dRes.data.data);
            setEmployees(eRes.data.data);
        } catch {}
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditingId(null); setFormData({ name: '', description: '', hodName: '', location: '', contactEmail: '', budget: '', status: 'Active' }); setError(''); setShowModal(true); };
    const openEdit = (dep) => { setEditingId(dep._id); setFormData({ name: dep.name, description: dep.description || '', hodName: dep.hodName || '', location: dep.location || '', contactEmail: dep.contactEmail || '', budget: dep.budget || '', status: dep.status || 'Active' }); setError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditingId(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            if (editingId) await departmentsAPI.update(editingId, formData);
            else await departmentsAPI.add(formData);
            closeModal(); fetchData();
        } catch (err) { setError(err.response?.data?.error || 'Error saving department'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department? Employees in this department will be unassigned.')) return;
        setDeleting(id);
        try { await departmentsAPI.delete(id); fetchData(); }
        catch (err) { alert(err.response?.data?.error || 'Error deleting department'); }
        finally { setDeleting(null); }
    };

    const getEmpCount = (deptId) => employees.filter(e => e.department?._id === deptId || e.department === deptId).length;

    const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <PageLoader text="Loading departments..." />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Building2 size={20} color="#10B981" /> Department Management</h2>
                    <p className="page-subtitle">{departments.length} departments · {employees.length} total employees</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn btn-primary" onClick={openAdd} style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                        <Plus size={16} /> Add Department
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total Departments', value: departments.length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                    { label: 'Total Employees', value: employees.length, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
                    { label: 'Avg. Team Size', value: departments.length ? Math.round(employees.length / departments.length) : 0, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Largest Dept.', value: departments.length ? Math.max(...departments.map(d => getEmpCount(d._id))) : 0, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '0.875rem', padding: '1rem 1.25rem', border: `1px solid ${s.color}20` }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', color: s.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="search-bar" style={{ maxWidth: '320px' }}>
                <Search size={15} color="#94A3B8" />
                <input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}><X size={14} /></button>}
            </div>

            {/* Department Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                {filtered.map((dep, idx) => {
                    const clr = DEPT_COLORS[idx % DEPT_COLORS.length];
                    const empCount = getEmpCount(dep._id);
                    const deptEmps = employees.filter(e => e.department?._id === dep._id || e.department === dep._id).slice(0, 4);
                    return (
                        <div key={dep._id} className="card" style={{ padding: '1.25rem', border: `1px solid ${clr.border}`, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                            {/* Top accent bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: clr.color, borderRadius: '1rem 1rem 0 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: clr.bg, padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${clr.border}` }}>
                                        <Building2 size={20} color={clr.color} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{dep.name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>Created {new Date(dep.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => openEdit(dep)} className="btn-icon" style={{ background: 'rgba(79,70,229,0.08)', color: '#4F46E5', border: 'none' }} title="Edit"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(dep._id)} disabled={deleting === dep._id} className="btn-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'none' }} title="Delete">
                                        {deleting === dep._id ? <span className="btn-spinner-dark" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#EF4444' }} /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>

                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, minHeight: '2.4rem' }}>
                                {dep.description || 'No description provided.'}
                            </p>

                            {/* Extra info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                                {dep.hodName && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                                        <UserCheck size={12} color={clr.color} /> <span style={{ fontWeight: 600 }}>HOD:</span> {dep.hodName}
                                    </div>
                                )}
                                {dep.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                                        <MapPin size={12} color={clr.color} /> {dep.location}
                                    </div>
                                )}
                                {dep.contactEmail && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                                        <Mail size={12} color={clr.color} /> {dep.contactEmail}
                                    </div>
                                )}
                                {dep.budget > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                                        <DollarSign size={12} color={clr.color} /> Budget: <span style={{ fontWeight: 700, color: '#10B981' }}>₹{Number(dep.budget).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Employee Avatars */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', borderTop: `1px solid ${clr.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex' }}>
                                        {deptEmps.map((emp, i) => (
                                            <div key={emp._id} style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: `hsl(${emp.name.charCodeAt(0)*10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', marginLeft: i > 0 ? '-8px' : 0, zIndex: deptEmps.length - i }}>
                                                {emp.photo ? <img src={emp.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.6rem' }}>{emp.name.charAt(0).toUpperCase()}</span>}
                                            </div>
                                        ))}
                                        {empCount > 4 && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: clr.bg, border: `2px solid ${clr.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-8px', fontSize: '0.6rem', fontWeight: 700, color: clr.color }}>+{empCount - 4}</div>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: dep.status === 'Inactive' ? '#FEE2E2' : '#D1FAE5', color: dep.status === 'Inactive' ? '#991B1B' : '#065F46' }}>
                                        {dep.status || 'Active'}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: clr.bg, padding: '0.3rem 0.625rem', borderRadius: '9999px' }}>
                                        <Users size={12} color={clr.color} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: clr.color }}>{empCount} {empCount === 1 ? 'member' : 'members'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
                        <Building2 size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem', display: 'block' }} />
                        <p style={{ color: '#94A3B8', fontWeight: 500 }}>{search ? 'No departments match your search' : 'No departments yet. Add one to get started.'}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Edit Department' : 'Add New Department'}</h3>
                            <button onClick={closeModal} className="btn-ghost"><X size={18} /></button>
                        </div>
                        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', borderLeft: '3px solid #EF4444' }}>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Department Name *</label>
                                    <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Engineering, Marketing" required maxLength={50} minLength={2} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Head of Department (HOD)</label>
                                    <input className="form-input" value={formData.hodName} onChange={e => setFormData({ ...formData, hodName: e.target.value })} placeholder="e.g. Rajesh Kumar" maxLength={60} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location / Office</label>
                                    <input className="form-input" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Floor 3, Mumbai HQ" maxLength={100} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contact Email</label>
                                    <input className="form-input" type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="dept@company.com" maxLength={100} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Annual Budget (₹)</label>
                                    <input className="form-input" type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g. 500000" min={0} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" placeholder="Brief description of this department..." style={{ resize: 'vertical' }} maxLength={300} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                                    {saving ? <><span className="btn-spinner" /> Saving...</> : editingId ? 'Update Department' : 'Add Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
