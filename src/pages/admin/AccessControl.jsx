import React, { useState } from 'react';
import { Shield, Plus, X, Check, Lock, Eye, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultRoles = [
    { id: 1, name: 'Super Admin', description: 'Full system access', color: '#EF4444', bg: '#FEE2E2', permissions: ['view_employees', 'edit_employees', 'delete_employees', 'view_payroll', 'edit_payroll', 'view_leaves', 'approve_leaves', 'view_reports', 'manage_roles', 'view_recruitment', 'manage_departments'] },
    { id: 2, name: 'HR Manager', description: 'Manage people & leaves', color: '#4F46E5', bg: '#EDE9FE', permissions: ['view_employees', 'edit_employees', 'view_leaves', 'approve_leaves', 'view_reports', 'view_recruitment', 'manage_departments'] },
    { id: 3, name: 'Finance Manager', description: 'Payroll & financial data', color: '#10B981', bg: '#D1FAE5', permissions: ['view_employees', 'view_payroll', 'edit_payroll', 'view_reports'] },
    { id: 4, name: 'Team Lead', description: 'View team data', color: '#F59E0B', bg: '#FEF3C7', permissions: ['view_employees', 'view_leaves', 'view_reports'] },
    { id: 5, name: 'Employee', description: 'Personal data only', color: '#64748B', bg: '#F1F5F9', permissions: ['view_leaves'] },
];

const allPermissions = [
    { key: 'view_employees', label: 'View Employees', group: 'Employees' },
    { key: 'edit_employees', label: 'Edit Employees', group: 'Employees' },
    { key: 'delete_employees', label: 'Delete Employees', group: 'Employees' },
    { key: 'manage_departments', label: 'Manage Departments', group: 'Employees' },
    { key: 'view_payroll', label: 'View Payroll', group: 'Payroll' },
    { key: 'edit_payroll', label: 'Edit Payroll', group: 'Payroll' },
    { key: 'view_leaves', label: 'View Leaves', group: 'Leaves' },
    { key: 'approve_leaves', label: 'Approve/Reject Leaves', group: 'Leaves' },
    { key: 'view_reports', label: 'View Reports', group: 'Reports' },
    { key: 'view_recruitment', label: 'View Recruitment', group: 'Recruitment' },
    { key: 'manage_roles', label: 'Manage Roles', group: 'System' },
];

const groups = [...new Set(allPermissions.map(p => p.group))];

const AccessControl = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState(defaultRoles);
    const [selected, setSelected] = useState(defaultRoles[0]);
    const [showModal, setShowModal] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '', color: '#4F46E5', bg: '#EDE9FE', permissions: [] });
    const [roleLoading, setRoleLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const togglePermission = (roleId, perm) => {
        setRoles(r => r.map(role => {
            if (role.id !== roleId) return role;
            const has = role.permissions.includes(perm);
            const updated = { ...role, permissions: has ? role.permissions.filter(p => p !== perm) : [...role.permissions, perm] };
            if (selected?.id === roleId) setSelected(updated);
            return updated;
        }));
    };

    const addRole = () => {
        if (!newRole.name) return;
        setRoleLoading(true);
        // simulate brief async save
        setTimeout(() => {
            const role = { ...newRole, id: Date.now() };
            setRoles(r => [...r, role]);
            setNewRole({ name: '', description: '', color: '#4F46E5', bg: '#EDE9FE', permissions: [] });
            setShowModal(false);
            setRoleLoading(false);
        }, 400);
    };

    const deleteRole = (id) => {
        if (roles.length <= 1) return;
        setDeletingId(id);
        setTimeout(() => {
            setRoles(r => r.filter(role => role.id !== id));
            if (selected?.id === id) setSelected(roles[0]);
            setDeletingId(null);
        }, 400);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Shield size={20} color="#6366F1" /> Role-Based Access Control</h2>
                    <p className="page-subtitle">Manage roles and permissions for your organization</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Role</button>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Roles List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Roles ({roles.length})</p>
                    {roles.map(role => (
                        <div key={role.id} onClick={() => setSelected(role)}
                            style={{ padding: '1rem', borderRadius: '0.75rem', border: `2px solid ${selected?.id === role.id ? role.color : '#E2E8F0'}`, background: selected?.id === role.id ? role.bg : '#fff', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: role.bg, border: `2px solid ${role.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={16} color={role.color} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>{role.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>{role.description}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: role.color, background: role.bg, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>{role.permissions.length} perms</span>
                                {role.id !== 1 && (
                                    <button onClick={e => { e.stopPropagation(); deleteRole(role.id); }} disabled={deletingId === role.id} className="btn-ghost" style={{ color: '#EF4444', padding: '0.25rem' }}>
                                        {deletingId === role.id ? <span className="btn-spinner-dark" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#EF4444' }} /> : <Trash2 size={14} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Permissions Panel */}
                {selected && (
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selected.bg, border: `2px solid ${selected.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={18} color={selected.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>{selected.name}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{selected.description}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {groups.map(group => (
                                <div key={group}>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{group}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                        {allPermissions.filter(p => p.group === group).map(perm => {
                                            const has = selected.permissions.includes(perm.key);
                                            return (
                                                <div key={perm.key} onClick={() => togglePermission(selected.id, perm.key)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', background: has ? 'rgba(79,70,229,0.05)' : '#F8FAFC', border: `1px solid ${has ? 'rgba(79,70,229,0.2)' : '#E2E8F0'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {has ? <Lock size={13} color="#4F46E5" /> : <Eye size={13} color="#94A3B8" />}
                                                        <span style={{ fontSize: '0.8rem', fontWeight: has ? 600 : 400, color: has ? '#0F172A' : '#64748B' }}>{perm.label}</span>
                                                    </div>
                                                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: has ? '#4F46E5' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                                                        {has && <Check size={11} color="white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Role Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">Create New Role</h3>
                            <button onClick={() => setShowModal(false)} className="btn-ghost"><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Role Name</label>
                                <input className="form-input" placeholder="e.g. Department Manager" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Description</label>
                                <input className="form-input" placeholder="Brief description" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Permissions</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    {allPermissions.map(perm => {
                                        const has = newRole.permissions.includes(perm.key);
                                        return (
                                            <div key={perm.key} onClick={() => setNewRole(r => ({ ...r, permissions: has ? r.permissions.filter(p => p !== perm.key) : [...r.permissions, perm.key] }))}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: has ? 'rgba(79,70,229,0.05)' : '#F8FAFC', border: `1px solid ${has ? 'rgba(79,70,229,0.2)' : '#E2E8F0'}`, cursor: 'pointer' }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: has ? '#4F46E5' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {has && <Check size={10} color="white" strokeWidth={3} />}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: has ? '#0F172A' : '#64748B', fontWeight: has ? 600 : 400 }}>{perm.label}</span>
                                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#94A3B8' }}>{perm.group}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={addRole} disabled={roleLoading}>
                                    {roleLoading ? <><span className="btn-spinner" /> Creating...</> : 'Create Role'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessControl;
