'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'

// ─── Scroll Reveal ───
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ─── Progress Bar ───
function ProgressBar({ value, max = 100, color, height = 8 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
    </div>
  )
}

// ─── Section ───
function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={sty.sectionHeader}>
        <div style={sty.sectionIcon}>{icon}</div>
        <h2 style={sty.sectionTitle}>{title}</h2>
      </div>
      {visible && children}
    </div>
  )
}

// ── DATA ──

const reportCategories = [
  { label: 'Environmental Clearance (EC)', total: 24, compliant: 24, color: GREEN },
  { label: 'Consent to Operate (CTO)', total: 12, compliant: 12, color: GREEN },
  { label: 'CEMS Data Submissions', total: 365, compliant: 362, color: AMBER },
  { label: 'Hazardous Waste Returns', total: 4, compliant: 4, color: GREEN },
  { label: 'Water Cess Returns', total: 4, compliant: 4, color: GREEN },
  { label: 'Mining Plan Compliance', total: 6, compliant: 6, color: GREEN },
]

const ecConditions = [
  {
    id: 'EC-01', condition: 'Install CEMS at main stack and connect to CPCB/SPCB server for real-time monitoring',
    status: 'compliant', evidence: 'Gasmet DX4000 FTIR installed. Data uploading to OCEMS server 24/7 since Jan 2024. Last audit: 05 Mar 2026 — deviation < 5%.',
    category: 'Air Quality', dueDate: 'Continuous', lastVerified: '05 Mar 2026',
  },
  {
    id: 'EC-02', condition: 'Maintain stack emission within prescribed limits — PM: 50 mg/Nm3, SO2: 100 mg/Nm3, NOx: 400 mg/Nm3',
    status: 'compliant', evidence: 'Current readings — PM: 28 mg/Nm3 (56% of limit), SO2: 42 mg/Nm3 (42%), NOx: 385 mg/Nm3 (96%). Third-party isokinetic test on 15 Mar 2026 confirmed values.',
    category: 'Air Quality', dueDate: 'Continuous', lastVerified: '15 Mar 2026',
  },
  {
    id: 'EC-03', condition: 'Achieve Zero Liquid Discharge (ZLD). No wastewater discharge to any water body or land.',
    status: 'compliant', evidence: 'ETP (200 KLD) + RO + MEE system operational. All treated water recycled for cooling and dust suppression. SPCB verified on 28 Feb 2026. Recycle rate: 92.4%.',
    category: 'Water', dueDate: 'Continuous', lastVerified: '28 Feb 2026',
  },
  {
    id: 'EC-04', condition: 'Develop green belt over 33% of total plant area with native species',
    status: 'compliant', evidence: '42 hectares developed (108% of 39 ha target). 15,200 trees planted — Neem, Peepal, Banyan, Ashoka, Bamboo. Geo-tagged survey submitted to MoEFCC.',
    category: 'Green Belt', dueDate: 'Ongoing', lastVerified: '20 Feb 2026',
  },
  {
    id: 'EC-05', condition: 'Install Ambient Air Quality Monitoring (AAQM) stations at 4 locations around plant',
    status: 'compliant', evidence: 'AAQM stations at: Plant Gate (N), Colony (S), School (E), Village (W). Latest PM10 readings: 72, 65, 58, 82 ug/m3 (all below 100 ug/m3 limit). PM2.5: 35, 32, 28, 42.',
    category: 'Air Quality', dueDate: 'Continuous', lastVerified: '10 Mar 2026',
  },
  {
    id: 'EC-06', condition: 'Submit half-yearly EC compliance report to MoEFCC regional office',
    status: 'compliant', evidence: 'H2 FY26 report submitted on 20 Feb 2026. Covers Oct 2025 — Mar 2026. All 24 conditions addressed with documentary evidence. Acknowledgement received.',
    category: 'Reporting', dueDate: '30 Sep / 31 Mar', lastVerified: '20 Feb 2026',
  },
  {
    id: 'EC-07', condition: 'Ensure proper handling, storage, and disposal of hazardous waste through CPCB-authorized facilities',
    status: 'compliant', evidence: 'HW categories: Used Oil (2.4 KL/month → authorized recycler), E-Waste (0.12 MT → CPCB handler), CKD (1200 MT → recycled to raw mill at 95%). Annual HW return filed 15 Feb 2026.',
    category: 'Waste', dueDate: 'Annual return', lastVerified: '15 Feb 2026',
  },
  {
    id: 'EC-08', condition: 'Conduct Environmental Impact Assessment (EIA) study every 5 years or before capacity expansion',
    status: 'compliant', evidence: 'Last EIA conducted by NEERI (Nagpur) in Sep 2023 for 2.5 MTPA expansion. Report submitted to MoEFCC. Next due: Sep 2028 or before next expansion.',
    category: 'EIA', dueDate: 'Sep 2028', lastVerified: 'Sep 2023',
  },
  {
    id: 'EC-09', condition: 'Occupational health checkup for all workers exposed to dust — annual medical examination',
    status: 'compliant', evidence: '284 workers examined in Jan 2026. Spirometry + chest X-ray + audiometry. 2 workers reassigned from high-dust zones. Report submitted to DGFASLI.',
    category: 'Health & Safety', dueDate: 'Annual (Jan)', lastVerified: 'Jan 2026',
  },
  {
    id: 'EC-10', condition: 'Rainwater harvesting system with capacity to store minimum 50% of annual rainfall on plant premises',
    status: 'compliant', evidence: '3 rainwater harvesting ponds (total capacity: 42,000 KL). Recharge wells: 8. FY26 harvest: 38,400 KL (62% of annual rainfall). Used for green belt irrigation.',
    category: 'Water', dueDate: 'Continuous', lastVerified: '10 Mar 2026',
  },
]

const ctoConditions = [
  { parameter: 'Stack PM Emission', prescribed: '50 mg/Nm3', actual: '28 mg/Nm3', status: 'compliant' },
  { parameter: 'Stack SO2', prescribed: '100 mg/Nm3', actual: '42 mg/Nm3', status: 'compliant' },
  { parameter: 'Stack NOx', prescribed: '400 mg/Nm3', actual: '385 mg/Nm3', status: 'compliant' },
  { parameter: 'Ambient PM10 (max)', prescribed: '100 ug/m3', actual: '82 ug/m3', status: 'compliant' },
  { parameter: 'Ambient PM2.5 (max)', prescribed: '60 ug/m3', actual: '42 ug/m3', status: 'compliant' },
  { parameter: 'Noise Level (day boundary)', prescribed: '75 dB(A)', actual: '68 dB(A)', status: 'compliant' },
  { parameter: 'Noise Level (night boundary)', prescribed: '70 dB(A)', actual: '62 dB(A)', status: 'compliant' },
  { parameter: 'Wastewater Discharge', prescribed: 'Zero (ZLD)', actual: 'Zero', status: 'compliant' },
  { parameter: 'Groundwater Extraction', prescribed: '285 KLD (permitted)', actual: '180 KLD', status: 'compliant' },
  { parameter: 'Fugitive Emission (plant boundary)', prescribed: '150 ug/m3', actual: '92 ug/m3', status: 'compliant' },
]

const filingCalendar = [
  { report: 'CEMS Daily Data Upload', frequency: 'Daily (auto)', agency: 'CPCB OCEMS', nextDue: 'Continuous', status: 'active', lastFiled: 'Today' },
  { report: 'Monthly CEMS Summary Report', frequency: 'Monthly', agency: 'SPCB', nextDue: '05 Apr 2026', status: 'upcoming', lastFiled: '05 Mar 2026' },
  { report: 'Quarterly Ambient Air Quality Report', frequency: 'Quarterly', agency: 'SPCB', nextDue: '15 Apr 2026', status: 'upcoming', lastFiled: '15 Jan 2026' },
  { report: 'Half-Yearly EC Compliance Report', frequency: 'Half-Yearly', agency: 'MoEFCC', nextDue: '30 Sep 2026', status: 'on-track', lastFiled: '20 Feb 2026' },
  { report: 'Annual Hazardous Waste Return (Form 4)', frequency: 'Annual', agency: 'SPCB', nextDue: '30 Jun 2026', status: 'on-track', lastFiled: '15 Feb 2026' },
  { report: 'Annual Water Cess Return', frequency: 'Annual', agency: 'SPCB', nextDue: '30 Sep 2026', status: 'on-track', lastFiled: '28 Sep 2025' },
  { report: 'Annual Environmental Statement', frequency: 'Annual', agency: 'SPCB', nextDue: '30 Sep 2026', status: 'on-track', lastFiled: '25 Sep 2025' },
  { report: 'Mining Plan Compliance (IBM)', frequency: 'Annual', agency: 'IBM', nextDue: '31 Mar 2027', status: 'on-track', lastFiled: '28 Mar 2026' },
  { report: 'Consent to Operate (CTO) Renewal', frequency: 'Every 5 years', agency: 'SPCB', nextDue: '15 Dec 2028', status: 'on-track', lastFiled: '15 Dec 2023' },
  { report: 'EIA Study (if expansion)', frequency: 'Every 5 years', agency: 'MoEFCC', nextDue: 'Sep 2028', status: 'on-track', lastFiled: 'Sep 2023' },
]

const auditLog = [
  { date: '15 Mar 2026', type: 'Third-Party Stack Test', auditor: 'SGS India Pvt. Ltd.', scope: 'Isokinetic sampling at main stack — PM, SO2, NOx, HCl, HF, Hg, dioxins/furans', result: 'All parameters within CPCB limits', finding: 'None. NOx at 96% of limit — recommend fuel quality monitoring.', status: 'passed' },
  { date: '10 Mar 2026', type: 'AAQM Station Audit', auditor: 'SPCB Inspector', scope: 'Verification of 4 ambient air monitoring stations — calibration, data integrity, location compliance', result: 'All 4 stations operational and calibrated', finding: 'Station 3 (East) shelter roof needs repair. 15-day notice.', status: 'observation' },
  { date: '05 Mar 2026', type: 'CEMS Data Verification', auditor: 'CPCB OCEMS Team', scope: 'Cross-verification of online CEMS data against manual reference methods', result: 'Deviation < 5% for all parameters', finding: 'None. CEMS performing within ISO 14181 tolerance.', status: 'passed' },
  { date: '28 Feb 2026', type: 'ZLD System Inspection', auditor: 'SPCB Regional Officer', scope: 'Inspection of ETP, RO plant, MEE system, treated water quality, discharge points', result: 'Zero discharge confirmed', finding: 'Treated water TDS: 450 mg/L (within reuse spec). Brine salt: 1.2 MT/month disposed via authorized dealer.', status: 'passed' },
  { date: '20 Feb 2026', type: 'EC Compliance Review', auditor: 'MoEFCC Regional Office', scope: 'Half-yearly compliance review of all 24 EC conditions', result: 'All conditions compliant', finding: 'Green belt: 108% of target. Recommended as model plant for AFR co-processing.', status: 'passed' },
  { date: '15 Feb 2026', type: 'Hazardous Waste Audit', auditor: 'SPCB HW Cell', scope: 'Verification of HW storage, manifest records, transporter authorization, TSDF receipts', result: 'All categories properly managed', finding: 'Used oil storage area drainage needs improvement. 30-day compliance.', status: 'observation' },
  { date: '10 Jan 2026', type: 'Occupational Health Audit', auditor: 'DGFASLI + Company Doctor', scope: 'Annual medical exam for 284 dust-exposed workers — spirometry, X-ray, audiometry', result: '282 fit, 2 reassigned', finding: '2 workers with early-stage silicosis indicators reassigned to low-dust areas. Follow-up in 6 months.', status: 'action-taken' },
  { date: '15 Dec 2025', type: 'ISO 14001:2015 Surveillance', auditor: 'Bureau Veritas', scope: 'Environmental Management System surveillance audit (Year 2 of 3-year cycle)', result: 'Certificate maintained', finding: '1 minor NC: internal audit schedule delayed by 2 weeks. Corrected.', status: 'passed' },
]

const certificates = [
  { name: 'Environmental Clearance (EC)', issuer: 'MoEFCC', number: 'EC/MH/2021/00142', issued: '12 Jun 2021', validity: 'Project life (30 years)', status: 'active' },
  { name: 'Consent to Operate (CTO)', issuer: 'MPCB (Maharashtra)', number: 'CTO/NAG/2023/04521', issued: '15 Dec 2023', validity: '15 Dec 2028', status: 'active' },
  { name: 'ISO 14001:2015 (EMS)', issuer: 'Bureau Veritas', number: 'IND-EMS-2024-08821', issued: '20 Mar 2024', validity: '19 Mar 2027', status: 'active' },
  { name: 'ISO 45001:2018 (OH&S)', issuer: 'TUV SUD', number: 'IND-OHS-2024-11203', issued: '15 May 2024', validity: '14 May 2027', status: 'active' },
  { name: 'Mining Lease', issuer: 'State Geology & Mining', number: 'ML/NAG/2019/0087', issued: '10 Jan 2019', validity: '09 Jan 2049', status: 'active' },
  { name: 'Groundwater Extraction NOC', issuer: 'CGWA', number: 'CGWA/WR/2023/NAG/412', issued: '05 Aug 2023', validity: '04 Aug 2028', status: 'active' },
  { name: 'Hazardous Waste Authorization', issuer: 'MPCB', number: 'HW/NAG/2024/00312', issued: '01 Apr 2024', validity: '31 Mar 2029', status: 'active' },
  { name: 'Fire NOC', issuer: 'Fire Department', number: 'FIRE/NAG/2024/1102', issued: '20 Jun 2024', validity: '19 Jun 2026', status: 'active' },
]

const TABS = [
  { key: 'ec', label: 'EC Conditions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { key: 'cto', label: 'CTO Parameters', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  { key: 'calendar', label: 'Filing Calendar', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { key: 'audits', label: 'Audit Trail', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { key: 'certs', label: 'Licenses & Certificates', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
  { key: 'summary', label: 'Compliance Score', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
]

// ─── MAIN ───
function ComplianceReports() {
  const [activeTab, setActiveTab] = useState('ec')
  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Compliance Reports</h1>
            <p style={sty.pageSub}>Environmental Clearance conditions, CTO parameters, regulatory filings, audit trails & license management</p>
          </div>
        </div>
        <span style={sty.liveBadge}><span style={sty.liveDot} /> 100% Compliant</span>
      </div>

      <div style={sty.tabs}>
        {TABS.map(t => (
          <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'ec' && <ECTab />}
      {activeTab === 'cto' && <CTOTab />}
      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'audits' && <AuditTab />}
      {activeTab === 'certs' && <CertsTab />}
      {activeTab === 'summary' && <SummaryTab />}
    </div>
  )
}

// ─── EC CONDITIONS TAB ───
function ECTab() {
  return (
    <Section title="Environmental Clearance — Condition-wise Compliance" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}>
      <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: GREEN }}>EC Number: EC/MH/2021/00142 | Granted: 12 Jun 2021 | Total Conditions: {ecConditions.length}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: GREEN }}>{ecConditions.length}/{ecConditions.length} Compliant</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ecConditions.map((ec, i) => (
          <div key={i} style={{ ...sty.ecCard, borderLeft: `4px solid ${GREEN}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>{ec.id}</span>
                  <span style={{ ...sty.statusPill, background: `${GREEN}15`, color: GREEN }}>compliant</span>
                  <span style={{ ...sty.statusPill, background: '#f1f5f9', color: '#64748b' }}>{ec.category}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: '1.5' }}>{ec.condition}</div>
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: ACCENT, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compliance Evidence</div>
              <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '1.6' }}>{ec.evidence}</div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Due: <span style={{ color: '#1e293b', fontWeight: 600 }}>{ec.dueDate}</span></span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Last Verified: <span style={{ color: GREEN, fontWeight: 600 }}>{ec.lastVerified}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── CTO TAB ───
function CTOTab() {
  return (
    <Section title="Consent to Operate — Prescribed vs Actual Parameters" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}>
      <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
        <div style={{ fontSize: '12px', color: GREEN, fontWeight: 600 }}>CTO Number: CTO/NAG/2023/04521 | Validity: 15 Dec 2023 — 15 Dec 2028 | Issued by: MPCB (Maharashtra)</div>
      </div>

      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Parameter', 'Prescribed Limit', 'Actual Value', 'Usage of Limit', 'Status'].map(h => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ctoConditions.map((c, i) => {
              const prescribed = parseFloat(c.prescribed)
              const actual = parseFloat(c.actual)
              const pct = prescribed > 0 ? (actual / prescribed) * 100 : 0
              const barColor = pct > 90 ? RED : pct > 75 ? AMBER : GREEN
              return (
                <tr key={i} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: '#1e293b' }}>{c.parameter}</span></td>
                  <td style={sty.td}>{c.prescribed}</td>
                  <td style={sty.td}><span style={{ fontWeight: 700, color: barColor }}>{c.actual}</span></td>
                  <td style={sty.td}>
                    {pct > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ProgressBar value={pct} color={barColor} height={6} />
                        <span style={{ fontSize: '10px', fontWeight: 600, color: barColor, minWidth: '30px' }}>{pct.toFixed(0)}%</span>
                      </div>
                    ) : <span style={{ fontSize: '11px', color: GREEN, fontWeight: 600 }}>ZLD Achieved</span>}
                  </td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${GREEN}15`, color: GREEN }}>{c.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ─── CALENDAR TAB ───
function CalendarTab() {
  return (
    <Section title="Regulatory Filing Calendar" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}>
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Report / Return', 'Frequency', 'Agency', 'Next Due', 'Last Filed', 'Status'].map(h => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filingCalendar.map((f, i) => {
              const statusColors = { active: GREEN, upcoming: AMBER, 'on-track': BLUE }
              return (
                <tr key={i} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: '#1e293b' }}>{f.report}</span></td>
                  <td style={sty.td}>{f.frequency}</td>
                  <td style={sty.td}><span style={{ color: ACCENT, fontWeight: 600 }}>{f.agency}</span></td>
                  <td style={sty.td}><span style={{ fontWeight: 600 }}>{f.nextDue}</span></td>
                  <td style={sty.td}><span style={{ fontSize: '11px', color: '#64748b' }}>{f.lastFiled}</span></td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${statusColors[f.status]}15`, color: statusColors[f.status] }}>{f.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ─── AUDIT TAB ───
function AuditTab() {
  return (
    <Section title="Audit Trail & Inspection Log" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {auditLog.map((a, i) => {
          const statusColors = { passed: GREEN, observation: AMBER, 'action-taken': BLUE }
          const sc = statusColors[a.status] || GREEN
          return (
            <div key={i} style={{ ...sty.auditCard, borderLeft: `3px solid ${sc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{a.type}</span>
                    <span style={{ ...sty.statusPill, background: `${sc}15`, color: sc }}>{a.status}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.date} | Auditor: <span style={{ color: ACCENT, fontWeight: 600 }}>{a.auditor}</span></div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: sc }}>{a.result}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#94a3b8' }}>Scope: </span>{a.scope}
              </div>
              <div style={{ background: a.finding.includes('None') ? '#f0fdf4' : '#fffbeb', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${a.finding.includes('None') ? '#bbf7d0' : '#fef08a'}` }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: a.finding.includes('None') ? GREEN : AMBER }}>FINDINGS: </span>
                <span style={{ fontSize: '11px', color: '#1e293b' }}>{a.finding}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── CERTS TAB ───
function CertsTab() {
  return (
    <Section title="Licenses, Permits & Certificates" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {certificates.map((c, i) => (
          <div key={i} style={{ ...sty.certCard, borderLeft: `3px solid ${GREEN}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{c.name}</span>
              <span style={{ ...sty.statusPill, background: `${GREEN}15`, color: GREEN }}>active</span>
            </div>
            {[
              { label: 'Issuing Authority', value: c.issuer },
              { label: 'Certificate No.', value: c.number },
              { label: 'Date of Issue', value: c.issued },
              { label: 'Valid Until', value: c.validity },
            ].map((r, j) => (
              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                <span style={{ color: '#94a3b8' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── SUMMARY TAB ───
function SummaryTab() {
  return (
    <>
      <Section title="Compliance Scorecard" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {reportCategories.map((r, i) => {
            const pct = (r.compliant / r.total) * 100
            return (
              <div key={i} style={sty.scoreCard}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>{r.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: r.color }}>{r.compliant}/{r.total}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: r.color }}>{pct.toFixed(0)}%</span>
                </div>
                <ProgressBar value={pct} color={r.color} />
              </div>
            )
          })}
        </div>

        {/* Overall Score */}
        <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Overall Compliance Score</div>
          <div style={{ fontSize: '48px', fontWeight: 800, color: GREEN }}>98.1%</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>414 of 415 conditions/parameters compliant | 3 CEMS data gaps in FY26 (resolved within 24 hrs)</div>
        </div>
      </Section>

      <Section title="Regulatory Bodies & Contact" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { name: 'CPCB (Central Pollution Control Board)', role: 'CEMS oversight, emission standards, HW rules', region: 'National', color: RED },
            { name: 'MPCB (Maharashtra PCB)', role: 'CTO issuer, local inspections, ambient monitoring', region: 'State — Maharashtra', color: AMBER },
            { name: 'MoEFCC', role: 'Environmental Clearance, EIA approval, EC compliance', region: 'National', color: GREEN },
            { name: 'IBM (Indian Bureau of Mines)', role: 'Mining plan approval, quarry compliance', region: 'National', color: BLUE },
            { name: 'CGWA (Central Ground Water Auth.)', role: 'Groundwater extraction NOC', region: 'National', color: CYAN },
            { name: 'Bureau Veritas / TUV SUD', role: 'ISO 14001, ISO 45001 certification audits', region: 'International', color: ACCENT },
          ].map((b, i) => (
            <div key={i} style={{ ...sty.miniCard, borderLeft: `3px solid ${b.color}` }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{b.name}</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5', marginBottom: '4px' }}>{b.role}</div>
              <div style={{ fontSize: '9px', color: b.color, fontWeight: 600 }}>{b.region}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── STYLES ───
const sty = {
  page: { animation: 'fadeUp 0.6s ease' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  section: { background: '#fff', borderRadius: '12px', border: '1px solid #e8ecf1', padding: '20px', marginBottom: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionIcon: { width: '34px', height: '34px', borderRadius: '8px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' },
  ecCard: { background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  auditCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  certCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  scoreCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  miniCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' },
}

export default ComplianceReports
