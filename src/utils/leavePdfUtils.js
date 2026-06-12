import { jsPDF } from 'jspdf';

const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getEmployeeName       = (leave, emp) => emp?.name        || leave?.employee?.name        || 'Employee';
const getEmployeeEmail      = (leave, emp) => emp?.email       || leave?.employee?.email       || 'N/A';
const getEmployeeId         = (leave, emp) => emp?.employeeId  || leave?.employee?.employeeId  || 'N/A';
const getEmployeeDepartment = (leave, emp) => emp?.department?.name || leave?.employee?.department?.name || 'N/A';
const getEmployeePhone      = (leave, emp) => emp?.phone       || leave?.employee?.phone       || 'N/A';
const getEmployeeDesig      = (leave, emp) => emp?.designation || leave?.employee?.designation || 'N/A';
const getEmployeeTech       = (leave, emp) => emp?.technology  || leave?.employee?.technology  || 'N/A';

// ── Draw coloured header bar ──────────────────────────────────────────────────
const drawHeader = (doc, title, subtitle, color) => {
    const [r, g, b] = color;
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 595, 80, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('HRMS Portal', 40, 32);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 40, 52);
    doc.setFontSize(10);
    doc.text(subtitle, 40, 68);
    doc.setTextColor(0, 0, 0);
};

// ── Draw a labelled info table ────────────────────────────────────────────────
const drawTable = (doc, rows, startY, margin = 40) => {
    let y = startY;
    rows.forEach(([label, value], i) => {
        if (i % 2 === 0) doc.setFillColor(248, 250, 252);
        else doc.setFillColor(255, 255, 255);
        doc.rect(margin, y - 12, 515, 18, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin + 6, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(String(value), 310);
        doc.text(lines, margin + 200, y);
        y += Math.max(18, lines.length * 14);
    });
    return y;
};

// ── Employee info block (common to all PDFs) ──────────────────────────────────
const drawEmployeeSection = (doc, leave, employee, startY, margin = 40) => {
    let y = startY;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text('EMPLOYEE INFORMATION', margin, y);
    y += 6;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.8);
    doc.line(margin, y, 555, y);
    y += 14;

    y = drawTable(doc, [
        ['Employee Name',  getEmployeeName(leave, employee)],
        ['Employee ID',    getEmployeeId(leave, employee)],
        ['Email Address',  getEmployeeEmail(leave, employee)],
        ['Department',     getEmployeeDepartment(leave, employee)],
        ['Designation',    getEmployeeDesig(leave, employee)],
        ['Technology',     getEmployeeTech(leave, employee)],
        ['Phone Number',   getEmployeePhone(leave, employee)],
    ], y, margin);

    return y + 10;
};

// ── Leave details block ───────────────────────────────────────────────────────
const drawLeaveSection = (doc, rows, sectionTitle, startY, margin = 40) => {
    let y = startY;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text(sectionTitle, margin, y);
    y += 6;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.8);
    doc.line(margin, y, 555, y);
    y += 14;
    y = drawTable(doc, rows, y, margin);
    return y + 10;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE APPLICATION PDF
// ─────────────────────────────────────────────────────────────────────────────
export const generateLeaveApplicationPDF = (leave, employee = {}) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const name       = getEmployeeName(leave, employee);
    const department = getEmployeeDepartment(leave, employee);
    const startDate  = formatDate(leave.startDate);
    const endDate    = formatDate(leave.endDate);
    const days       = leave.startDate && leave.endDate ? Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1 : '—';
    const reason     = leave.reason || 'No reason provided.';
    const generatedOn = formatDate(new Date());

    drawHeader(doc, 'Leave Application Form', `Generated on ${generatedOn}`, [79, 70, 229]);

    let y = 104;

    // Body letter
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const letter = `To,\nThe HR Manager,\nHR Department\n\nSubject: Leave Application\n\nRespected Sir/Madam,\n\nI, ${name}, working in the ${department} department, would like to apply for leave from ${startDate} to ${endDate} (${days} day${days === 1 ? '' : 's'}). I kindly request your approval for this leave period.\n\nReason for leave: ${reason}\n\nI will ensure that all pending work is properly handed over and my responsibilities are covered during my absence.\n\nThank you for your consideration.\n\nYours sincerely,\n${name}`;
    const lines = doc.splitTextToSize(letter, 515);
    doc.text(lines, margin, y);
    y += lines.length * 13.5 + 20;

    // Employee information
    y = drawEmployeeSection(doc, leave, employee, y, margin);

    // Leave details
    y = drawLeaveSection(doc, [
        ['Leave Start Date', startDate],
        ['Leave End Date',   endDate],
        ['Total Days',       `${days} day${days === 1 ? '' : 's'}`],
        ['Reason',           reason],
        ['Status',           leave.status || 'Pending'],
        ['Applied On',       generatedOn],
    ], 'LEAVE DETAILS', y, margin);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('HRMS Portal — This is a system-generated document.', margin, 820);

    return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE APPROVAL PDF
// ─────────────────────────────────────────────────────────────────────────────
export const generateLeaveApprovalPDF = (leave, employee = {}) => {
    if (!leave) return null;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const name        = getEmployeeName(leave, employee);
    const startDate   = formatDate(leave.startDate);
    const endDate     = formatDate(leave.endDate);
    const days        = leave.startDate && leave.endDate ? Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1 : '—';
    const reason      = leave.reason || 'No reason provided.';
    const generatedOn = formatDate(new Date());
    const processedBy = leave.processedBy || 'HR Manager';

    drawHeader(doc, 'Leave Approval Letter', `Generated on ${generatedOn}`, [16, 185, 129]);

    let y = 104;

    // Approval letter body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const letter = `To,\n${name}\n\nSubject: Leave Approval\n\nDear ${name},\n\nThis is to inform you that your leave request for the period from ${startDate} to ${endDate} (${days} day${days === 1 ? '' : 's'}) has been approved.\n\nPlease ensure that your duties are properly handed over and all pending work is updated before your leave begins.\n\nReason for leave: ${reason}\n\nWe wish you a restful break and look forward to your return.\n\nWarm regards,\n${processedBy}\nHR Department`;
    const lines = doc.splitTextToSize(letter, 515);
    doc.text(lines, margin, y);
    y += lines.length * 13.5 + 20;

    // Employee information
    y = drawEmployeeSection(doc, leave, employee, y, margin);

    // Leave details
    y = drawLeaveSection(doc, [
        ['Leave Start Date', startDate],
        ['Leave End Date',   endDate],
        ['Total Days',       `${days} day${days === 1 ? '' : 's'}`],
        ['Reason',           reason],
        ['Status',           'Approved ✓'],
        ['Approved By',      processedBy],
        ['Approved On',      generatedOn],
    ], 'APPROVED LEAVE DETAILS', y, margin);

    // Signature
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Signature:', margin, y);
    y += 30;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('_____________________________', margin, y);
    y += 16;
    doc.text(processedBy, margin, y);
    y += 14;
    doc.text('HR Department — HRMS Portal', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('HRMS Portal — This is a system-generated document.', margin, 820);

    return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REJECTION PDF
// ─────────────────────────────────────────────────────────────────────────────
export const generateLeaveRejectionPDF = (leave, employee = {}) => {
    if (!leave) return null;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const name            = getEmployeeName(leave, employee);
    const startDate       = formatDate(leave.startDate);
    const endDate         = formatDate(leave.endDate);
    const days            = leave.startDate && leave.endDate ? Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1 : '—';
    const reason          = leave.reason || 'No reason provided.';
    const rejectionReason = leave.rejectionReason || 'Not specified.';
    const generatedOn     = formatDate(new Date());
    const processedBy     = leave.processedBy || 'HR Manager';

    drawHeader(doc, 'Leave Rejection Letter', `Generated on ${generatedOn}`, [239, 68, 68]);

    let y = 104;

    // Rejection letter body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const letter = `To,\n${name}\n\nSubject: Leave Request Rejected\n\nDear ${name},\n\nThis is to inform you that your leave request for the period from ${startDate} to ${endDate} (${days} day${days === 1 ? '' : 's'}) has been reviewed and unfortunately could not be approved at this time.\n\nReason for leave requested: ${reason}\n\nReason for rejection: ${rejectionReason}\n\nIf you have any questions, please contact the HR department. You may reapply after addressing the mentioned concerns.\n\nWe appreciate your understanding.\n\nRegards,\n${processedBy}\nHR Department`;
    const lines = doc.splitTextToSize(letter, 515);
    doc.text(lines, margin, y);
    y += lines.length * 13.5 + 20;

    // Employee information
    y = drawEmployeeSection(doc, leave, employee, y, margin);

    // Leave details
    y = drawLeaveSection(doc, [
        ['Leave Start Date',  startDate],
        ['Leave End Date',    endDate],
        ['Total Days',        `${days} day${days === 1 ? '' : 's'}`],
        ['Leave Reason',      reason],
        ['Rejection Reason',  rejectionReason],
        ['Status',            'Rejected ✗'],
        ['Rejected By',       processedBy],
        ['Rejected On',       generatedOn],
    ], 'REJECTED LEAVE DETAILS', y, margin);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('HRMS Portal — This is a system-generated document.', margin, 820);

    return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const downloadLeaveApplicationPDF = (leave, employee = {}) => {
    if (!leave) return;
    const doc = generateLeaveApplicationPDF(leave, employee);
    const name = getEmployeeName(leave, employee).replace(/\s+/g, '_');
    const date = leave.startDate ? new Date(leave.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    doc.save(`Leave_Application_${name}_${date}.pdf`);
};

export const downloadLeaveApprovalPDF = (leave, employee = {}) => {
    if (!leave) return;
    const doc = generateLeaveApprovalPDF(leave, employee);
    if (!doc) return;
    const name = getEmployeeName(leave, employee).replace(/\s+/g, '_');
    const date = leave.startDate ? new Date(leave.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    doc.save(`Leave_Approval_${name}_${date}.pdf`);
};

export const downloadLeaveRejectionPDF = (leave, employee = {}) => {
    if (!leave) return;
    const doc = generateLeaveRejectionPDF(leave, employee);
    if (!doc) return;
    const name = getEmployeeName(leave, employee).replace(/\s+/g, '_');
    const date = leave.startDate ? new Date(leave.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    doc.save(`Leave_Rejection_${name}_${date}.pdf`);
};
