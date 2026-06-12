import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DollarSign, Search, X, FileText, Info, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeesAPI, departmentsAPI } from '../../services/api';
import { calcDeductions } from '../../utils/slipUtils';
import SlipModal from '../../components/SlipModal';

const Payroll = () => {
    const { } = useContext(AuthContext);
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [slipEmp, setSlipEmp] = useState(null);
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const [showPayrollForm, setShowPayrollForm] = useState(false);
    const [payrollForm, setPayrollForm] = useState({
        employeeId: '', name: '', email: '', department: '', designation: '', phone: '', dateJoined: '', salary: ''
    });
    const [payrollMsg, setPayrollMsg] = useState('');
    const [payrollSaving, setPayrollSaving] = useState(false);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        employeesAPI.getAll().then(r => setEmployees(r.data.data)).catch(() => {}).finally(() => setLoading(false));
        departmentsAPI.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    }, []);

    const handleEmployeeSelect = (empId) => {
        const emp = employees.find(e => e._id === empId);
        if (emp) {
            setPayrollForm(f => ({
                ...f,
                employeeId: empId,
                name: emp.name || '',
                email: emp.email || '',
                department: emp.department?._id || '',
                designation: emp.designation || '',
                phone: emp.phone || '',
                dateJoined: emp.dateJoined ? emp.dateJoined.slice(0, 10) : '',
                salary: emp.salary || ''
            }));
        } else {
            setPayrollForm({ employeeId: '', name: '', email: '', department: '', designation: '', phone: '', dateJoined: '', salary: '' });
        }
    };

    const handlePayrollSubmit = async (e) => {
        e.preventDefault();
        setPayrollMsg('');
        setPayrollSaving(true);
        try {
            await employeesAPI.update(payrollForm.employeeId, {
                salary: Number(payrollForm.salary),
                designation: payrollForm.designation,
                phone: payrollForm.phone,
                department: payrollForm.department,
                dateJoined: payrollForm.dateJoined
            });
            setPayrollMsg('success');
            setPayrollForm({ employeeId: '', name: '', email: '', department: '', designation: '', phone: '', dateJoined: '', salary: '' });
            const r = await employeesAPI.getAll();
            setEmployees(r.data.data);
            setTimeout(() => { setShowPayrollForm(false); setPayrollMsg(''); }, 1200);
        } catch (err) {
            setPayrollMsg(err.response?.data?.error || 'Error updating payroll');
        } finally {
            setPayrollSaving(false);
        }
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    // Attendance-based earned salary per employee (current month)
    const [earnedMap, setEarnedMap] = useState({});
    useEffect(() => {
        if (employees.length === 0) return;
        import('../../services/api').then(({ default: api }) => {
            Promise.all(employees.map(emp =>
                api.get(`/admin/employees/${emp._id}/profile`)
                    .then(r => ({ id: emp._id, presentDays: r.data.data.presentDays || 0 }))
                    .catch(() => ({ id: emp._id, presentDays: 0 }))
            )).then(results => {
                const map = {};
                results.forEach(r => { map[r.id] = r.presentDays; });
                setEarnedMap(map);
            });
        });
    }, [employees]);

    const getEarned = (emp) => Math.round(((emp.salary || 0) / 26) * (earnedMap[emp._id] || 0));

    const totalGross = filtered.reduce((s, e) => s + (e.salary || 0), 0);
    const totalNet = filtered.reduce((s, e) => s + calcDeductions(e.salary || 0).netSalary, 0);
    const totalPF = filtered.reduce((s, e) => s + calcDeductions(e.salary || 0).pf, 0);
    const totalTDS = filtered.reduce((s, e) => s + calcDeductions(e.salary || 0).tds, 0);

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {slipEmp && <SlipModal emp={slipEmp} onClose={() => setSlipEmp(null)} />}
            {/* Add Payroll Modal */}
            {showPayrollForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '1rem 1rem 0 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ background: 'rgba(79,70,229,0.1)', borderRadius: '0.5rem', padding: '0.4rem' }}><DollarSign size={18} color="#4F46E5" /></div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Assign / Update Payroll</h3>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>Fill employee details and salary information</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowPayrollForm(false); setPayrollMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handlePayrollSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Section 1: Select Employee */}
                            <div>
                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Employee</p>
                                <select className="form-input" value={payrollForm.employeeId} onChange={e => handleEmployeeSelect(e.target.value)} required
                                    style={{ width: '100%' }}>
                                    <option value="">-- Select Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.name} {emp.employeeId ? `(${emp.employeeId})` : ''} {emp.department?.name ? `(${emp.department.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section 2: Employee Information */}
                            <div style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #E2E8F0' }}>
                                <p style={{ margin: '0 0 0.875rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee Information</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" value={payrollForm.name} onChange={e => setPayrollForm(f => ({ ...f, name: e.target.value }))} placeholder="Employee name" required maxLength={50} minLength={2} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-input" value={payrollForm.email} placeholder="email@company.com" readOnly style={{ background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Department</label>
                                        <select className="form-input" value={payrollForm.department} onChange={e => setPayrollForm(f => ({ ...f, department: e.target.value }))}>
                                            <option value="">-- Select Department --</option>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Designation</label>
                                        <input className="form-input" value={payrollForm.designation} onChange={e => setPayrollForm(f => ({ ...f, designation: e.target.value }))} placeholder="e.g. Software Engineer" maxLength={60} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Phone Number</label>
                                        <input className="form-input" value={payrollForm.phone} onChange={e => setPayrollForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" maxLength={15} pattern="[+0-9\s\-]{7,15}" title="Enter a valid phone number" />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Date of Joining</label>
                                        <input type="date" className="form-input" value={payrollForm.dateJoined} onChange={e => setPayrollForm(f => ({ ...f, dateJoined: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Salary Details */}
                            <div style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #E2E8F0' }}>
                                <p style={{ margin: '0 0 0.875rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Salary Details</p>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Gross Monthly Salary (₹)</label>
                                    <input type="number" className="form-input" placeholder="e.g. 45000" min={1000} max={10000000} value={payrollForm.salary} onChange={e => setPayrollForm(f => ({ ...f, salary: e.target.value }))} required />
                                </div>
                                {payrollForm.salary > 0 && (() => {
                                    const d = calcDeductions(Number(payrollForm.salary));
                                    return (
                                        <div style={{ marginTop: '0.75rem', background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.78rem', color: '#475569' }}>
                                                <span>PF (Employee): <strong style={{ color: '#EF4444' }}>-₹{d.pf.toLocaleString()}</strong></span>
                                                <span>PF (Employer): <strong style={{ color: '#4F46E5' }}>₹{d.pfEmployer.toLocaleString()}</strong></span>
                                                <span>ESI: <strong style={{ color: '#F59E0B' }}>{d.esi > 0 ? `-₹${d.esi.toLocaleString()}` : 'N/A'}</strong></span>
                                                <span>TDS: <strong style={{ color: '#EF4444' }}>{d.tds > 0 ? `-₹${d.tds.toLocaleString()}` : '—'}</strong></span>
                                                <span>Prof. Tax: <strong style={{ color: '#8B5CF6' }}>{d.professional > 0 ? `-₹${d.professional}` : '—'}</strong></span>
                                                <span>Total Deductions: <strong style={{ color: '#EF4444' }}>-₹{d.totalDeduction.toLocaleString()}</strong></span>
                                            </div>
                                            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(79,70,229,0.12)', fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>
                                                Net Take-Home: ₹{d.netSalary.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {payrollMsg === 'success' ? (
                                <p style={{ color: '#10B981', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>✓ Payroll updated successfully!</p>
                            ) : payrollMsg ? (
                                <p style={{ color: '#EF4444', margin: 0, fontSize: '0.85rem' }}>{payrollMsg}</p>
                            ) : null}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" disabled={payrollSaving} className="btn btn-primary" style={{ flex: 1 }}>
                                    {payrollSaving ? <><span className="btn-spinner" /> Saving...</> : 'Save Payroll'}
                                </button>
                                <button type="button" onClick={() => { setShowPayrollForm(false); setPayrollMsg(''); }} className="btn" style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2 className="page-title"><DollarSign size={20} color="#8B5CF6" /> Payroll Processing</h2>
                    <p className="page-subtitle">Manage employee salaries with PF, ESI & TDS — {month}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn btn-primary" onClick={() => setShowPayrollForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Plus size={16} /> Add Payroll
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid-4">
                {[
                    { label: 'Gross Payroll', value: `₹${totalGross.toLocaleString()}`, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
                    { label: 'Total PF (Employer)', value: `₹${filtered.reduce((s,e)=>s+calcDeductions(e.salary||0).pfEmployer,0).toLocaleString()}`, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.15)' },
                    { label: 'Total TDS', value: `₹${totalTDS.toLocaleString()}`, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
                    { label: 'Net Payroll', value: `₹${totalNet.toLocaleString()}`, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '0.875rem', padding: '1.25rem', border: `1px solid ${s.border}` }}>
                        <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: s.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Deduction Info */}
            <div style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.12)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Info size={16} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#4F46E5', lineHeight: 1.6 }}>
                    <strong>Deduction Rules:</strong> PF @ 12% (employee + employer) | ESI @ 0.75% employee + 3.25% employer (salary ≤ ₹21,000) | TDS @ 10% on salary above ₹50,000 | Professional Tax ₹200/month (salary &gt; ₹15,000)
                </p>
            </div>

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="search-bar" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search size={15} color="#94A3B8" />
                        <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}><X size={14} /></button>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{filtered.length} employees</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Dept</th>
                                <th>Gross CTC</th>
                                <th>Earned (This Month)</th>
                                <th>PF (Emp)</th>
                                <th>ESI</th>
                                <th>TDS</th>
                                <th>Net Pay</th>
                                <th>Slip</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(emp => {
                                const d = calcDeductions(getEarned(emp));
                                return (
                                    <tr key={emp._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: `hsl(${emp.name.charCodeAt(0)*10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {emp.photo ? <img src={emp.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{emp.name.charAt(0).toUpperCase()}</span>}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{emp.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-purple">{emp.department?.name || 'N/A'}</span></td>
                                        <td style={{ fontWeight: 600, color: '#64748B' }}>₹{(emp.salary||0).toLocaleString()}</td>
                                        <td style={{ fontWeight: 700, color: '#8B5CF6' }}>
                                            ₹{getEarned(emp).toLocaleString()}
                                            <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginLeft: '0.3rem' }}>({earnedMap[emp._id] || 0}d)</span>
                                        </td>
                                        <td style={{ color: '#EF4444', fontWeight: 500 }}>-₹{d.pf.toLocaleString()}</td>
                                        <td style={{ color: '#F59E0B', fontWeight: 500 }}>{d.esi > 0 ? `-₹${d.esi.toLocaleString()}` : <span style={{ color: '#94A3B8' }}>N/A</span>}</td>
                                        <td style={{ color: '#EF4444', fontWeight: 500 }}>{d.tds > 0 ? `-₹${d.tds.toLocaleString()}` : <span style={{ color: '#94A3B8' }}>—</span>}</td>
                                        <td style={{ fontWeight: 700, color: '#10B981' }}>₹{calcDeductions(getEarned(emp)).netSalary.toLocaleString()}</td>
                                        <td>
                                            <button onClick={() => setSlipEmp({ ...emp, presentDays: earnedMap[emp._id] || 0 })} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.625rem', background: 'rgba(79,70,229,0.08)', border: 'none', borderRadius: '0.375rem', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                                <FileText size={13} /> Slip
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan="9" className="empty-state"><DollarSign size={40} /><p>No employees found</p></td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
