'use client'
import { useState } from 'react'
import { BarChart, DonutChart, ProgressBar } from '@/components/industries/fmcg/components/Charts'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
const ACCENT = '#1a9b6c'
const TABS = ['Shift Scheduling', 'Attendance Tracking', 'Performance Monitor']

export default function Workforce({ defaultTab = 'shifts' }) {
  const live = useLiveData()
  const tm = { shifts: 0, attendance: 1, performance: 2 }
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  return (
    <div>
      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Workforce Management</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Shift scheduling, attendance tracking and performance monitoring</div>
      </div>
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === i ? 600 : 400, background: tab === i ? '#fff' : 'transparent', color: tab === i ? '#1e293b' : '#64748b', boxShadow: tab === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <ShiftScheduling />}
      {tab === 1 && <AttendanceTracking />}
      {tab === 2 && <PerformanceMonitor />}
    </div>
  )
}

function ShiftScheduling({ setToast = () => {} }) {
  const shifts = [
    { shift: 'Day Shift A (6AM–2PM)', supervisor: 'Suresh Patel', headcount: 48, present: 46, lines: 'Line 1, 2, 3, 7', status: 'active' },
    { shift: 'Evening Shift B (2PM–10PM)', supervisor: 'Anita Mehta', headcount: 42, present: 0, lines: 'Line 1, 3, 5, 6', status: 'upcoming' },
    { shift: 'Night Shift C (10PM–6AM)', supervisor: 'Ramesh Kumar', headcount: 36, present: 0, lines: 'Line 2, 4, 7', status: 'upcoming' },
  ]
  const today = ['Mon 24', 'Tue 25', 'Wed 26', 'Thu 27', 'Fri 28', 'Sat 29']
  const schedule = [
    { name:'Suresh Patel',    dept:'Production', shifts:['A','A','A','A','A','OFF'] },
    { name:'Pooja Sharma',    dept:'QC Lab',     shifts:['A','A','A','A','A','OFF'] },
    { name:'Ravi Kumar',      dept:'Production', shifts:['A','A','B','B','A','A'  ] },
    { name:'Sunita Meena',    dept:'Packaging',  shifts:['B','B','B','A','A','OFF'] },
    { name:'Arjun Patel',     dept:'Dispatch',   shifts:['A','OFF','A','A','B','B'] },
    { name:'Deepa Nair',      dept:'Quality',    shifts:['C','C','A','A','OFF','A'] },
    { name:'Anil Gupta',      dept:'Production', shifts:['B','B','C','C','B','B'  ] },
    { name:'Vikram Singh',    dept:'Prod Sup.',  shifts:['C','C','C','C','C','OFF'] },
    { name:'Deepak Kumar',    dept:'Maintenance',shifts:['A','A','A','B','B','OFF'] },
    { name:'Priya Agarwal',   dept:'Stores',     shifts:['A','A','A','A','A','A'  ] },
  ]
  const sc = { A: [ACCENT, '#ededfa'], B: ['#3b82f6', '#eff6ff'], C: ['#8b5cf6', '#f5f3ff'], OFF: ['#94a3b8', '#f1f5f9'] }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {shifts.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, padding: 16, borderLeft: `4px solid ${s.status === 'active' ? ACCENT : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{s.shift}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: s.status === 'active' ? ACCENT : '#94a3b8', background: s.status === 'active' ? '#ededfa' : '#f1f5f9', padding: '2px 8px', borderRadius: 20 }}>{s.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Supervisor: {s.supervisor}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Lines: {s.lines}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 10px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>Headcount</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{s.headcount}</div>
              </div>
              <div style={{ background: s.status === 'active' ? '#ededfa' : '#f8fafc', borderRadius: 6, padding: '6px 10px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>Present</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.status === 'active' ? ACCENT : '#94a3b8' }}>{s.status === 'active' ? s.present : '—'}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <button onClick={() => setToast(`${s.supervisor} notified — shift briefing scheduled`)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#1a9b6c', fontWeight:600 }}>Notify Supervisor</button>
              <button onClick={() => setToast(`${s.shift} — attendance sheet printed`)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Print Sheet</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Week schedule — 24–29 Mar 2026</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setToast('Swap shift request form sent to HR system')} style={{ fontSize:12, padding:'6px 13px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Request Swap</button>
            <button onClick={() => { const a=document.createElement('a'); a.href='data:text/csv,Name,Mon,Tue,Wed,Thu,Fri,Sat'; a.download='shift_schedule.csv'; a.click(); setToast('Schedule exported') }} style={{ fontSize:12, padding:'6px 13px', borderRadius:7, border:'none', cursor:'pointer', background:'#1a9b6c', color:'#fff', fontWeight:600 }}>Export Schedule</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Employee</th>
              {today.map(d => <th key={d} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: d === 'Mon 24' ? ACCENT : '#64748b', fontSize: 12 }}>{d}</th>)}
            </tr></thead>
            <tbody>
              {schedule.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px' }}><div style={{ fontWeight: 500, color: '#1e293b' }}>{e.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{e.dept}</div></td>
                  {e.shifts.map((sh, j) => (
                    <td key={j} style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: (sc[sh]||['#64748b','#f1f5f9'])[0], background: (sc[sh]||['#64748b','#f1f5f9'])[1], padding: '3px 10px', borderRadius: 20 }}>{sh}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AttendanceTracking({ setToast = () => {} }) {
  const { kpis } = useLiveData()
  const [records, setRecords] = useState([
    { name:'Arjun Mehta',      dept:'Management',  checkIn:'08:55 AM', checkOut:'—',       hours:'1h 19m', status:'present', method:'Face ID'    },
    { name:'Suresh Patel',     dept:'Production',  checkIn:'05:48 AM', checkOut:'—',       hours:'4h 26m', status:'present', method:'Biometric'  },
    { name:'Pooja Sharma',     dept:'QC Lab',      checkIn:'05:52 AM', checkOut:'—',       hours:'4h 22m', status:'present', method:'Biometric'  },
    { name:'Ravi Kumar',       dept:'Production',  checkIn:'05:58 AM', checkOut:'—',       hours:'4h 16m', status:'present', method:'Biometric'  },
    { name:'Sunita Meena',     dept:'Packaging',   checkIn:'06:04 AM', checkOut:'—',       hours:'4h 10m', status:'present', method:'Face ID'    },
    { name:'Arjun Patel',      dept:'Dispatch',    checkIn:'06:12 AM', checkOut:'—',       hours:'4h 02m', status:'late',    method:'Biometric'  },
    { name:'Deepak Kumar',     dept:'Maintenance', checkIn:'05:50 AM', checkOut:'—',       hours:'4h 24m', status:'present', method:'Biometric'  },
    { name:'Priya Agarwal',    dept:'Stores',      checkIn:'05:55 AM', checkOut:'—',       hours:'4h 19m', status:'present', method:'Biometric'  },
    { name:'Deepa Nair',       dept:'Quality',     checkIn:'05:44 AM', checkOut:'—',       hours:'4h 30m', status:'present', method:'Face ID'    },
    { name:'Vikram Singh',     dept:'Prod Sup.',   checkIn:'—',        checkOut:'—',       hours:'—',      status:'absent',  method:'—'          },
    { name:'Anil Gupta',       dept:'Production',  checkIn:'14:05 PM', checkOut:'—',       hours:'0h 09m', status:'present', method:'Biometric'  },
    { name:'Kavita Sharma',    dept:'HR',          checkIn:'09:02 AM', checkOut:'—',       hours:'1h 12m', status:'present', method:'Face ID'    },
    { name:'Ramesh Yadav',     dept:'Dispatch',    checkIn:'05:42 AM', checkOut:'—',       hours:'4h 32m', status:'present', method:'Biometric'  },
    { name:'Rohit Joshi',      dept:'Finance',     checkIn:'09:18 AM', checkOut:'—',       hours:'0h 56m', status:'late',    method:'Face ID'    },
    { name:'Anita Mehta',      dept:'Maintenance', checkIn:'05:38 AM', checkOut:'—',       hours:'4h 36m', status:'present', method:'Biometric'  },
  ])
  const sc = { present: [ACCENT, '#ededfa'], late: ['#f59e0b', '#fffbeb'], absent: ['#ef4444', '#fef2f2'] }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ l:'Total Workforce', v:'284', c:ACCENT }, { l:'Present Today', v:'261', c:'#10b981' }, { l:'Absent', v:'14', c:'#ef4444' }, { l:'Late Arrivals', v:'9', c:'#f59e0b' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 10, padding: 16, borderTop: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>Today's Attendance — {records.length} employees</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setToast('Attendance sheet for today printed — sent to payroll')} style={{ fontSize:12, padding:'6px 13px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Print</button>
            <button onClick={() => { const a=document.createElement('a'); a.href='data:text/csv,Name,Dept,CheckIn,CheckOut,Hours,Status'; a.download='attendance_25mar.csv'; a.click(); setToast('Attendance data exported') }} style={{ fontSize:12, padding:'6px 13px', borderRadius:7, border:'none', cursor:'pointer', background:'#1a9b6c', color:'#fff', fontWeight:600 }}>Export CSV</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Method', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: r.status === 'absent' ? '#fff5f5' : 'transparent' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{r.name}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{r.dept}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{r.checkIn}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{r.checkOut}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{r.hours}</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{r.method}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 11, fontWeight: 600, color: (sc[r.status]||['#64748b','#f1f5f9'])[0], background: (sc[r.status]||['#64748b','#f1f5f9'])[1], padding: '3px 10px', borderRadius: 20 }}>{r.status}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {r.status==='present' && r.checkOut==='—' && <button onClick={() => markCheckout(i)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Check Out</button>}
                    {r.status!=='absent' && <button onClick={() => markAbsent(i)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #fecaca', cursor:'pointer', background:'#fff', color:'#ef4444', fontWeight:600 }}>Mark Absent</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PerformanceMonitor({ setToast = () => {} }) {
  const teams = [
    { dept:'Production',          head:'Suresh Patel',    score:92, efficiency:94, quality:98, attendance:96, trend:'+2.1%', headcount:84  },
    { dept:'Quality Control',     head:'Pooja Sharma',    score:96, efficiency:98, quality:99, attendance:97, trend:'+1.4%', headcount:18  },
    { dept:'Maintenance',         head:'Deepak Kumar',    score:84, efficiency:82, quality:90, attendance:92, trend:'-0.8%', headcount:24  },
    { dept:'Dispatch & Logistics',head:'Ramesh Yadav',    score:88, efficiency:90, quality:94, attendance:88, trend:'+3.2%', headcount:12  },
    { dept:'Stores & Inventory',  head:'Priya Agarwal',  score:91, efficiency:92, quality:96, attendance:94, trend:'+0.6%', headcount:8   },
    { dept:'Packaging',           head:'Sunita Meena',    score:89, efficiency:88, quality:97, attendance:93, trend:'+1.8%', headcount:32  },
    { dept:'HR & Admin',          head:'Kavita Sharma',   score:94, efficiency:96, quality:98, attendance:98, trend:'+0.4%', headcount:6   },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {teams.map((t, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{t.dept}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Head: {t.head} · {t.headcount} staff</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: t.trend.startsWith('+') ? ACCENT : '#ef4444', background: t.trend.startsWith('+') ? '#ededfa' : '#fef2f2', padding: '2px 8px', borderRadius: 20 }}>{t.trend}</span>
              <div style={{ textAlign: 'center', background: t.score >= 90 ? '#ededfa' : '#fffbeb', borderRadius: 8, padding: '6px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.score >= 90 ? ACCENT : '#f59e0b' }}>{t.score}</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[['Efficiency', t.efficiency], ['Quality', t.quality], ['Attendance', t.attendance]].map(([l, v]) => (
              <div key={l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{v}%</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${v}%`, background: v >= 90 ? ACCENT : '#f59e0b', borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
