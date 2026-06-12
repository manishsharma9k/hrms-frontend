import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Users, Plus, Trash2, Edit2, Search, X, Mail, Lock, Building2, DollarSign, Eye, ArrowLeft } from 'lucide-react';
import { employeesAPI, departmentsAPI } from '../../services/api';

import PageLoader from '../../components/PageLoader';

const Employees = () => {
    const { } = useContext(AuthContext);
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', salary: '', technology: '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [e, d] = await Promise.all([employeesAPI.getAll(), departmentsAPI.getAll()]);
            setEmployees(e.data.data);
            setDepartments(d.data.data);
        } catch {}
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditingId(null); setFormData({ name: '', email: '', password: '', department: '', salary: '' }); setError(''); setShowModal(true); };
    const openEdit = (emp) => { setEditingId(emp._id); setFormData({ name: emp.name, email: emp.email, password: '', department: emp.department?._id || '', salary: emp.salary || '', technology: emp.technology || '' }); setError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditingId(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            const payload = { ...formData };
            if (editingId && !payload.password) delete payload.password;
            if (editingId) await employeesAPI.update(editingId, payload);
            else await employeesAPI.add(payload);
            closeModal(); fetchData();
        } catch (err) { setError(err.response?.data?.error || 'Error saving employee'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        setDeleting(id);
        try { await employeesAPI.delete(id); fetchData(); }
        catch {}
        finally { setDeleting(null); }
    };

    const filtered = employees.filter(e => {
        const query = search.toLowerCase();
        return e.name.toLowerCase().includes(query)
            || e.email.toLowerCase().includes(query)
            || (e.employeeId || '').toLowerCase().includes(query)
            || (e.technology || '').toLowerCase().includes(query);
    });

    if (loading) return <PageLoader text="Loading employees..." />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Users size={20} color="#4F46E5" /> Employee Management</h2>
                    <p className="page-subtitle">{employees.length} total employees across {departments.length} departments</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Employee</button>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="search-bar" style={{ flex: 1, maxWidth: '320px' }}>
                        <Search size={15} color="#94A3B8" />
                        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}><X size={14} /></button>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{filtered.length} results</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>ID</th>
                                <th>Department</th>
                                <th>Technology</th>
                                <th>Salary</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(emp => (
                                <tr key={emp._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="avatar avatar-md" style={{ background: `hsl(${emp.name.charCodeAt(0) * 10},65%,55%)` }}>{emp.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{emp.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#374151', fontWeight: 700 }}>{emp.employeeId || '—'}</td>
                                    <td><span className="badge badge-info">{emp.department?.name || 'N/A'}</span></td>
                                    <td>{emp.technology || '—'}</td>
                                    <td><span style={{ fontWeight: 700, color: '#10B981' }}>₹{(emp.salary || 0).toLocaleString()}</span></td>
                                    <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{new Date(emp.createdAt || Date.now()).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                                            <button onClick={() => navigate(`/admin/employees/${emp._id}/profile`)} className="btn-icon" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'none' }} title="View Profile"><Eye size={15} /></button>
                                            <button onClick={() => openEdit(emp)} className="btn-icon" style={{ background: 'rgba(79,70,229,0.08)', color: '#4F46E5', border: 'none' }} title="Edit"><Edit2 size={15} /></button>
                                            <button onClick={() => handleDelete(emp._id)} disabled={deleting === emp._id} className="btn-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'none' }} title="Delete">
                                                {deleting === emp._id ? <span className="btn-spinner-dark" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#EF4444' }} /> : <Trash2 size={15} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="5" className="empty-state"><Users size={40} /><p>No employees found</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button onClick={closeModal} className="btn-ghost"><X size={18} /></button>
                        </div>
                        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', borderLeft: '3px solid #EF4444' }}>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Enter Your Name" maxLength={50} minLength={2} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="Enter Your Email" maxLength={100} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password {editingId && <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(leave blank to keep)</span>}</label>
                                    <input className="form-input" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} minLength={6} maxLength={32} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Technology</label>
                                    <select className="form-input" value={formData.technology} onChange={e => setFormData({...formData, technology: e.target.value})} required>
                                        <option value="">Select Technology</option>
                                        {['React', 'Node.js', 'Angular', 'Vue.js', 'Python', 'Java', 'C#', 'DevOps', 'UI/UX', 'Data Science'].map(tech => <option key={tech} value={tech}>{tech}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Salary (₹)</label>
                                    <input className="form-input" type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} required placeholder="60000" min={1000} max={10000000} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><span className="btn-spinner" /> Saving...</> : editingId ? 'Update Employee' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
