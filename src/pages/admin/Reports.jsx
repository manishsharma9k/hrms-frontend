import React, { useEffect, useState } from 'react';
import { BarChart2, Users, DollarSign, Calendar, TrendingUp, Download, ArrowLeft, Building2, CheckCircle, XCircle, Clock, IndianRupee, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeesAPI, departmentsAPI, leavesAdminAPI, attendanceAdminAPI } from '../../services/api';
import { calcDeductions } from '../../utils/slipUtils';

const Reports = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [todayAtt, setTodayAtt] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        Promise.all([
            employeesAPI.getAll(),
            departmentsAPI.getAll(),
            leavesAdminAPI.getAll(),
            attendanceAdminAPI.getToday(),
        ]).then(([e, d, l, a]) => {
            setEmployees(e.data.data || []);
            setDepartments(d.data.data || []);
            setLeaves(l.data.data || []);
            setTodayAtt(a.data.data || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    // ── Computed values ──────────────────────────────────────────────────────
    const totalGross = employees.reduce((s, e) => s + (e.salary || 0), 0);
    const totalNet   = employees.reduce((s, e) => s + calcDeductions(e.salary || 0).netSalary, 0);

    const deptMap = {};
    employees.forEach(e => {
        const name = e.department?.name || 'Unknown';
        deptMap[name] = (deptMap[name] || 0) + 1;
    });
    const deptEntries = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
    const maxDeptCount = deptEntries[0]?.[1] || 1;

    const leaveStats = { Approved: 0, Pending: 0, Rejected: 0 };
    leaves.forEach(l => { if (leaveStats[l.status] !== undefined) leaveStats[l.status]++; });

    const presentToday = todayAtt.filter(a => a.status === 'Present').length;
    const absentToday  = Math.max(0, employees.length - presentToday);
    const attRate      = employees.length ? Math.round((presentToday / employees.length) * 100) : 0;

    const salaryData = [...employees]
        .filter(e => (e.salary || 0) > 0)
        .sort((a, b) => (b.salary || 0) - (a.salary || 0))
        .slice(0, 10);
    const maxSalary = salaryData[0]?.salary || 1;

    const BAR_COLORS = ['#4F46E5','#7C3AED','#EC4899','#F97316','#10B981','#06B6D4','#F59E0B','#EF4444','#8B5CF6','#6366F1'];

    const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${Math.round(n / 1000)}k` : `₹${n}`;

    const getReportRows = () => [
        [`HRMS Report - ${new Date().toLocaleDateString('en-IN')}`],
        [],
        ['Employee Name', 'Employee ID', 'Email', 'Department', 'Gross Salary', 'Net Salary'],
        ...employees.map(e => [
            e.name, e.employeeId || '', e.email, e.department?.name || 'N/A',
            e.salary || 0, calcDeductions(e.salary || 0).netSalary
        ]),
        [],
        ['Leave Summary'],
        ['Status', 'Count'],
        ['Approved', leaveStats.Approved],
        ['Pending', leaveStats.Pending],
        ['Rejected', leaveStats.Rejected],
        [],
        ['Attendance Today'],
        ['Present', presentToday],
        ['Absent', absentToday],
        ['Total', employees.length],
    ];

    const downloadFile = (content, type, filename) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const escapeCsv = (value) => {
        const text = String(value ?? '');
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const handleExport = (format = 'csv') => {
        setExporting(true);
        setTimeout(() => {
            const rows = getReportRows();
            const date = new Date().toISOString().slice(0, 10);

            if (format === 'excel') {
                const tableRows = rows.map(row => {
                    if (!row.length) return '<tr><td colspan="6"></td></tr>';
                    return `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`;
                }).join('');
                const excel = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1">${tableRows}</table></body></html>`;
                downloadFile(excel, 'application/vnd.ms-excel', `HRMS_Report_${date}.xls`);
            } else {
                const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\n');
                downloadFile(csv, 'text/csv;charset=utf-8;', `HRMS_Report_${date}.csv`);
            }

            setExporting(false);
        }, 300);
    };

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title"><BarChart2 size={20} color="#6366F1" /> Reports & Analytics</h2>
                    <p className="page-subtitle">Organization-wide insights and data summaries</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn btn-primary" onClick={handleExport} disabled={exporting}
                        style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {exporting ? <><span className="btn-spinner" /> Exporting...</> : <><Download size={15} /> Export CSV</>}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '0.875rem' }}>
                {[
                    { label: 'Total Employees', value: employees.length,       icon: <Users size={18} />,        color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',   border: 'rgba(79,70,229,0.18)' },
                    { label: 'Departments',      value: departments.length,     icon: <Building2 size={18} />,    color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
                    { label: 'Gross Payroll',    value: fmt(totalGross),        icon: <IndianRupee size={18} />,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
                    { label: 'Net Payroll',      value: fmt(totalNet),          icon: <TrendingUp size={18} />,   color: '#06B6D4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.18)' },
                    { label: 'Leave Requests',   value: leaves.length,          icon: <Calendar size={18} />,     color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)' },
                    { label: 'Present Today',    value: presentToday,           icon: <CheckCircle size={18} />,  color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
                ].map((k, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1.125rem', border: `1px solid ${k.border}`, display: 'flex', alignItems: 'center', gap: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ background: k.bg, padding: '0.625rem', borderRadius: '0.625rem', color: k.color, flexShrink: 0 }}>{k.icon}</div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</p>
                            <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{k.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2: Dept + Leave + Attendance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>

                {/* Department Headcount */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={15} color="#4F46E5" /> Headcount by Department
                    </p>
                    {deptEntries.length === 0
                        ? <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>No department data</p>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {deptEntries.map(([dept, count], i) => (
                                <div key={dept}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{dept}</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{count}</span>
                                    </div>
                                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(count / maxDeptCount) * 100}%`, background: `hsl(${i * 50 + 220},65%,55%)`, borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>

                {/* Leave Summary */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={15} color="#F59E0B" /> Leave Summary
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { label: 'Approved', count: leaveStats.Approved, color: '#10B981', bg: '#ECFDF5', border: '#6EE7B7', icon: <CheckCircle size={15} color="#10B981" /> },
                            { label: 'Pending',  count: leaveStats.Pending,  color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: <Clock size={15} color="#F59E0B" /> },
                            { label: 'Rejected', count: leaveStats.Rejected, color: '#EF4444', bg: '#FFF1F2', border: '#FCA5A5', icon: <XCircle size={15} color="#EF4444" /> },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: s.bg, borderRadius: '0.625rem', border: `1px solid ${s.border}` }}>
                                <div style={{ flexShrink: 0 }}>{s.icon}</div>
                                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.82rem', color: s.color }}>{s.label}</span>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{s.count}</span>
                                <span style={{ fontSize: '0.68rem', color: '#94A3B8', minWidth: '32px', textAlign: 'right' }}>
                                    {leaves.length ? Math.round((s.count / leaves.length) * 100) : 0}%
                                </span>
                            </div>
                        ))}
                        <div style={{ marginTop: '0.25rem', padding: '0.5rem 0.875rem', background: '#F8FAFC', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B' }}>
                            <span>Total Requests</span>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{leaves.length}</span>
                        </div>
                    </div>
                </div>

                {/* Today Attendance */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={15} color="#EC4899" /> Today's Attendance
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'Present', value: presentToday, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                            { label: 'Absent',  value: absentToday,  color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' },
                            { label: 'Total',   value: employees.length, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.2)' },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '0.625rem', padding: '0.625rem', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.6rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                            </div>
                        ))}
                    </div>
                    <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <div style={{ height: '100%', width: `${attRate}%`, background: attRate >= 80 ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#F59E0B,#D97706)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: attRate >= 80 ? '#10B981' : '#F59E0B', fontWeight: 600, textAlign: 'right' }}>
                        {attRate}% attendance rate
                    </p>
                </div>
            </div>

            {/* Salary Distribution Bar Chart */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <p style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={15} color="#8B5CF6" /> Salary Distribution (Top {salaryData.length})
                </p>
                {salaryData.length === 0
                    ? <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>No salary data available</p>
                    : (
                        /* Fixed-height wrapper — bars use absolute positioning inside */
                        <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '28px' }}>
                            {salaryData.map((emp, i) => {
                                const pct = Math.max(((emp.salary || 0) / maxSalary) * 100, 5);
                                const barH = `calc(${pct}% - 28px)`;
                                return (
                                    <div key={emp._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                        {/* salary label on top */}
                                        <span style={{ fontSize: '0.58rem', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(emp.salary)}</span>
                                        {/* bar */}
                                        <div style={{ width: '100%', height: barH, background: BAR_COLORS[i % BAR_COLORS.length], borderRadius: '4px 4px 0 0', minHeight: '8px', cursor: 'default', transition: 'opacity 0.15s' }}
                                            title={`${emp.name}: ₹${(emp.salary || 0).toLocaleString('en-IN')}`}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'} />
                                        {/* name label below */}
                                        <span style={{ fontSize: '0.58rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', textAlign: 'center', position: 'absolute', bottom: 0 }}>
                                            {emp.name.split(' ')[0]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </div>

        </div>
    );
};

// color array used in bar chart
const BAR_COLORS = ['#4F46E5','#7C3AED','#EC4899','#F97316','#10B981','#06B6D4','#F59E0B','#EF4444','#8B5CF6','#6366F1'];

export default Reports;
