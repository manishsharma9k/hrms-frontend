import React, { useState, useEffect, useRef, useContext } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Trash2, Check, Ban } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { holidaysAPI, employeeHolidaysAPI } from '../services/api';

const TYPE_COLOR = {
    National: { dot: '#EF4444', bg: '#FEE2E2', border: '#FECACA', text: '#991B1B' },
    Regional: { dot: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
    Company:  { dot: '#4F46E5', bg: '#EDE9FE', border: '#C4B5FD', text: '#3730A3' },
    Optional: { dot: '#10B981', bg: '#D1FAE5', border: '#A7F3D0', text: '#065F46' },
};

const STATUS_STYLE = {
    Approved: { bg: '#D1FAE5', color: '#065F46' },
    Rejected: { bg: '#FEE2E2', color: '#991B1B' },
    Pending:  { bg: '#FEF3C7', color: '#92400E' },
};

const HolidayCalendar = ({ isAdmin = false }) => {
    const { } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'Company', description: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [btnRect, setBtnRect] = useState(null);
    const panelRef = useRef(null);
    const btnRef = useRef(null);

    useEffect(() => {
        fetchHolidays();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setBtnRect(r);
        }
        setOpen(o => !o);
    };

    const fetchHolidays = async () => {
        try {
            const res = isAdmin ? await holidaysAPI.getAll() : await employeeHolidaysAPI.getAll();
            setHolidays(res.data.data || []);
        } catch {}
    };

    const addHoliday = async () => {
        if (!newHoliday.name || !newHoliday.date) { setError('Name and date are required'); return; }
        setSaving(true); setError('');
        try {
            await holidaysAPI.add(newHoliday);
            setNewHoliday({ name: '', date: '', type: 'Company', description: '' });
            setShowAddModal(false);
            fetchHolidays();
        } catch (err) { setError(err.response?.data?.error || 'Failed to add holiday'); }
        finally { setSaving(false); }
    };

    const deleteHoliday = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this holiday?')) return;
        try { await holidaysAPI.delete(id); fetchHolidays(); } catch {}
    };

    const updateStatus = async (id, status, e) => {
        e.stopPropagation();
        try { await holidaysAPI.updateStatus(id, { status }); fetchHolidays(); } catch {}
    };

    // Calendar helpers
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const getHolidayForDay = (day) => {
        if (!day) return null;
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays.find(h => h.date?.split('T')[0] === ds);
    };

    const isToday = (day) => {
        const t = new Date();
        return day && day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
    };

    const isWeekend = (index) => {
        const dow = index % 7;
        return dow === 0 || dow === 6;
    };

    const monthHolidays = holidays.filter(h => {
        const d = new Date(h.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    const upcomingHolidays = [...holidays]
        .filter(h => new Date(h.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6);

    const handleDayClick = (day) => {
        if (!day) return;
        const h = getHolidayForDay(day);
        setSelectedDay({ day, holiday: h });
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Trigger Button */}
            <button
                ref={btnRef}
                onClick={handleToggle}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 0.875rem', background: open ? '#4F46E5' : '#fff',
                    border: '1.5px solid', borderColor: open ? '#4F46E5' : '#E2E8F0',
                    borderRadius: '0.625rem', cursor: 'pointer', fontSize: '0.82rem',
                    fontWeight: 600, color: open ? '#fff' : '#374151',
                    transition: 'all 0.15s', boxShadow: open ? '0 4px 12px rgba(79,70,229,0.25)' : 'none',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; } }}
                onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#374151'; } }}
            >
                <Calendar size={15} />
                Holidays
                {upcomingHolidays.length > 0 && (
                    <span style={{ background: open ? 'rgba(255,255,255,0.25)' : '#EDE9FE', color: open ? '#fff' : '#4F46E5', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                        {upcomingHolidays.length}
                    </span>
                )}
            </button>

            {/* Calendar Panel — position:fixed so it's never clipped by any parent */}
            {open && btnRect && (
                <div ref={panelRef} style={{
                    position: 'fixed',
                    top: btnRect.bottom + 8,
                    right: Math.max(8, window.innerWidth - btnRect.right),
                    width: '360px',
                    maxHeight: 'calc(100vh - 80px)',
                    overflowY: 'auto',
                    background: '#fff', borderRadius: '1rem',
                    border: '1px solid #E2E8F0', boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
                    zIndex: 9998
                }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>Holiday Calendar</p>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {isAdmin && (
                                    <button onClick={() => { setShowAddModal(true); setOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.625rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.375rem', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <Plus size={12} /> Add
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.375rem', display: 'flex' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                        {/* Month Nav */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', display: 'flex' }}>
                                <ChevronLeft size={16} />
                            </button>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'white' }}>
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', display: 'flex' }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '1rem 1.25rem' }}>
                        {/* Day Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '0.375rem' }}>
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
                                <div key={i} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: i === 0 || i === 6 ? '#EF4444' : '#94A3B8', padding: '0.25rem 0' }}>{d}</div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
                            {days.map((day, i) => {
                                const holiday = getHolidayForDay(day);
                                const today = isToday(day);
                                const weekend = isWeekend(i);
                                const cfg = holiday ? TYPE_COLOR[holiday.type] : null;
                                return (
                                    <div key={i} onClick={() => handleDayClick(day)}
                                        style={{
                                            textAlign: 'center', padding: '0.3rem 0.1rem', borderRadius: '0.375rem',
                                            fontSize: '0.75rem', fontWeight: today ? 800 : 500,
                                            background: today ? '#4F46E5' : holiday ? cfg.bg : 'transparent',
                                            color: today ? '#fff' : holiday ? cfg.text : weekend ? '#EF4444' : day ? '#0F172A' : 'transparent',
                                            border: holiday && !today ? `1px solid ${cfg.border}` : '1px solid transparent',
                                            cursor: day ? 'pointer' : 'default',
                                            position: 'relative', transition: 'all 0.1s'
                                        }}
                                        title={holiday?.name}
                                        onMouseEnter={e => { if (day && !today) e.currentTarget.style.background = holiday ? cfg.bg : '#F8FAFC'; }}
                                        onMouseLeave={e => { if (day && !today) e.currentTarget.style.background = holiday ? cfg.bg : 'transparent'; }}>
                                        {day || ''}
                                        {holiday && (
                                            <div style={{ position: 'absolute', bottom: '1px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: today ? 'white' : cfg.dot }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Selected Day Info */}
                        {selectedDay?.holiday && (
                            <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.75rem', background: TYPE_COLOR[selectedDay.holiday.type].bg, borderRadius: '0.5rem', border: `1px solid ${TYPE_COLOR[selectedDay.holiday.type].border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: TYPE_COLOR[selectedDay.holiday.type].text }}>{selectedDay.holiday.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>{selectedDay.holiday.description || selectedDay.holiday.type + ' Holiday'}</p>
                                </div>
                                {isAdmin && (
                                    <button onClick={(e) => deleteHoliday(selectedDay.holiday._id, e)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                            {Object.entries(TYPE_COLOR).map(([type, cfg]) => (
                                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot }} />
                                    <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 500 }}>{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* This Month's Holidays */}
                    {monthHolidays.length > 0 && (
                        <div style={{ borderTop: '1px solid #F1F5F9', padding: '0.75rem 1.25rem' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>This Month</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                {monthHolidays.map(h => {
                                    const cfg = TYPE_COLOR[h.type];
                                    return (
                                        <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0.5rem', background: '#F8FAFC', borderRadius: '0.375rem', borderLeft: `3px solid ${cfg.dot}` }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{h.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748B' }}>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 600, background: STATUS_STYLE[h.status]?.bg || '#F1F5F9', color: STATUS_STYLE[h.status]?.color || '#64748B', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>{h.status || 'Approved'}</span>
                                                {isAdmin && (
                                                    <>
                                                        {h.status !== 'Approved' && <button onClick={(e) => updateStatus(h._id, 'Approved', e)} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: '0.1rem', display: 'flex' }} title="Approve"><Check size={13} /></button>}
                                                        {h.status !== 'Rejected' && <button onClick={(e) => updateStatus(h._id, 'Rejected', e)} style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', padding: '0.1rem', display: 'flex' }} title="Reject"><Ban size={13} /></button>}
                                                        <button onClick={(e) => deleteHoliday(h._id, e)} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.1rem', display: 'flex' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                                            onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Holiday Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Holiday</h3>
                            <button onClick={() => setShowAddModal(false)} className="btn-ghost"><X size={18} /></button>
                        </div>
                        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', borderLeft: '3px solid #EF4444' }}>{error}</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Holiday Name *</label>
                                <input className="form-input" placeholder="e.g. Diwali" value={newHoliday.name} onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date *</label>
                                    <input className="form-input" type="date" value={newHoliday.date} onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Type</label>
                                    <select className="form-input" value={newHoliday.type} onChange={e => setNewHoliday({ ...newHoliday, type: e.target.value })}>
                                        <option value="National">National</option>
                                        <option value="Regional">Regional</option>
                                        <option value="Company">Company</option>
                                        <option value="Optional">Optional</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Description</label>
                                <input className="form-input" placeholder="Optional description" value={newHoliday.description} onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={addHoliday} disabled={saving}>{saving ? 'Adding...' : 'Add Holiday'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayCalendar;
