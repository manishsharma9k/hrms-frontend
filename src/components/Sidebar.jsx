import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Building2, Calendar, CreditCard,
    LogOut, UserCircle, CheckSquare, X, Clock, Briefcase,
    TrendingUp, BarChart2, Shield, Settings,
    ChevronDown, Zap, FileText, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// Admin nav — groups with dropdown children
const adminGroups = [
    {
        name: 'Dashboard', icon: LayoutDashboard, path: '/admin', exact: true,
        color: '#818CF8'
    },
    {
        name: 'People', icon: Users, color: '#34D399',
        children: [
            { name: 'Employees', icon: UserCheck, path: '/admin/employees' },
            { name: 'Departments', icon: Building2, path: '/admin/departments' },
            { name: 'Recruitment', icon: Briefcase, path: '/admin/recruitment' },
        ]
    },
    {
        name: 'Operations', icon: Zap, color: '#F472B6',
        children: [
            { name: 'Attendance', icon: Clock, path: '/admin/attendance' },
            { name: 'Leave Approvals', icon: CheckSquare, path: '/admin/leaves' },
            { name: 'Payroll & PF', icon: CreditCard, path: '/admin/payroll' },
        ]
    },
    {
        name: 'Insights', icon: BarChart2, color: '#FBBF24',
        children: [
            { name: 'Performance', icon: TrendingUp, path: '/admin/performance' },
            { name: 'Reports', icon: FileText, path: '/admin/reports' },
        ]
    },
    {
        name: 'System', icon: Shield, color: '#60A5FA',
        children: [
            { name: 'Access Control', icon: Shield, path: '/admin/access' },
            { name: 'Settings', icon: Settings, path: '/admin/settings' },
        ]
    },
];

const employeeLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employee', exact: true, color: '#818CF8' },
    { name: 'My Profile', icon: UserCircle, path: '/employee/profile', color: '#34D399' },
    { name: 'Leave Requests', icon: Calendar, path: '/employee/leaves', color: '#FBBF24' },
    { name: 'Attendance', icon: CheckSquare, path: '/employee/attendance', color: '#F472B6' },
    { name: 'Salary Details', icon: CreditCard, path: '/employee/salary', color: '#60A5FA' },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [openGroups, setOpenGroups] = useState({ People: true, Operations: true });

    // collapsed = icon-only mode when sidebar is not hovered/open
    const collapsed = !isOpen;

    const isAdmin = user?.role === 'admin';
    const accent = isAdmin ? '#7C3AED' : '#4F46E5';

    const toggleGroup = (name) => setOpenGroups(p => ({ ...p, [name]: !p[name] }));

    const isGroupActive = (group) =>
        group.children?.some(c => location.pathname.startsWith(c.path));

    const handleLogoutConfirm = () => {
        setShowLogoutConfirm(false);
        toast.success('Signed out successfully');
        logout();
    };

    return (
        <>
        <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
            width: collapsed ? '64px' : '248px',
            background: 'linear-gradient(180deg,#0F172A 0%,#1A1040 100%)',
            display: 'flex', flexDirection: 'column', height: '100vh',
            boxShadow: isOpen ? '6px 0 32px rgba(0,0,0,0.35)' : 'none',
            flexShrink: 0, transition: 'width 0.25s ease', overflow: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.04)'
        }}>

            {/* ── Logo ── */}
            <div style={{ padding: collapsed ? '1.125rem 0' : '1.125rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', minHeight: '62px', flexShrink: 0 }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ background: `linear-gradient(135deg,${accent},${accent}cc)`, padding: '0.5rem', borderRadius: '0.625rem', display: 'flex', flexShrink: 0, boxShadow: `0 4px 12px ${accent}55` }}>
                            <Building2 size={17} color="white" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'white', letterSpacing: '-0.3px' }}>HRMS Pro</p>
                            <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {isAdmin ? 'Admin Panel' : 'Employee Portal'}
                            </p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div style={{ background: `linear-gradient(135deg,${accent},${accent}cc)`, padding: '0.5rem', borderRadius: '0.625rem', display: 'flex', boxShadow: `0 4px 12px ${accent}55` }}>
                        <Building2 size={17} color="white" />
                    </div>
                )}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="sidebar-close-btn" onClick={closeSidebar}><X size={17} /></button>
                </div>
            </div>

            {/* ── Nav ── */}
            <div style={{ flex: 1, padding: collapsed ? '0.75rem 0.375rem' : '0.75rem 0.625rem', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>

                {isAdmin ? adminGroups.map((group, gi) => {
                    if (!group.children) {
                        // Single link (Dashboard)
                        return (
                            <NavLink key={gi} to={group.path} end={group.exact}
                                title={collapsed ? group.name : ''}
                                style={({ isActive }) => ({
                                    display: 'flex', alignItems: 'center',
                                    gap: collapsed ? 0 : '0.625rem',
                                    padding: collapsed ? '0.625rem' : '0.55rem 0.75rem',
                                    borderRadius: '0.625rem',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                                    background: isActive ? `linear-gradient(135deg,${accent}cc,${accent}88)` : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.83rem', textDecoration: 'none',
                                    transition: 'all 0.15s',
                                    boxShadow: isActive ? `0 2px 12px ${accent}44` : 'none',
                                    marginBottom: '0.25rem'
                                })}
                                onMouseEnter={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <group.icon size={15} color={group.color} />
                                </div>
                                {!collapsed && group.name}
                            </NavLink>
                        );
                    }

                    // Dropdown group
                    const isOpen = openGroups[group.name];
                    const active = isGroupActive(group);

                    return (
                        <div key={gi} style={{ marginBottom: '0.125rem' }}>
                            {/* Group header */}
                            <button onClick={() => !collapsed && toggleGroup(group.name)}
                                title={collapsed ? group.name : ''}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    gap: collapsed ? 0 : '0.625rem',
                                    padding: collapsed ? '0.625rem' : '0.55rem 0.75rem',
                                    borderRadius: '0.625rem',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                                    border: 'none', cursor: 'pointer',
                                    color: active ? 'white' : 'rgba(255,255,255,0.5)',
                                    fontWeight: active ? 600 : 400,
                                    fontSize: '0.83rem', transition: 'all 0.15s',
                                    borderLeft: active && !collapsed ? `2px solid ${group.color}` : '2px solid transparent',
                                }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}>
                                <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <group.icon size={15} color={group.color} />
                                </div>
                                {!collapsed && (
                                    <>
                                        <span style={{ flex: 1, textAlign: 'left' }}>{group.name}</span>
                                        <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'rgba(255,255,255,0.3)' }} />
                                    </>
                                )}
                            </button>

                            {/* Dropdown children */}
                            {!collapsed && isOpen && (
                                <div style={{ marginLeft: '0.875rem', marginTop: '0.125rem', paddingLeft: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                    {group.children.map((child, ci) => (
                                        <NavLink key={ci} to={child.path}
                                            style={({ isActive }) => ({
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.45rem 0.625rem',
                                                borderRadius: '0.5rem',
                                                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                                                background: isActive ? `${accent}55` : 'transparent',
                                                fontWeight: isActive ? 600 : 400,
                                                fontSize: '0.8rem', textDecoration: 'none',
                                                transition: 'all 0.15s',
                                                borderLeft: isActive ? `2px solid ${group.color}` : '2px solid transparent',
                                            })}
                                            onMouseEnter={e => { if (!e.currentTarget.style.background.includes(accent.slice(1))) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
                                            onMouseLeave={e => { if (!e.currentTarget.style.background.includes(accent.slice(1))) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}>
                                            <child.icon size={13} style={{ flexShrink: 0 }} />
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                }) : employeeLinks.map((link, i) => (
                    <NavLink key={i} to={link.path} end={link.exact}
                        title={collapsed ? link.name : ''}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center',
                            gap: collapsed ? 0 : '0.625rem',
                            padding: collapsed ? '0.625rem' : '0.55rem 0.75rem',
                            borderRadius: '0.625rem',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                            background: isActive ? `linear-gradient(135deg,${accent}cc,${accent}88)` : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.83rem', textDecoration: 'none',
                            transition: 'all 0.15s',
                            boxShadow: isActive ? `0 2px 12px ${accent}44` : 'none',
                        })}
                        onMouseEnter={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                        onMouseLeave={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'transparent'; }}>
                        <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <link.icon size={15} color={link.color} />
                        </div>
                        {!collapsed && link.name}
                    </NavLink>
                ))}
            </div>

            {/* ── User Footer ── */}
            <div style={{ padding: collapsed ? '0.75rem 0.375rem' : '0.75rem 0.625rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.625rem', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg,${accent},${accent}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 8px ${accent}44` }}>
                            {user?.photo ? <img src={user.photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.78rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>{user?.designation || user?.role}</p>
                        </div>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', flexShrink: 0, boxShadow: '0 0 6px #10B981' }} />
                    </div>
                )}
                <button onClick={() => setShowLogoutConfirm(true)}
                    title={collapsed ? 'Sign Out' : ''}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.5rem', padding: collapsed ? '0.6rem' : '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#FEE2E2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#FCA5A5'; }}>
                    <LogOut size={14} style={{ flexShrink: 0 }} />
                    {!collapsed && 'Sign Out'}
                </button>
            </div>
        </div>

        {/* Logout Confirmation Modal — portal to escape overflow:hidden */}
        {showLogoutConfirm && createPortal(
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                onClick={e => e.target === e.currentTarget && setShowLogoutConfirm(false)}>
                <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: '400px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'fadeInScale 0.18s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.875rem 0.875rem 0' }}>
                        <button onClick={() => setShowLogoutConfirm(false)}
                            style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>
                            <X size={15} />
                        </button>
                    </div>
                    <div style={{ padding: '0.5rem 1.75rem 0' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <LogOut size={26} color="#EF4444" />
                        </div>
                        <p style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>Sign Out</p>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>Are you sure you want to sign out, <strong>{user?.name}</strong>?</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>You will need to log in again to access the dashboard.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem 1.75rem' }}>
                        <button onClick={() => setShowLogoutConfirm(false)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>
                            <X size={15} /> Cancel
                        </button>
                        <button onClick={handleLogoutConfirm}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#EF4444', border: 'none', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            <LogOut size={15} /> Yes, Sign Out
                        </button>
                    </div>
                </div>
                <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
            </div>,
            document.body
        )}
        </>
    );
};

export default Sidebar;
