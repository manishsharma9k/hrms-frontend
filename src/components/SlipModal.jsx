import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { downloadSlip, printSlip, calcDeductions, generateSlipHTML } from '../utils/slipUtils';

// SlipModal: shows inline preview + Download & Print buttons
const SlipModal = ({ emp, onClose }) => {
    if (!emp) return null;

    const params = {
        name: emp.name,
        email: emp.email,
        department: emp.department?.name || emp.department || 'N/A',
        salary: emp.salary || 0,
        presentDays: emp.presentDays ?? 26,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    };

    const html = generateSlipHTML(params);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '780px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Salary Slip — {emp.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={() => downloadSlip(params)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#4F46E5', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                            <Download size={14} /> Download
                        </button>
                        <button onClick={() => printSlip(params)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '0.5rem', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                            <Printer size={14} /> Print
                        </button>
                        <button onClick={onClose}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#64748B' }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
                {/* Iframe Preview */}
                <iframe
                    srcDoc={html}
                    style={{ flex: 1, border: 'none', width: '100%', minHeight: '500px' }}
                    title="Salary Slip Preview"
                />
            </div>
        </div>
    );
};

export default SlipModal;
