export const calcDeductions = (gross) => {
    const pf = Math.round(gross * 0.12);
    const pfEmployer = Math.round(gross * 0.12);
    const esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const esiEmployer = gross <= 21000 ? Math.round(gross * 0.0325) : 0;
    const tds = gross > 50000 ? Math.round((gross - 50000) * 0.1) : 0;
    const professional = gross > 15000 ? 200 : 0;
    const totalDeduction = pf + esi + tds + professional;
    const netSalary = gross - totalDeduction;
    return { pf, pfEmployer, esi, esiEmployer, tds, professional, totalDeduction, netSalary };
};

export const generateSlipHTML = ({ name, email, department, salary, presentDays = 26, month }) => {
    const gross = Math.round((salary / 26) * presentDays);
    const d = calcDeductions(gross);
    const mon = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payslip - ${name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b}
.page{max-width:720px;margin:0 auto;background:#fff;box-shadow:0 0 40px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;color:#fff}
.header h1{font-size:22px;font-weight:800;letter-spacing:-0.5px}
.header p{font-size:13px;opacity:0.8;margin-top:4px}
.badge{display:inline-block;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-top:8px}
.body{padding:32px 40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
.info-item{background:#f8fafc;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0}
.info-item label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:4px}
.info-item span{font-size:14px;font-weight:600;color:#0f172a}
.section{margin-bottom:24px}
.section-title{font-size:11px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.08em;padding:8px 12px;background:#ede9fe;border-radius:6px;margin-bottom:12px}
table{width:100%;border-collapse:collapse}
td,th{padding:10px 14px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left}
th{font-weight:600;color:#475569;background:#f8fafc}
.amount{text-align:right;font-weight:600}
.deduct{color:#ef4444}.earn{color:#10b981}
.net-row td{background:#d1fae5;font-weight:800;font-size:15px;color:#065f46}
.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;font-size:11px;color:#94a3b8}
@media print{body{background:#fff}.page{box-shadow:none}}
</style></head><body>
<div class="page">
<div class="header">
  <h1>HRMS Portal</h1><p>Salary Slip</p><span class="badge">${mon}</span>
</div>
<div class="body">
  <div class="info-grid">
    <div class="info-item"><label>Employee Name</label><span>${name}</span></div>
    <div class="info-item"><label>Department</label><span>${department || 'N/A'}</span></div>
    <div class="info-item"><label>Email</label><span>${email}</span></div>
    <div class="info-item"><label>Generated On</label><span>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
    <div class="info-item"><label>Days Present</label><span>${presentDays} / 26</span></div>
    <div class="info-item"><label>Gross CTC</label><span>&#8377;${salary.toLocaleString('en-IN')}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Earnings</div>
    <table>
      <tr><th>Component</th><th class="amount">Amount</th></tr>
      <tr><td>Basic Salary (40%)</td><td class="amount earn">&#8377;${Math.round(gross*0.4).toLocaleString('en-IN')}</td></tr>
      <tr><td>HRA (20%)</td><td class="amount earn">&#8377;${Math.round(gross*0.2).toLocaleString('en-IN')}</td></tr>
      <tr><td>Special Allowance (30%)</td><td class="amount earn">&#8377;${Math.round(gross*0.3).toLocaleString('en-IN')}</td></tr>
      <tr><td>Other Allowances (10%)</td><td class="amount earn">&#8377;${Math.round(gross*0.1).toLocaleString('en-IN')}</td></tr>
      <tr><th>Attendance Based Gross</th><th class="amount">&#8377;${gross.toLocaleString('en-IN')}</th></tr>
    </table>
  </div>
  <div class="section">
    <div class="section-title">Deductions</div>
    <table>
      <tr><th>Component</th><th class="amount">Employee</th><th class="amount">Employer</th></tr>
      <tr><td>Provident Fund (PF) @ 12%</td><td class="amount deduct">-&#8377;${d.pf.toLocaleString('en-IN')}</td><td class="amount earn">&#8377;${d.pfEmployer.toLocaleString('en-IN')}</td></tr>
      <tr><td>ESI ${salary<=21000?'@ 0.75%':'(Not Applicable)'}</td><td class="amount deduct">${d.esi>0?`-&#8377;${d.esi.toLocaleString('en-IN')}`:'&#8212;'}</td><td class="amount earn">${d.esiEmployer>0?`&#8377;${d.esiEmployer.toLocaleString('en-IN')}`:'&#8212;'}</td></tr>
      <tr><td>TDS (Income Tax)</td><td class="amount deduct">${d.tds>0?`-&#8377;${d.tds.toLocaleString('en-IN')}`:'&#8212;'}</td><td class="amount">&#8212;</td></tr>
      <tr><td>Professional Tax</td><td class="amount deduct">${d.professional>0?`-&#8377;${d.professional.toLocaleString('en-IN')}`:'&#8212;'}</td><td class="amount">&#8212;</td></tr>
      <tr><th>Total Deductions</th><th class="amount deduct">-&#8377;${d.totalDeduction.toLocaleString('en-IN')}</th><th class="amount">&#8212;</th></tr>
    </table>
  </div>
  <table><tr class="net-row"><td>Net Take-Home Salary</td><td class="amount">&#8377;${d.netSalary.toLocaleString('en-IN')}</td></tr></table>
</div>
<div class="footer"><p>This is a computer-generated payslip. No physical signature required.</p></div>
</div>
</body></html>`;
};

export const downloadSlip = (params) => {
    const html = generateSlipHTML(params);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const mon = params.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    a.download = `Payslip_${params.name.replace(/\s+/g, '_')}_${mon}.html`;
    a.click();
    URL.revokeObjectURL(url);
};

export const printSlip = (params) => {
    const html = generateSlipHTML(params);
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
};
