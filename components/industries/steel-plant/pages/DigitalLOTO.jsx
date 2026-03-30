'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'
const PURPLE = '#8b5cf6'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (<div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} /></div>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// DIGITAL LOTO DATA — JINDAL STEEL PLANT
// ════════════════════════════════════════════════

const kpiCards = [
  { label: 'Active LOTO Permits', value: '12', color: ACCENT },
  { label: 'Pending Approval', value: '3', color: AMBER },
  { label: 'Completed Today', value: '8', color: GREEN },
  { label: 'Overdue', value: '1', color: RED },
]

const activePermits = [
  { id: 'LOTO-SP-2026-001', equipment: 'BF-1 Gas Cleaning System', location: 'Blast Furnace Area', initiatedBy: 'R. Sharma', approver: 'V. Patel (Shift Supv.)', isolationPoints: 8, status: 'Active', startTime: '06:15', duration: '4 hrs', sapWO: '4000128501' },
  { id: 'LOTO-SP-2026-002', equipment: 'SMS Ladle Turret', location: 'SMS', initiatedBy: 'A. Kumar', approver: 'S. Mishra (Safety Off.)', isolationPoints: 5, status: 'Active', startTime: '07:00', duration: '3 hrs', sapWO: '4000128502' },
  { id: 'LOTO-SP-2026-003', equipment: 'Hot Strip Mill Stand #3', location: 'Rolling Mill', initiatedBy: 'P. Singh', approver: 'D. Verma (Area Mgr.)', isolationPoints: 12, status: 'Active', startTime: '05:30', duration: '6 hrs', sapWO: '4000128503' },
  { id: 'LOTO-SP-2026-004', equipment: 'Coke Oven Battery #2', location: 'Coke Oven', initiatedBy: 'M. Yadav', approver: 'K. Reddy (Shift Supv.)', isolationPoints: 6, status: 'Pending', startTime: '--', duration: '2 hrs', sapWO: '4000128504' },
  { id: 'LOTO-SP-2026-005', equipment: 'BOF Converter #1', location: 'SMS', initiatedBy: 'S. Gupta', approver: 'V. Patel (Shift Supv.)', isolationPoints: 10, status: 'Active', startTime: '08:00', duration: '5 hrs', sapWO: '4000128505' },
  { id: 'LOTO-SP-2026-006', equipment: 'Continuous Caster Mold', location: 'SMS', initiatedBy: 'T. Joshi', approver: 'S. Mishra (Safety Off.)', isolationPoints: 7, status: 'Approved', startTime: '09:30', duration: '3 hrs', sapWO: '4000128506' },
  { id: 'LOTO-SP-2026-007', equipment: 'Sinter Plant Fan', location: 'Blast Furnace Area', initiatedBy: 'B. Pandey', approver: 'D. Verma (Area Mgr.)', isolationPoints: 4, status: 'Pending', startTime: '--', duration: '2 hrs', sapWO: '4000128507' },
  { id: 'LOTO-SP-2026-008', equipment: 'Power Plant Turbine', location: 'Coke Oven', initiatedBy: 'H. Desai', approver: 'K. Reddy (Shift Supv.)', isolationPoints: 14, status: 'Pending', startTime: '--', duration: '8 hrs', sapWO: '4000128508' },
]

const statusColors = { Active: GREEN, Pending: AMBER, Approved: BLUE, Released: '#94a3b8' }

const workflowSteps = [
  { step: 1, title: 'Request Initiation', desc: 'SAP PM notification triggers LOTO request. Maintenance planner creates work order (IW31) and links to equipment functional location. Automatic hazard classification based on equipment type.', count: 3, sapSync: 'Synced', icon: 'req' },
  { step: 2, title: 'Risk Assessment', desc: 'AI-powered hazard identification analyzes equipment history, previous incidents, energy sources, and environmental factors. Risk matrix auto-generated with severity and likelihood scoring per IS 14489.', count: 2, sapSync: 'Synced', icon: 'RSK' },
  { step: 3, title: 'Isolation Planning', desc: 'Auto-identify all energy sources: Electrical (HT/LT), Mechanical (rotating/reciprocating), Hydraulic (high-pressure lines), Pneumatic (instrument air/plant air), Thermal (steam/molten metal), Chemical (gas lines/acid). Generate isolation sequence with P&ID reference.', count: 1, sapSync: 'Synced', icon: 'ISO' },
  { step: 4, title: 'Multi-Level Approval', desc: 'Sequential approval chain: Shift Supervisor validates work scope → Safety Officer reviews risk assessment and PPE requirements → Area Manager authorizes based on production impact. Digital signatures with timestamp and geo-location.', count: 3, sapSync: 'Synced', icon: 'APR' },
  { step: 5, title: 'Physical Isolation & Verification', desc: 'Field technician applies locks and tags at each isolation point. Zero Energy Verification (ZEV) performed — try-start confirmation on all electrical circuits, pressure bleed-down verification on hydraulic/pneumatic, temperature decay check on thermal sources.', count: 2, sapSync: 'Synced', icon: 'LCK' },
  { step: 6, title: 'Release & Restoration', desc: 'Sequential de-isolation following reverse order. Each lock removal requires biometric authentication. Energy restoration checklist with pre-start safety check. SAP PM status updated to TECO (Technically Complete). Post-job safety debrief logged.', count: 1, sapSync: 'Synced', icon: 'REL' },
]

const energyTypeColors = { Electrical: '#eab308', Mechanical: BLUE, Hydraulic: GREEN, Pneumatic: CYAN, Thermal: RED, Chemical: PURPLE }

const isolationPoints = [
  { id: 'IP-001', energyType: 'Electrical', location: 'MCC Panel 4A — Breaker 12', device: 'Circuit Breaker (CB-BF1-012)', lockedBy: 'R. Sharma', verification: 'Verified', tag: 'TAG-SP-2026-001-A' },
  { id: 'IP-002', energyType: 'Electrical', location: 'MCC Panel 4A — Breaker 14', device: 'Circuit Breaker (CB-BF1-014)', lockedBy: 'R. Sharma', verification: 'Verified', tag: 'TAG-SP-2026-001-B' },
  { id: 'IP-003', energyType: 'Mechanical', location: 'Gas Cleaning Fan Drive Shaft', device: 'Shaft Lock Pin (SLP-042)', lockedBy: 'A. Kumar', verification: 'Verified', tag: 'TAG-SP-2026-001-C' },
  { id: 'IP-004', energyType: 'Hydraulic', location: 'Hydraulic Power Unit — Supply Line', device: 'Ball Valve (HV-BF1-108)', lockedBy: 'R. Sharma', verification: 'Verified', tag: 'TAG-SP-2026-001-D' },
  { id: 'IP-005', energyType: 'Hydraulic', location: 'Hydraulic Accumulator — Drain', device: 'Bleed Valve (HV-BF1-109)', lockedBy: 'A. Kumar', verification: 'Verified', tag: 'TAG-SP-2026-001-E' },
  { id: 'IP-006', energyType: 'Pneumatic', location: 'Instrument Air Header — Isolation', device: 'Gate Valve (PV-BF1-055)', lockedBy: 'P. Singh', verification: 'Pending', tag: 'TAG-SP-2026-001-F' },
  { id: 'IP-007', energyType: 'Thermal', location: 'BF Gas Line — Upstream Isolation', device: 'Blind Flange (BF-BF1-GAS-01)', lockedBy: 'M. Yadav', verification: 'Verified', tag: 'TAG-SP-2026-001-G' },
  { id: 'IP-008', energyType: 'Thermal', location: 'Steam Header — Branch Isolation', device: 'Globe Valve (TV-BF1-STM-04)', lockedBy: 'M. Yadav', verification: 'Verified', tag: 'TAG-SP-2026-001-H' },
  { id: 'IP-009', energyType: 'Chemical', location: 'Nitrogen Purge Line', device: 'Ball Valve (CV-BF1-N2-02)', lockedBy: 'S. Gupta', verification: 'Pending', tag: 'TAG-SP-2026-001-I' },
  { id: 'IP-010', energyType: 'Electrical', location: 'Emergency Stop Circuit — Local Panel', device: 'Disconnect Switch (DS-BF1-ES-01)', lockedBy: 'R. Sharma', verification: 'Verified', tag: 'TAG-SP-2026-001-J' },
]

const zevChecklist = [
  { item: 'All circuit breakers confirmed OPEN and locked', checked: true },
  { item: 'Try-start test performed — no rotation observed', checked: true },
  { item: 'Hydraulic pressure bled to 0 bar — gauge confirmed', checked: true },
  { item: 'Pneumatic lines depressurized — 0 psi confirmed', checked: true },
  { item: 'BF gas line blind flange installed and leak-tested', checked: true },
  { item: 'Steam line temperature below 50°C — IR verified', checked: true },
  { item: 'Nitrogen purge line isolated — O2 level normal', checked: false },
  { item: 'All lockout devices inspected for integrity', checked: true },
  { item: 'Danger tags placed at all isolation points', checked: true },
  { item: 'Affected personnel notified and signed off', checked: false },
]

const sapSyncCards = [
  { label: 'SAP PM Status', value: 'Connected', color: GREEN, icon: '●' },
  { label: 'Last Sync', value: '2 min ago', color: GREEN, icon: '↻' },
  { label: 'Pending Syncs', value: '0', color: GREEN, icon: '↑' },
  { label: 'Failed Syncs', value: '0', color: GREEN, icon: '✗' },
]

const sapLocations = [
  { id: 'FL-SP-001', name: 'Steel Plant — Main Complex', level: 0, children: 4 },
  { id: 'FL-SP-BF', name: 'BF Area — Blast Furnace Complex', level: 1, children: 3 },
  { id: 'FL-SP-BF1', name: 'BF-1 — Blast Furnace #1', level: 2, children: 6 },
  { id: 'FL-SP-BF1-GC', name: 'BF-1 Gas Cleaning System', level: 3, children: 0 },
  { id: 'FL-SP-BF1-CS', name: 'BF-1 Cooling System', level: 3, children: 0 },
  { id: 'FL-SP-BF1-CH', name: 'BF-1 Charging System', level: 3, children: 0 },
  { id: 'FL-SP-SMS', name: 'SMS — Steel Melting Shop', level: 1, children: 5 },
  { id: 'FL-SP-SMS-BOF', name: 'BOF Converter Area', level: 2, children: 3 },
  { id: 'FL-SP-SMS-CCM', name: 'Continuous Casting Machine', level: 2, children: 4 },
  { id: 'FL-SP-RM', name: 'Rolling Mill Complex', level: 1, children: 4 },
  { id: 'FL-SP-COB', name: 'Coke Oven Battery Complex', level: 1, children: 3 },
  { id: 'FL-SP-PP', name: 'Power Plant', level: 1, children: 2 },
]

const sapWorkOrders = [
  { wo: '4000128501', desc: 'PM — Gas Cleaning Fan Motor Overhaul', equipment: 'BF-1 Gas Cleaning System', lotoPermit: 'LOTO-SP-2026-001', status: 'REL (Released)' },
  { wo: '4000128502', desc: 'CM — Ladle Turret Bearing Replacement', equipment: 'SMS Ladle Turret', lotoPermit: 'LOTO-SP-2026-002', status: 'REL (Released)' },
  { wo: '4000128503', desc: 'PM — HSM Stand #3 Roll Change & Alignment', equipment: 'Hot Strip Mill Stand #3', lotoPermit: 'LOTO-SP-2026-003', status: 'REL (Released)' },
  { wo: '4000128505', desc: 'CM — BOF Converter Vessel Refractory Inspection', equipment: 'BOF Converter #1', lotoPermit: 'LOTO-SP-2026-005', status: 'REL (Released)' },
  { wo: '4000128506', desc: 'PM — Mold Oscillation Mechanism Servicing', equipment: 'Continuous Caster Mold', lotoPermit: 'LOTO-SP-2026-006', status: 'CRTD (Created)' },
  { wo: '4000128508', desc: 'PM — Power Plant Turbine Annual Overhaul', equipment: 'Power Plant Turbine', lotoPermit: 'LOTO-SP-2026-008', status: 'CRTD (Created)' },
]

const sapTransactions = [
  { tcode: 'IW31', desc: 'Create Maintenance Order', usage: 'LOTO permit triggers WO creation' },
  { tcode: 'IW32', desc: 'Change Maintenance Order', usage: 'Link LOTO permit ID to WO' },
  { tcode: 'IK11', desc: 'Create Measuring Point', usage: 'Record ZEV readings' },
  { tcode: 'IA09', desc: 'Equipment List Display', usage: 'Fetch equipment hierarchy for isolation planning' },
  { tcode: 'IH01', desc: 'Display Functional Location', usage: 'Map LOTO to plant hierarchy' },
  { tcode: 'QM01', desc: 'Create Quality Notification', usage: 'Log safety observations during LOTO' },
]

const syncLog = [
  { time: '09:42:18', direction: 'Outbound', dataType: 'LOTO Permit Status Update', status: 'Success', details: 'LOTO-SP-2026-001 status → Active' },
  { time: '09:40:05', direction: 'Inbound', dataType: 'Work Order Release', status: 'Success', details: 'WO 4000128506 released in SAP' },
  { time: '09:38:22', direction: 'Outbound', dataType: 'ZEV Reading Upload', status: 'Success', details: '8 measuring points synced for LOTO-001' },
  { time: '09:35:10', direction: 'Inbound', dataType: 'Equipment Master Data', status: 'Success', details: 'BF-1 sub-equipment list refreshed' },
  { time: '09:30:45', direction: 'Outbound', dataType: 'Approval Notification', status: 'Success', details: 'Multi-level approval completed for LOTO-006' },
  { time: '09:28:12', direction: 'Inbound', dataType: 'Functional Location Sync', status: 'Success', details: '12 locations synced from SAP PM' },
  { time: '09:22:38', direction: 'Outbound', dataType: 'LOTO Permit Creation', status: 'Success', details: 'LOTO-SP-2026-008 created and linked to WO' },
  { time: '09:18:55', direction: 'Inbound', dataType: 'Permit-to-Work Reference', status: 'Success', details: 'PTW cross-reference updated for SMS area' },
  { time: '09:15:02', direction: 'Outbound', dataType: 'Safety Observation', status: 'Success', details: 'QM notification created for near-miss' },
  { time: '09:10:30', direction: 'Inbound', dataType: 'Maintenance Schedule', status: 'Success', details: 'Next 7-day PM schedule fetched from SAP' },
]

const safetyKPIs = [
  { label: 'Total LOTO Executed (MTD)', value: '342', color: ACCENT },
  { label: 'Near Misses', value: '0', color: GREEN },
  { label: 'Violations', value: '1', color: RED },
  { label: 'Compliance Rate', value: '99.7%', color: GREEN },
]

const monthlyTrend = [
  { month: 'Apr', count: 298 },
  { month: 'May', count: 312 },
  { month: 'Jun', count: 305 },
  { month: 'Jul', count: 328 },
  { month: 'Aug', count: 318 },
  { month: 'Sep', count: 335 },
  { month: 'Oct', count: 340 },
  { month: 'Nov', count: 322 },
  { month: 'Dec', count: 348 },
  { month: 'Jan', count: 356 },
  { month: 'Feb', count: 338 },
  { month: 'Mar', count: 342 },
]

const topEquipment = [
  { name: 'Hot Strip Mill Stand #3', count: 48, color: RED },
  { name: 'BOF Converter #1', count: 42, color: AMBER },
  { name: 'BF-1 Gas Cleaning System', count: 38, color: ACCENT },
  { name: 'Continuous Caster Mold', count: 35, color: BLUE },
  { name: 'Power Plant Turbine', count: 32, color: GREEN },
]

const avgIsolationTime = [
  { area: 'Blast Furnace Area', time: 42, unit: 'min', max: 60 },
  { area: 'SMS', time: 35, unit: 'min', max: 60 },
  { area: 'Rolling Mill', time: 55, unit: 'min', max: 60 },
  { area: 'Coke Oven', time: 28, unit: 'min', max: 60 },
  { area: 'Power Plant', time: 48, unit: 'min', max: 60 },
]

const aiRecommendations = [
  { priority: 'high', title: 'Standardize Isolation Sequence for HSM Stand #3', reason: 'Analysis of 48 LOTO permits shows 3 different isolation sequences used by different shifts. Standardizing to the optimal 12-step sequence will reduce average isolation time from 55 min to 38 min and eliminate 2 identified risk gaps.', impact: 'Time saving: 17 min/permit', confidence: 96 },
  { priority: 'high', title: 'Add Pneumatic Isolation Point for BOF Gas Recovery', reason: 'AI hazard analysis detected that pneumatic instrument air to BOF gas recovery damper is not included in current isolation plan. This represents an uncontrolled energy source during converter vessel maintenance.', impact: 'Risk reduction: Critical', confidence: 98 },
  { priority: 'medium', title: 'Implement Group LOTO for Coke Oven Battery Maintenance', reason: 'Multiple individual LOTO permits are raised for adjacent coke oven chambers. Implementing group LOTO procedure per OSHA 29 CFR 1910.147(f)(3) will improve efficiency while maintaining safety.', impact: 'Efficiency gain: 40%', confidence: 91 },
  { priority: 'medium', title: 'Pre-position Lock Boxes at BF-1 Area', reason: 'Field data shows technicians spend average 12 minutes retrieving lockout devices from central store for BF area jobs. Installing dedicated lock boxes at 3 BF-1 sub-stations will eliminate transit time.', impact: 'Time saving: 12 min/job', confidence: 94 },
  { priority: 'low', title: 'Schedule ZEV Training Refresher for B-Shift', reason: 'B-Shift shows 8% longer average ZEV completion time compared to A-Shift and C-Shift. Targeted refresher training on zero energy verification procedures recommended.', impact: 'Compliance improvement', confidence: 87 },
]

const complianceChecklist = [
  { standard: 'OSHA 29 CFR 1910.147', desc: 'Control of Hazardous Energy (Lockout/Tagout)', status: 'Compliant', lastReview: '15-Feb-2026', nextReview: '15-Aug-2026' },
  { standard: 'IS 3043:2018', desc: 'Code of Practice for Earthing (Electrical Isolation)', status: 'Compliant', lastReview: '10-Jan-2026', nextReview: '10-Jul-2026' },
  { standard: 'IS 14489:2018', desc: 'Code of Practice for OHAS in Iron & Steel Industry', status: 'Compliant', lastReview: '20-Jan-2026', nextReview: '20-Jul-2026' },
  { standard: 'BIS IS 15656', desc: 'Hazard Identification & Risk Assessment', status: 'Compliant', lastReview: '05-Mar-2026', nextReview: '05-Sep-2026' },
  { standard: 'NFPA 70E', desc: 'Standard for Electrical Safety in the Workplace', status: 'Compliant', lastReview: '01-Feb-2026', nextReview: '01-Aug-2026' },
  { standard: 'SP-SOP-LOTO-001', desc: 'Plant LOTO Standard Operating Procedure', status: 'Compliant', lastReview: '01-Mar-2026', nextReview: '01-Jun-2026' },
]

const auditTrail = [
  { date: '10-Mar-2026', auditor: 'M. Chatterjee (Internal)', area: 'SMS — BOF Area', findings: 'No findings — all LOTO procedures compliant', status: 'Closed' },
  { date: '25-Feb-2026', auditor: 'S. Iyer (DGFASLI)', area: 'BF Area — Gas Cleaning', findings: 'Minor: Tag numbering format inconsistency on 2 permits', status: 'Closed' },
  { date: '15-Feb-2026', auditor: 'R. Nair (Internal)', area: 'Rolling Mill — HSM', findings: 'No findings — lock inventory adequate', status: 'Closed' },
  { date: '02-Feb-2026', auditor: 'P. Mehta (ISO Auditor)', area: 'All Areas', findings: 'Observation: Recommend digital tag scanning at each IP', status: 'In Progress' },
  { date: '18-Jan-2026', auditor: 'V. Saxena (Internal)', area: 'Coke Oven Battery', findings: 'No findings — ZEV records complete', status: 'Closed' },
  { date: '05-Jan-2026', auditor: 'A. Kapoor (Corporate HSE)', area: 'Power Plant', findings: 'Minor: 2 staff certifications expiring within 30 days', status: 'Closed' },
  { date: '20-Dec-2025', auditor: 'D. Bhatt (Internal)', area: 'SMS — CCM', findings: 'No findings — SAP integration verified', status: 'Closed' },
  { date: '08-Dec-2025', auditor: 'K. Joshi (DISH)', area: 'BF Area', findings: 'No findings — emergency LOTO drills satisfactory', status: 'Closed' },
  { date: '25-Nov-2025', auditor: 'S. Pillai (Internal)', area: 'All Areas', findings: 'Observation: Suggest adding QR code to physical tags', status: 'Implemented' },
  { date: '10-Nov-2025', auditor: 'R. Deshmukh (NSCI)', area: 'Rolling Mill', findings: 'No findings — training records verified for all staff', status: 'Closed' },
]

const documents = [
  { name: 'SP-SOP-LOTO-001', type: 'SOP', desc: 'Master LOTO Standard Operating Procedure', version: 'v4.2', lastUpdated: '01-Mar-2026' },
  { name: 'SP-RA-LOTO-BF1', type: 'Risk Assessment', desc: 'HIRA for BF-1 Gas Cleaning System LOTO', version: 'v2.1', lastUpdated: '15-Feb-2026' },
  { name: 'SP-RA-LOTO-SMS', type: 'Risk Assessment', desc: 'HIRA for SMS Area LOTO Procedures', version: 'v3.0', lastUpdated: '20-Feb-2026' },
  { name: 'SP-TRN-LOTO-2026', type: 'Training Record', desc: 'Annual LOTO Competency Assessment Results', version: 'v1.0', lastUpdated: '10-Jan-2026' },
  { name: 'SP-EP-LOTO-001', type: 'Emergency Plan', desc: 'Emergency LOTO Removal Procedure', version: 'v2.0', lastUpdated: '05-Dec-2025' },
  { name: 'SP-CHK-ZEV-001', type: 'Checklist', desc: 'Zero Energy Verification Standard Checklist', version: 'v3.1', lastUpdated: '28-Feb-2026' },
]

const expiringCerts = [
  { name: 'B. Pandey', certification: 'Authorized LOTO Practitioner', expiry: '28-Mar-2026', daysLeft: 8 },
  { name: 'H. Desai', certification: 'Electrical Isolation Specialist', expiry: '05-Apr-2026', daysLeft: 16 },
  { name: 'N. Tiwari', certification: 'Confined Space + LOTO Combined', expiry: '12-Apr-2026', daysLeft: 23 },
]

// ════════════════════════════════════════
// LIVE ACTIVITY STRIP — scrolling real-time events
// ════════════════════════════════════════

const liveEvents = [
  { time: '10:42', type: 'lock', msg: 'Lock applied on CB-BF1-012 by R. Sharma', color: RED },
  { time: '10:38', type: 'approve', msg: 'LOTO-SP-2026-006 approved by Safety Officer', color: GREEN },
  { time: '10:35', type: 'verify', msg: 'Zero Energy Verification passed — BF-1 Gas Cleaning', color: GREEN },
  { time: '10:31', type: 'request', msg: 'New LOTO request initiated for Sinter Plant Fan', color: AMBER },
  { time: '10:28', type: 'sap', msg: 'SAP WO 4000128509 auto-created from LOTO-SP-2026-009', color: BLUE },
  { time: '10:24', type: 'release', msg: 'LOTO-SP-2026-005 released — BOF Converter #1 back online', color: CYAN },
  { time: '10:20', type: 'alert', msg: 'Overdue alert: LOTO-SP-2026-003 exceeded estimated duration', color: RED },
  { time: '10:15', type: 'lock', msg: 'Lock applied on HV-BF1-108 by A. Kumar', color: RED },
]

function LiveTimer({ startTime }) {
  const [elapsed, setElapsed] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted || startTime === '--') return
    const [h, m] = startTime.split(':').map(Number)
    const update = () => {
      const now = new Date()
      const start = new Date(); start.setHours(h, m, 0, 0)
      const diff = Math.max(0, Math.floor((now - start) / 1000))
      const hrs = Math.floor(diff / 3600)
      const mins = Math.floor((diff % 3600) / 60)
      const secs = diff % 60
      setElapsed(`${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [mounted, startTime])
  if (startTime === '--') return <span style={{ color: '#94a3b8' }}>Pending</span>
  return <span style={{ fontFamily: 'monospace', fontSize: '11px', color: ACCENT, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{mounted ? elapsed : '--'}</span>
}

function LiveActivityStrip() {
  const [idx, setIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    const t = setInterval(() => setIdx(i => (i + 1) % liveEvents.length), 4000)
    return () => clearInterval(t)
  }, [mounted])

  const evt = liveEvents[idx]
  const icons = {
    lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    approve: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    verify: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    request: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    sap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    release: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
    alert: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GREEN, animation: 'pulse 1.5s infinite' }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live</span>
      </div>
      <div style={{ width: '1px', height: '20px', background: '#e8ecf1', flexShrink: 0 }} />
      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, animation: 'slideIn 0.5s ease' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${evt.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icons[evt.type]}
        </div>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', flexShrink: 0 }}>{mounted ? evt.time : '--:--'}</span>
        <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>{evt.msg}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, background: `${ACCENT}10`, padding: '4px 10px', borderRadius: '6px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style={{ fontSize: '10px', fontWeight: 600, color: ACCENT }}>Auto-updating</span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export default function DigitalLOTO() {
  const [tab, setTab] = useState('permits')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }

  const tabs = [
    { key: 'permits', label: 'Active Permits' },
    { key: 'workflow', label: 'LOTO Workflow' },
    { key: 'isolation', label: 'Isolation Points' },
    { key: 'sap', label: 'SAP Integration' },
    { key: 'analytics', label: 'Safety Analytics' },
    { key: 'compliance', label: 'Compliance' },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scrollReveal { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .scroll-hidden { opacity:0; transform:translateY(40px); }
        .scroll-visible { animation:scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:ACCENT+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h1 style={st.title}>Digital LOTO Management</h1>
            <p style={st.sub}>AI-Powered Lockout/Tagout with SAP Integration</p>
          </div>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation:'pulse 2s infinite' }} /> Live</span>
          <span style={st.aiBadge}>SAP PM: Synced</span>
          <span style={st.timeBadge}>SAP PM Integrated</span>
        </div>
      </div>

      {/* Live Activity Strip */}
      <LiveActivityStrip />

      {/* Tab Filter */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'24px', flexWrap:'wrap' }}>
        {tabs.map((t) => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ TAB 1: ACTIVE PERMITS ═══ */}
      {tab === 'permits' && (
        <>
          {/* KPI Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'24px' }}>
            {kpiCards.map((k, i) => (
              <div key={i} style={{ ...st.card, textAlign:'center', borderTop:`3px solid ${k.color}`, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.3px' }}>{k.label}</div>
                <div style={{ fontSize:'26px', fontWeight:800, color:k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          <Section title="Active LOTO Permits" badge={`${activePermits.length} Permits`} icon="LO">
            <div style={{ ...st.card, overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e8ecf1' }}>
                    {['Permit ID', 'Equipment', 'Location', 'Initiated By', 'Approver', 'Isolation Pts', 'Status', 'Elapsed', 'Duration', 'SAP Work Order'].map(h => (
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'11px', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activePermits.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom:'1px solid #f1f5f9', animation:`slideIn 0.7s ease ${i*0.06}s both` }}>
                      <td style={{ padding:'10px 8px', fontWeight:700, color:ACCENT, whiteSpace:'nowrap' }}>{p.id}</td>
                      <td style={{ padding:'10px 8px', fontWeight:600, color:'#1e293b' }}>{p.equipment}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b' }}>{p.location}</td>
                      <td style={{ padding:'10px 8px', color:'#1e293b' }}>{p.initiatedBy}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b', fontSize:'11px' }}>{p.approver}</td>
                      <td style={{ padding:'10px 8px', textAlign:'center' }}>
                        <span style={{ background:ACCENT+'15', color:ACCENT, fontWeight:700, padding:'2px 8px', borderRadius:'10px', fontSize:'11px' }}>{p.isolationPoints}</span>
                      </td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ background:statusColors[p.status]+'18', color:statusColors[p.status], fontWeight:700, padding:'3px 10px', borderRadius:'12px', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.3px' }}>{p.status}</span>
                      </td>
                      <td style={{ padding:'10px 8px' }}><LiveTimer startTime={p.startTime} /></td>
                      <td style={{ padding:'10px 8px', color:'#64748b' }}>{p.duration}</td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ color:BLUE, fontWeight:600, fontSize:'11px', cursor:'pointer', textDecoration:'underline' }}>{p.sapWO}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {/* ═══ TAB 2: LOTO WORKFLOW ═══ */}
      {tab === 'workflow' && (
        <Section title="LOTO Workflow — 6-Step Process" badge="ISO 45001 Aligned" icon="WF">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'14px' }}>
            {workflowSteps.map((s, i) => (
              <div key={s.step} style={{ ...st.card, position:'relative', borderTop:`3px solid ${ACCENT}`, animation:`slideIn 0.7s ease ${i*0.1}s both` }}>
                <div style={{ position:'absolute', top:'12px', right:'14px', width:'28px', height:'28px', borderRadius:'50%', background:ACCENT, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800 }}>{s.step}</div>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:ACCENT+'12', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' }}>
                  {s.step === 1 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                  {s.step === 2 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                  {s.step === 3 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
                  {s.step === 4 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                  {s.step === 5 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  {s.step === 6 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>}
                </div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'#1e293b', marginBottom:'8px' }}>{s.title}</div>
                <p style={{ fontSize:'11px', color:'#64748b', lineHeight:1.7, margin:'0 0 14px' }}>{s.desc}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'10px', borderTop:'1px solid #f1f5f9' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ background:ACCENT+'15', color:ACCENT, fontWeight:700, padding:'2px 8px', borderRadius:'10px', fontSize:'11px' }}>{s.count} permits</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:GREEN }} />
                    <span style={{ fontSize:'10px', color:GREEN, fontWeight:600 }}>{s.sapSync}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow flow diagram */}
          <div style={{ ...st.card, marginTop:'14px', textAlign:'center', padding:'20px' }}>
            <div style={{ fontSize:'12px', color:'#94a3b8', fontWeight:500, marginBottom:'14px' }}>Process Flow</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', flexWrap:'wrap' }}>
              {workflowSteps.map((s, i) => (
                <div key={s.step} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ background:ACCENT+'12', border:`1px solid ${ACCENT}30`, borderRadius:'8px', padding:'8px 14px', fontSize:'11px', fontWeight:600, color:ACCENT }}>
                    Step {s.step}: {s.title.split(' ').slice(0, 2).join(' ')}
                  </div>
                  {i < workflowSteps.length - 1 && <span style={{ color:'#cbd5e1', fontSize:'16px' }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ═══ TAB 3: ISOLATION POINTS ═══ */}
      {tab === 'isolation' && (
        <>
          <Section title="Isolation Points — BF-1 Gas Cleaning System" badge="LOTO-SP-2026-001" icon="IP">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px' }}>
              {isolationPoints.map((ip, i) => {
                const eColor = energyTypeColors[ip.energyType]
                return (
                  <div key={ip.id} style={{ ...st.card, borderLeft:`4px solid ${eColor}`, animation:`slideIn 0.7s ease ${i*0.06}s both` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontWeight:800, color:'#1e293b', fontSize:'13px' }}>{ip.id}</span>
                        <span style={{ background:eColor+'18', color:eColor, fontWeight:700, padding:'2px 8px', borderRadius:'10px', fontSize:'10px' }}>{ip.energyType}</span>
                      </div>
                      <span style={{ background:ip.verification === 'Verified' ? GREEN+'18' : AMBER+'18', color:ip.verification === 'Verified' ? GREEN : AMBER, fontWeight:700, padding:'3px 10px', borderRadius:'12px', fontSize:'10px' }}>
                        {ip.verification === 'Verified' ? '✓ ' : '◷ '}{ip.verification}
                      </span>
                    </div>
                    <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'4px' }}><strong style={{ color:'#1e293b' }}>Location:</strong> {ip.location}</div>
                    <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'4px' }}><strong style={{ color:'#1e293b' }}>Device:</strong> {ip.device}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#94a3b8', marginTop:'6px', paddingTop:'6px', borderTop:'1px solid #f1f5f9' }}>
                      <span>Locked By: <strong style={{ color:'#1e293b' }}>{ip.lockedBy}</strong></span>
                      <span>Tag: <strong style={{ color:ACCENT }}>{ip.tag}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Energy Source Diagram */}
          <Section title="Energy Source Summary" badge="6 Types Identified" icon="ES">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'10px', marginBottom:'14px' }}>
              {Object.entries(energyTypeColors).map(([type, color], i) => {
                const count = isolationPoints.filter(ip => ip.energyType === type).length
                return (
                  <div key={type} style={{ ...st.card, textAlign:'center', borderTop:`3px solid ${color}`, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                    <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.3px' }}>{type}</div>
                    <div style={{ fontSize:'22px', fontWeight:800, color }}>{count}</div>
                    <div style={{ fontSize:'9px', color:'#94a3b8' }}>points</div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Zero Energy Verification Checklist */}
          <Section title="Zero Energy Verification Checklist" badge={`${zevChecklist.filter(c => c.checked).length}/${zevChecklist.length} Verified`} icon="ZE">
            <div style={st.card}>
              {zevChecklist.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:i < zevChecklist.length - 1 ? '1px solid #f1f5f9' : 'none', animation:`slideIn 0.7s ease ${i*0.05}s both` }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'6px', background:item.checked ? GREEN+'18' : RED+'12', border:`1.5px solid ${item.checked ? GREEN : RED}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', flexShrink:0 }}>
                    {item.checked ? <span style={{ color:GREEN, fontWeight:700 }}>✓</span> : <span style={{ color:RED, fontWeight:700 }}>—</span>}
                  </div>
                  <span style={{ fontSize:'12px', color:item.checked ? '#1e293b' : '#94a3b8', fontWeight:item.checked ? 500 : 400 }}>{item.item}</span>
                </div>
              ))}
              <div style={{ marginTop:'12px', padding:'10px 14px', background:'#f8fafc', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'12px', fontWeight:600, color:'#1e293b' }}>ZEV Completion</span>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'120px' }}><ProgressBar value={zevChecklist.filter(c => c.checked).length} max={zevChecklist.length} color={ACCENT} height={8} /></div>
                  <span style={{ fontSize:'13px', fontWeight:700, color:ACCENT }}>{Math.round((zevChecklist.filter(c => c.checked).length / zevChecklist.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ TAB 4: SAP INTEGRATION ═══ */}
      {tab === 'sap' && (
        <>
          {/* Sync Status Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'24px' }}>
            {sapSyncCards.map((c, i) => (
              <div key={i} style={{ ...st.card, textAlign:'center', borderTop:`3px solid ${c.color}`, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.label}</div>
                <div style={{ fontSize:'20px', fontWeight:800, color:c.color }}>{c.icon} {c.value}</div>
              </div>
            ))}
          </div>

          {/* Integration Flow */}
          <Section title="Integration Architecture" badge="Real-time Bi-directional" icon="IN">
            <div style={{ ...st.card, textAlign:'center', padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px' }}>
                <div style={{ background:ACCENT+'12', border:`2px solid ${ACCENT}40`, borderRadius:'12px', padding:'16px 24px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:ACCENT }}>Digital LOTO System</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8', marginTop:'4px' }}>Permit Management</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>ZEV Verification</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>Lock/Tag Tracking</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  <span style={{ color:GREEN, fontSize:'16px' }}>⟷</span>
                  <span style={{ fontSize:'9px', color:'#94a3b8' }}>RFC/BAPI</span>
                  <span style={{ fontSize:'9px', color:'#94a3b8' }}>Real-time</span>
                </div>
                <div style={{ background:'#0369a112', border:'2px solid #0369a140', borderRadius:'12px', padding:'16px 24px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#0369a1' }}>SAP PM</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8', marginTop:'4px' }}>Work Orders (IW31/32)</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>Functional Locations</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>Equipment Master</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  <span style={{ color:GREEN, fontSize:'16px' }}>⟷</span>
                  <span style={{ fontSize:'9px', color:'#94a3b8' }}>IDoc</span>
                  <span style={{ fontSize:'9px', color:'#94a3b8' }}>Batch</span>
                </div>
                <div style={{ background:'#dc262612', border:'2px solid #dc262640', borderRadius:'12px', padding:'16px 24px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#dc2626' }}>SAP EHS</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8', marginTop:'4px' }}>Safety Notifications</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>Incident Management</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>Compliance Tracking</div>
                </div>
              </div>
            </div>
          </Section>

          {/* SAP Functional Locations */}
          <Section title="SAP Functional Locations Hierarchy" badge={`${sapLocations.length} Locations`} icon="FL">
            <div style={st.card}>
              {sapLocations.map((loc, i) => (
                <div key={loc.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 0', borderBottom:i < sapLocations.length - 1 ? '1px solid #f1f5f9' : 'none', paddingLeft:`${loc.level * 24}px`, animation:`slideIn 0.7s ease ${i*0.04}s both` }}>
                  <span style={{ color:loc.level === 0 ? '#1e293b' : loc.level === 1 ? ACCENT : loc.level === 2 ? BLUE : '#64748b', fontSize:loc.level === 0 ? '10px' : '9px' }}>{loc.level === 0 ? '■' : loc.level === 1 ? '├─' : loc.level === 2 ? '│  ├─' : '│  │  ├─'}</span>
                  <span style={{ fontSize:'11px', fontWeight:loc.level <= 1 ? 700 : 500, color:loc.level === 0 ? '#1e293b' : '#4a5568' }}>{loc.name}</span>
                  <span style={{ fontSize:'9px', color:'#94a3b8', fontFamily:'monospace' }}>[{loc.id}]</span>
                  {loc.children > 0 && <span style={{ fontSize:'9px', color:ACCENT, background:ACCENT+'12', padding:'1px 6px', borderRadius:'8px' }}>{loc.children} sub</span>}
                </div>
              ))}
            </div>
          </Section>

          {/* SAP Work Orders */}
          <Section title="SAP Work Orders Linked to LOTO" badge={`${sapWorkOrders.length} WOs`} icon="WO">
            <div style={{ ...st.card, overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e8ecf1' }}>
                    {['WO Number', 'Description', 'Equipment', 'LOTO Permit', 'Status'].map(h => (
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sapWorkOrders.map((wo, i) => (
                    <tr key={wo.wo} style={{ borderBottom:'1px solid #f1f5f9', animation:`slideIn 0.7s ease ${i*0.06}s both` }}>
                      <td style={{ padding:'10px 8px', fontWeight:700, color:BLUE, fontFamily:'monospace' }}>{wo.wo}</td>
                      <td style={{ padding:'10px 8px', color:'#1e293b' }}>{wo.desc}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b' }}>{wo.equipment}</td>
                      <td style={{ padding:'10px 8px', fontWeight:600, color:ACCENT }}>{wo.lotoPermit}</td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ background:wo.status.includes('REL') ? GREEN+'18' : AMBER+'18', color:wo.status.includes('REL') ? GREEN : AMBER, fontWeight:600, padding:'3px 10px', borderRadius:'12px', fontSize:'10px' }}>{wo.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* SAP Transaction Codes */}
          <Section title="SAP Transaction Codes Used" badge="Plant Maintenance" icon="TX">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
              {sapTransactions.map((t, i) => (
                <div key={t.tcode} style={{ ...st.card, background:'#f8fafc', animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                    <span style={{ background:ACCENT, color:'#fff', fontWeight:800, padding:'3px 8px', borderRadius:'4px', fontSize:'11px', fontFamily:'monospace' }}>{t.tcode}</span>
                    <span style={{ fontSize:'12px', fontWeight:600, color:'#1e293b' }}>{t.desc}</span>
                  </div>
                  <div style={{ fontSize:'11px', color:'#64748b', lineHeight:1.5 }}>{t.usage}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Sync Log */}
          <Section title="Data Exchange Log" badge="Last 10 Events" icon="SL">
            <div style={st.card}>
              {syncLog.map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'8px 0', borderBottom:i < syncLog.length - 1 ? '1px solid #f1f5f9' : 'none', animation:`slideIn 0.7s ease ${i*0.04}s both` }}>
                  <span style={{ fontSize:'10px', color:'#94a3b8', fontFamily:'monospace', width:'65px', flexShrink:0 }}>{s.time}</span>
                  <span style={{ background:s.direction === 'Outbound' ? ACCENT+'15' : BLUE+'15', color:s.direction === 'Outbound' ? ACCENT : BLUE, fontWeight:700, padding:'2px 8px', borderRadius:'4px', fontSize:'9px', width:'65px', textAlign:'center', flexShrink:0 }}>{s.direction === 'Outbound' ? '↑ OUT' : '↓ IN'}</span>
                  <span style={{ fontSize:'11px', fontWeight:600, color:'#1e293b', flex:1 }}>{s.dataType}</span>
                  <span style={{ fontSize:'11px', color:'#64748b', flex:1.5 }}>{s.details}</span>
                  <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:s.status === 'Success' ? GREEN : RED, flexShrink:0 }} />
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ═══ TAB 5: SAFETY ANALYTICS ═══ */}
      {tab === 'analytics' && (
        <>
          {/* Safety KPI Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'24px' }}>
            {safetyKPIs.map((k, i) => (
              <div key={i} style={{ ...st.card, textAlign:'center', borderTop:`3px solid ${k.color}`, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.3px' }}>{k.label}</div>
                <div style={{ fontSize:'26px', fontWeight:800, color:k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Monthly Trend */}
          <Section title="Monthly LOTO Trend (12 Months)" badge="FY 2025-26" icon="TR">
            <div style={st.card}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'160px', padding:'0 4px' }}>
                {monthlyTrend.map((m, i) => {
                  const maxVal = Math.max(...monthlyTrend.map(t => t.count))
                  const h = (m.count / maxVal) * 140
                  return (
                    <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', animation:`slideIn 0.7s ease ${i*0.06}s both` }}>
                      <span style={{ fontSize:'10px', fontWeight:700, color:'#1e293b' }}>{m.count}</span>
                      <div style={{ width:'100%', height:`${h}px`, background:i === monthlyTrend.length - 1 ? ACCENT : ACCENT+'40', borderRadius:'4px 4px 0 0', transition:'height 1s ease' }} />
                      <span style={{ fontSize:'9px', color:'#94a3b8' }}>{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Section>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {/* Top 5 Equipment */}
            <Section title="Top 5 Equipment by LOTO Frequency" badge="MTD" icon="EQ">
              <div style={st.card}>
                {topEquipment.map((eq, i) => (
                  <div key={eq.name} style={{ marginBottom:i < topEquipment.length - 1 ? '12px' : 0, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'11px', color:'#64748b' }}>{eq.name}</span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:'#1e293b' }}>{eq.count}</span>
                    </div>
                    <ProgressBar value={eq.count} max={50} color={eq.color} height={6} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Average Isolation Time */}
            <Section title="Average Isolation Time by Area" badge="Minutes" icon="TM">
              <div style={st.card}>
                {avgIsolationTime.map((a, i) => (
                  <div key={a.area} style={{ marginBottom:i < avgIsolationTime.length - 1 ? '12px' : 0, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'11px', color:'#64748b' }}>{a.area}</span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:'#1e293b' }}>{a.time} min</span>
                    </div>
                    <ProgressBar value={a.time} max={a.max} color={a.time > 50 ? AMBER : ACCENT} height={6} />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Additional Safety Stats */}
          <Section title="Safety Performance Summary" badge="365 Days" icon="SP">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px' }}>
              {[
                { label: 'Training Compliance', value: '98.5%', sub: 'Staff Certified', color: GREEN },
                { label: 'LOTO-Related Incidents', value: '0', sub: 'Last 365 Days', color: GREEN },
                { label: 'Average Permits/Day', value: '11.4', sub: 'Rolling 30-Day Avg', color: ACCENT },
                { label: 'Permit Closure Rate', value: '99.2%', sub: 'Within Scheduled Time', color: GREEN },
              ].map((s, i) => (
                <div key={i} style={{ ...st.card, textAlign:'center', animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                  <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'4px', textTransform:'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:'10px', color:'#94a3b8', marginTop:'2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* AI Recommendations */}
          <Section title="AI Recommendations for Safety Improvement" badge={`${aiRecommendations.length} Recommendations`} icon="AI">
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {aiRecommendations.map((rec, i) => {
                const priColors = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' }
                return (
                  <div key={i} style={{ ...st.card, borderLeft:`4px solid ${priColors[rec.priority]}`, animation:`slideIn 0.7s ease ${i*0.1}s both` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', color:'#fff', background:priColors[rec.priority], padding:'2px 6px', borderRadius:'3px' }}>{rec.priority}</span>
                        <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{rec.title}</span>
                      </div>
                    </div>
                    <p style={{ margin:'0 0 8px', fontSize:'12px', color:'#4a5568', lineHeight:'1.6' }}>{rec.reason}</p>
                    <div style={{ display:'flex', gap:'16px' }}>
                      <span style={{ fontSize:'10px', color:'#94a3b8' }}>Confidence: <strong style={{ color:ACCENT }}>{rec.confidence}%</strong></span>
                      <span style={{ fontSize:'10px', color:'#94a3b8' }}>Impact: <strong style={{ color:GREEN }}>{rec.impact}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        </>
      )}

      {/* ═══ TAB 6: COMPLIANCE ═══ */}
      {tab === 'compliance' && (
        <>
          {/* Regulatory Compliance */}
          <Section title="Regulatory Compliance Status" badge="All Compliant" icon="RC">
            <div style={st.card}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e8ecf1' }}>
                    {['Standard', 'Description', 'Status', 'Last Review', 'Next Review'].map(h => (
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complianceChecklist.map((c, i) => (
                    <tr key={c.standard} style={{ borderBottom:'1px solid #f1f5f9', animation:`slideIn 0.7s ease ${i*0.06}s both` }}>
                      <td style={{ padding:'10px 8px', fontWeight:700, color:'#1e293b', fontSize:'11px' }}>{c.standard}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b' }}>{c.desc}</td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ background:GREEN+'18', color:GREEN, fontWeight:700, padding:'3px 10px', borderRadius:'12px', fontSize:'10px' }}>✓ {c.status}</span>
                      </td>
                      <td style={{ padding:'10px 8px', color:'#64748b', fontSize:'11px' }}>{c.lastReview}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b', fontSize:'11px' }}>{c.nextReview}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Audit Trail */}
          <Section title="Audit Trail" badge={`${auditTrail.length} Records`} icon="AT">
            <div style={{ ...st.card, overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e8ecf1' }}>
                    {['Date', 'Auditor', 'Area', 'Findings', 'Status'].map(h => (
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditTrail.map((a, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', animation:`slideIn 0.7s ease ${i*0.04}s both` }}>
                      <td style={{ padding:'10px 8px', fontWeight:600, color:'#1e293b', fontSize:'11px', whiteSpace:'nowrap' }}>{a.date}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b', fontSize:'11px' }}>{a.auditor}</td>
                      <td style={{ padding:'10px 8px', color:'#64748b', fontSize:'11px' }}>{a.area}</td>
                      <td style={{ padding:'10px 8px', color:'#4a5568', fontSize:'11px', maxWidth:'300px' }}>{a.findings}</td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ background:a.status === 'Closed' ? GREEN+'18' : a.status === 'Implemented' ? BLUE+'18' : AMBER+'18', color:a.status === 'Closed' ? GREEN : a.status === 'Implemented' ? BLUE : AMBER, fontWeight:700, padding:'3px 10px', borderRadius:'12px', fontSize:'10px' }}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Document Management */}
          <Section title="Document Management" badge={`${documents.length} Documents`} icon="DM">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
              {documents.map((doc, i) => (
                <div key={doc.name} style={{ ...st.card, background:'#f8fafc', animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                    <span style={{ background:doc.type === 'SOP' ? ACCENT+'18' : doc.type === 'Risk Assessment' ? RED+'18' : doc.type === 'Training Record' ? GREEN+'18' : doc.type === 'Emergency Plan' ? AMBER+'18' : BLUE+'18', color:doc.type === 'SOP' ? ACCENT : doc.type === 'Risk Assessment' ? RED : doc.type === 'Training Record' ? GREEN : doc.type === 'Emergency Plan' ? AMBER : BLUE, fontWeight:700, padding:'2px 8px', borderRadius:'4px', fontSize:'9px' }}>{doc.type}</span>
                  </div>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#1e293b', marginBottom:'4px' }}>{doc.name}</div>
                  <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'8px', lineHeight:1.5 }}>{doc.desc}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#94a3b8', paddingTop:'6px', borderTop:'1px solid #e8ecf1' }}>
                    <span>{doc.version}</span>
                    <span>Updated: {doc.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Expiring Certifications */}
          <Section title="Expiring Certifications Alert" badge={`${expiringCerts.length} Expiring`} icon="EXP">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
              {expiringCerts.map((cert, i) => (
                <div key={cert.name} style={{ ...st.card, borderLeft:`4px solid ${cert.daysLeft <= 10 ? RED : cert.daysLeft <= 20 ? AMBER : BLUE}`, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#1e293b', marginBottom:'4px' }}>{cert.name}</div>
                  <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'8px' }}>{cert.certification}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'11px', color:'#94a3b8' }}>Expires: {cert.expiry}</span>
                    <span style={{ background:cert.daysLeft <= 10 ? RED+'18' : cert.daysLeft <= 20 ? AMBER+'18' : BLUE+'18', color:cert.daysLeft <= 10 ? RED : cert.daysLeft <= 20 ? AMBER : BLUE, fontWeight:700, padding:'2px 8px', borderRadius:'10px', fontSize:'11px' }}>{cert.daysLeft} days</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Next Scheduled Audit */}
          <Section title="Upcoming Audit Schedule" badge="Planned" icon="CA">
            <div style={{ ...st.card, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'#1e293b', marginBottom:'4px' }}>Next Internal Audit — LOTO Systems</div>
                <div style={{ fontSize:'12px', color:'#64748b' }}>Auditor: V. Saxena (Internal HSE) | Scope: All areas — BF, SMS, Rolling Mill, Coke Oven, Power Plant</div>
                <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>Focus: Digital tag scanning implementation, Group LOTO procedures, SAP PM data integrity</div>
              </div>
              <div style={{ textAlign:'center', flexShrink:0, marginLeft:'24px' }}>
                <div style={{ fontSize:'10px', color:'#94a3b8', textTransform:'uppercase', marginBottom:'4px' }}>Scheduled Date</div>
                <div style={{ fontSize:'22px', fontWeight:800, color:ACCENT }}>10-Apr-2026</div>
                <div style={{ fontSize:'10px', color:'#94a3b8' }}>21 days from now</div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize:'13px', fontWeight:600, color:'#1e293b', marginBottom:'4px' }}>AI Engine — Digital LOTO Management</div>
          <div style={{ fontSize:'12px', color:'#64748b', lineHeight:1.6 }}>
            Managing {activePermits.length} active LOTO permits across 5 plant areas. SAP PM integration active with bi-directional sync every 30 seconds.
            AI hazard identification model analyzing 342 permits MTD with 99.7% compliance rate. Zero LOTO-related incidents in 365 days.
            Monitoring 68 isolation points across active permits. Zero Energy Verification automated with IoT sensors for electrical and pressure monitoring.
            Next AI model update: Energy source auto-detection v3.2 — training on 12,000+ historical isolation plans from steel plant operations.
          </div>
        </div>
      </div>
    </div>
  )
}

const st = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  title: { margin:0, fontSize:'22px', fontWeight:700, color:'#1e293b' },
  sub: { margin:'2px 0 0', fontSize:'13px', color:'#94a3b8' },
  headerRight: { display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' },
  liveBadge: { display:'flex', alignItems:'center', gap:'6px', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'16px', padding:'5px 12px', fontSize:'11px', fontWeight:600 },
  liveDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#16a34a' },
  aiBadge: { background:ACCENT+'15', color:ACCENT, fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'16px' },
  timeBadge: { fontSize:'11px', color:'#94a3b8', background:'#f8fafc', padding:'5px 12px', borderRadius:'16px', border:'1px solid #e8ecf1' },
  card: { background:'#fff', border:'1px solid #e8ecf1', borderRadius:'12px', padding:'18px' },
  cardLabel: { fontSize:'12px', color:'#94a3b8', fontWeight:500, marginBottom:'4px' },
  row: { display:'flex', gap:'14px' },
  tab: { background:'#fff', border:'1px solid #e8ecf1', borderRadius:'8px', padding:'7px 14px', fontSize:'12px', color:'#64748b', cursor:'pointer', fontWeight:500 },
  tabActive: { background:ACCENT, border:`1px solid ${ACCENT}`, borderRadius:'8px', padding:'7px 14px', fontSize:'12px', color:'#fff', cursor:'pointer', fontWeight:600 },
  aiFooter: { display:'flex', gap:'14px', background:'#fff', border:`1px solid ${ACCENT}30`, borderRadius:'12px', padding:'18px', marginTop:'10px' },
  aiFooterIcon: { width:'36px', height:'36px', borderRadius:'8px', background:ACCENT, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800, flexShrink:0 },
}
