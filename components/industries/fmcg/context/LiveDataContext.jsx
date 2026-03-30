'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'

const LiveDataContext = createContext(null)

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rnd     = (min, max)  => Math.random() * (max - min) + min
const vary    = (base, pct) => base * (1 + (Math.random() - 0.5) * 2 * pct)
const varyInt = (base, pct) => Math.round(vary(base, pct))
const clamp   = (v, lo, hi) => Math.min(Math.max(v, lo), hi)
const fmt1    = v => parseFloat(v.toFixed(1))
const fmt2    = v => parseFloat(v.toFixed(2))
let   _uidSeq = 1000
const uid     = (prefix) => `${prefix}-${Date.now()}-${++_uidSeq}`

// ─── Live generators ─────────────────────────────────────────────────────────
function genKPIs(prev) {
  return {
    todayProduction:  varyInt(prev?.todayProduction  || 48240, 0.004),
    activeLines:      prev?.activeLines || 6,
    oee:              fmt1(clamp(vary(prev?.oee      || 87.3,  0.003), 82, 92)),
    dispatchedOrders: prev ? Math.min(prev.dispatchedOrders + (Math.random() > 0.8 ? 1 : 0), 180) : 142,
    qualityPassRate:  fmt1(clamp(vary(prev?.qualityPassRate || 98.6, 0.001), 97.2, 99.4)),
    pendingAlerts:    prev?.pendingAlerts || 7,
    energyKwh:        varyInt(prev?.energyKwh || 2840, 0.008),
    batchYield:       fmt1(clamp(vary(prev?.batchYield || 96.4, 0.002), 94, 99)),
    throughputPerHr:  varyInt(prev?.throughputPerHr || 3420, 0.006),
    defectRate:       fmt2(clamp(vary(prev?.defectRate || 1.40, 0.02), 0.8, 2.4)),
  }
}

function genLines(prev) {
  const base = [
    { id:'L1', name:'Line 1 — Biscuits',   status:'running',     target:2400 },
    { id:'L2', name:'Line 2 — Noodles',    status:'running',     target:1800 },
    { id:'L3', name:'Line 3 — Chips',      status:'running',     target:3200 },
    { id:'L4', name:'Line 4 — Beverages',  status:'idle',        target:1600 },
    { id:'L5', name:'Line 5 — Sauce',      status:'running',     target:1200 },
    { id:'L6', name:'Line 6 — Chocolates', status:'running',     target:2000 },
    { id:'L7', name:'Line 7 — Snacks',     status:'running',     target:2600 },
    { id:'L8', name:'Line 8 — Juices',     status:'maintenance', target:1400 },
  ]
  return base.map((b, i) => {
    const p = prev?.[i]
    const eff = b.status === 'running' ? fmt1(clamp(vary(p?.eff || [94,88,91,0,79,85,96,0][i], 0.008), 70, 99)) : 0
    return { ...b, eff, actual: b.status === 'running' ? Math.round(b.target * eff / 100) : 0 }
  })
}

function genMachines(prev) {
  const base = [
    { id:'M1', name:'Mixing Unit M1',    line:'Line 1', status:'running',     tempBase:68,  rpmBase:1420 },
    { id:'M2', name:'Extruder EX-2',     line:'Line 2', status:'running',     tempBase:182, rpmBase:960  },
    { id:'M3', name:'Frying Unit FU-1',  line:'Line 3', status:'running',     tempBase:175, rpmBase:0    },
    { id:'M4', name:'Packaging M-4A',    line:'Line 4', status:'warning',     tempBase:54,  rpmBase:3200 },
    { id:'M5', name:'Filling Stn F5',    line:'Line 5', status:'running',     tempBase:28,  rpmBase:480  },
    { id:'M6', name:'Sealing Unit S6',   line:'Line 6', status:'running',     tempBase:145, rpmBase:2100 },
    { id:'M7', name:'Conveyor CB7',      line:'Line 7', status:'running',     tempBase:42,  rpmBase:600  },
    { id:'M8', name:'Blending Tank BT1', line:'Line 8', status:'maintenance', tempBase:24,  rpmBase:0    },
  ]
  return base.map((b, i) => {
    const p = prev?.[i]
    const temp = b.status !== 'maintenance' ? fmt1(clamp(vary(p?.temp || b.tempBase, 0.006), b.tempBase * 0.92, b.tempBase * 1.08)) : b.tempBase
    const load = b.status === 'running' ? clamp(varyInt(p?.load || [84,91,88,73,79,92,96,0][i], 0.012), 60, 99) : 0
    const vibration = b.status === 'warning' ? fmt1(clamp(vary(p?.vibration || 2.8, 0.04), 2.0, 4.5)) : b.status === 'running' ? fmt1(clamp(vary(p?.vibration || 0.8, 0.05), 0.3, 1.8)) : 0
    return { ...b, temp, load, vibration }
  })
}

function genSensors(prev) {
  const base = [
    { id:'SNS-001', name:'Mixing Unit Temp',      loc:'Line 1',       type:'Temperature', unit:'°C',    base:68,   range:0.008, alertThresh:80,  warnThresh:72  },
    { id:'SNS-002', name:'Frying Oil Temp',       loc:'Line 3',       type:'Temperature', unit:'°C',    base:175,  range:0.005, alertThresh:195, warnThresh:185 },
    { id:'SNS-003', name:'Cold Room A',            loc:'Cold Storage', type:'Temperature', unit:'°C',    base:4.2,  range:0.015, alertThresh:6,   warnThresh:5.5 },
    { id:'SNS-004', name:'Cold Room B',            loc:'Cold Storage', type:'Temperature', unit:'°C',    base:6.1,  range:0.012, alertThresh:6,   warnThresh:5.8 },
    { id:'SNS-005', name:'CB4 Belt Temp',          loc:'Line 4',       type:'Temperature', unit:'°C',    base:72,   range:0.02,  alertThresh:65,  warnThresh:62  },
    { id:'SNS-006', name:'WH Humidity A',          loc:'Warehouse A',  type:'Humidity',    unit:'%',     base:64,   range:0.008, alertThresh:75,  warnThresh:70  },
    { id:'SNS-007', name:'EX-2 Vibration',         loc:'Line 2',       type:'Vibration',   unit:'mm/s',  base:2.8,  range:0.025, alertThresh:3.5, warnThresh:3.0 },
    { id:'SNS-008', name:'M1 Motor Current',       loc:'Line 1',       type:'Current',     unit:'A',     base:42,   range:0.01,  alertThresh:55,  warnThresh:50  },
    { id:'SNS-009', name:'Gas Flow Meter',         loc:'Boiler Room',  type:'Flow',        unit:'m³/h',  base:184,  range:0.01,  alertThresh:220, warnThresh:210 },
    { id:'SNS-010', name:'Boiler Pressure',        loc:'Boiler Room',  type:'Pressure',    unit:'bar',   base:6.8,  range:0.008, alertThresh:8.5, warnThresh:8.0 },
    { id:'SNS-011', name:'Extruder Barrel Temp',   loc:'Line 2',       type:'Temperature', unit:'°C',    base:182,  range:0.006, alertThresh:200, warnThresh:192 },
    { id:'SNS-012', name:'Packaging Line Speed',   loc:'Line 1',       type:'Speed',       unit:'ppm',   base:320,  range:0.012, alertThresh:380, warnThresh:360 },
    { id:'SNS-013', name:'Conveyor Motor Current', loc:'Line 7',       type:'Current',     unit:'A',     base:28,   range:0.015, alertThresh:38,  warnThresh:34  },
    { id:'SNS-014', name:'Oil Tank Level',         loc:'Fryer FU-1',   type:'Level',       unit:'%',     base:72,   range:0.01,  alertThresh:20,  warnThresh:30  },
    { id:'SNS-015', name:'Compressed Air Pressure',loc:'Utility',      type:'Pressure',    unit:'bar',   base:7.2,  range:0.008, alertThresh:5.5, warnThresh:6.0 },
    { id:'SNS-016', name:'Cold Room Humidity',     loc:'Cold Storage', type:'Humidity',    unit:'%',     base:68,   range:0.01,  alertThresh:80,  warnThresh:75  },
    { id:'SNS-017', name:'Sealing Unit Temp',      loc:'Line 6',       type:'Temperature', unit:'°C',    base:145,  range:0.01,  alertThresh:165, warnThresh:158 },
    { id:'SNS-018', name:'WH Temperature B',       loc:'Warehouse B',  type:'Temperature', unit:'°C',    base:26,   range:0.006, alertThresh:35,  warnThresh:32  },
  ]
  const now = Date.now()
  return base.map((b, i) => {
    const pv     = prev?.[i]?.rawVal || b.base
    const rawVal = clamp(vary(pv, b.range), b.base * 0.80, b.base * 1.20)
    const alert  = rawVal > b.alertThresh
    const warn   = !alert && rawVal > b.warnThresh
    const disp   = b.type === 'Temperature' && b.base < 10 ? fmt1(rawVal)
                 : b.type === 'Vibration' || b.type === 'Pressure' ? fmt1(rawVal)
                 : b.type === 'Speed' ? Math.round(rawVal)
                 : Math.round(rawVal)
    const pct    = Math.min(Math.max((rawVal - b.base * 0.8) / (b.alertThresh - b.base * 0.8) * 100, 0), 100)
    const updatedAt = now
    return { ...b, rawVal, value:`${disp}${b.unit}`, alert, warn, pct, status:'online', updatedAt }
  })
}

function genBatches(prev, userBatches) {
  const seed = [
    { id:'BT-2026-0422', sku:'Bourbon Biscuits 150g', line:'Line 1', qty:4800,  qc:'pass',    yield:98.2, startTime:'06:00' },
    { id:'BT-2026-0421', sku:'Maggi Noodles 70g',     line:'Line 2', qty:6000,  qc:'pass',    yield:97.8, startTime:'05:30' },
    { id:'BT-2026-0420', sku:'Lays Chips 26g',        line:'Line 3', qty:8000,  qc:'pass',    yield:99.1, startTime:'04:00' },
    { id:'BT-2026-0419', sku:'Frooti 200ml',          line:'Line 5', qty:5000,  qc:'pending', yield:96.4, startTime:'07:00' },
    { id:'BT-2026-0418', sku:'KitKat 18g',            line:'Line 6', qty:10000, qc:'review',  yield:97.2, startTime:'05:00' },
  ]
  const rates = [10, 12, 0, 8, 14]
  const updated = seed.map((b, i) => {
    const prevDone = prev?.find(p => p.id === b.id)?.done ?? [3840,5400,8000,2800,7200][i]
    const done   = b.qty === 8000 ? b.qty : Math.min(prevDone + (Math.random() > 0.4 ? rates[i] : 0), b.qty)
    const status = done >= b.qty ? 'complete' : 'running'
    const yld    = fmt1(clamp(vary(b.yield, 0.001), 94, 99.5))
    return { ...b, done, status, yield: yld, pct: Math.round((done / b.qty) * 100) }
  })
  // Merge user-added batches (also progress them)
  const userUpdated = (userBatches || []).map(b => {
    if (b.status === 'complete') return b
    const done = Math.min((b.done || 0) + (Math.random() > 0.3 ? Math.round(b.qty * 0.005) : 0), b.qty)
    const pct  = Math.round((done / b.qty) * 100)
    const status = done >= b.qty ? 'complete' : b.status
    return { ...b, done, pct, status }
  })
  return [...updated, ...userUpdated]
}

function genFleet(prev) {
  const base = [
    { id:'RJ-14-GB-4421', type:'Mini Truck',   driver:'Ramesh Yadav',  status:'parked',  locBase:'Sharma Traders, Jaipur',   fuelBase:82, trips:2 },
    { id:'RJ-14-GC-8812', type:'Medium Truck', driver:'Sunil Meena',   status:'moving',  locBase:'NH-48, Kishangarh',        fuelBase:61, trips:1 },
    { id:'RJ-14-GD-2290', type:'Medium Truck', driver:'Vikram Singh',  status:'moving',  locBase:'Bundi Bypass, Kota',       fuelBase:44, trips:1 },
    { id:'RJ-14-GE-5540', type:'Large Truck',  driver:'Arjun Patel',   status:'loading', locBase:'Plant Gate, Jaipur',       fuelBase:95, trips:0 },
    { id:'RJ-14-GF-1180', type:'Large Truck',  driver:'Deepak Kumar',  status:'idle',    locBase:'Plant Yard, Bay 3',        fuelBase:100,trips:0 },
    { id:'RJ-14-GA-9901', type:'Mini Van',     driver:'Rohit Sharma',  status:'moving',  locBase:'Sikar Road, Jaipur',       fuelBase:38, trips:3 },
  ]
  const movLocs = [
    ['NH-48, Kishangarh','Ajmer Bypass','Near Kishangarh Toll','Metro Wholesale, Ajmer'],
    ['Bundi Bypass, Kota','Indargarh Crossing','NH-27 Outskirts','Near Gupta Distributors'],
    ['Sikar Road','Murlipura Industrial','Sirsi Road Junction','City Mall, Jaipur'],
  ]
  const movIdx = [1,2,5]
  return base.map((b, i) => {
    const p    = prev?.[i]
    const fuel = clamp((p?.fuel ?? b.fuelBase) - (b.status === 'moving' ? rnd(0.02, 0.08) : 0), 5, 100)
    const speed = b.status === 'moving' ? clamp(varyInt(p?.speed || 65, 0.08), 42, 88) : 0
    const mi    = movIdx.indexOf(i)
    const locs  = mi >= 0 ? movLocs[mi] : null
    const li    = locs ? (p?.locIdx !== undefined ? (p.locIdx + (Math.random() > 0.85 ? 1 : 0)) % locs.length : 0) : 0
    return { ...b, fuel:fmt1(fuel), speed, loc: locs ? locs[li] : b.locBase, locIdx:li }
  })
}

function genColdStorage(prev) {
  const base = [
    { id:'CS-01', name:'Cold Room A', type:'Chilled', setTemp:4,   humBase:72, capBase:85, items:8  },
    { id:'CS-02', name:'Cold Room B', type:'Chilled', setTemp:4,   humBase:68, capBase:92, items:12 },
    { id:'CS-03', name:'Freezer 1',   type:'Frozen',  setTemp:-18, humBase:55, capBase:60, items:4  },
    { id:'CS-04', name:'Ambient WH',  type:'Ambient', setTemp:22,  humBase:64, capBase:78, items:28 },
  ]
  return base.map((b, i) => {
    const p     = prev?.[i]
    const temp  = fmt1(clamp(vary(p?.temp  ?? (b.setTemp + 0.2), 0.012), b.setTemp - 1.5, b.setTemp + 2.5))
    const humid = clamp(varyInt(p?.humid ?? b.humBase, 0.008), 45, 88)
    return { ...b, temp, humid, status: Math.abs(temp - b.setTemp) > 1.5 ? 'warning' : 'normal' }
  })
}

function genOEE(prev) {
  return {
    plant:   fmt1(clamp(vary(prev?.plant   || 87.3, 0.003), 82, 92)),
    avail:   fmt1(clamp(vary(prev?.avail   || 93.2, 0.003), 88, 97)),
    perf:    fmt1(clamp(vary(prev?.perf    || 88.6, 0.004), 83, 94)),
    quality: fmt1(clamp(vary(prev?.quality || 98.6, 0.001), 97, 99.5)),
    downtime:fmt1(clamp(vary(prev?.downtime|| 2.4,  0.015), 0.5, 5.0)),
  }
}

function genAlerts(prev) {
  const seed = [
    { id:'a1', msg:'Line 4 conveyor belt temperature spike', sev:'critical', ageMin:8  },
    { id:'a2', msg:'Raw material batch RMB-2241 expiry alert — 3 days', sev:'warning', ageMin:22 },
    { id:'a3', msg:'Cold storage Unit B — temperature deviation', sev:'warning', ageMin:41 },
    { id:'a4', msg:'QC rejection rate on Line 3 elevated — 2.8%', sev:'info', ageMin:62 },
    { id:'a5', msg:'SAP ERP sync delay — retrying', sev:'info', ageMin:118 },
  ]
  return seed.map(a => {
    const age  = (prev?.find(p => p.id === a.id)?.ageMin ?? a.ageMin) + (Math.random() > 0.7 ? 1 : 0)
    const h    = Math.floor(age / 60), m = age % 60
    return { ...a, ageMin:age, time: h > 0 ? `${h} hr${h>1?'s':''} ago` : `${m} min ago` }
  })
}

function genTopSKUs(prev) {
  const base = [
    { name:'Bourbon Biscuits 150g', color:'#1a9b6c', base:12480 },
    { name:'Maggi Noodles 70g',     color:'#3b82f6', base:10920 },
    { name:'Lays Chips 26g',        color:'#f59e0b', base:9840  },
    { name:'Frooti 200ml',          color:'#8b5cf6', base:8760  },
    { name:'KitKat 18g',            color:'#ec4899', base:7200  },
  ]
  const max = Math.max(...base.map(b => b.base))
  return base.map((b, i) => {
    const units = varyInt(prev?.[i]?.units || b.base, 0.004)
    return { ...b, units, pct: Math.round((units / max) * 100) }
  })
}

// ─── Master tick ──────────────────────────────────────────────────────────────
function generateSnapshot(prev, userRecords) {
  return {
    tick:        (prev?.tick || 0) + 1,
    ts:          Date.now(),
    kpis:        genKPIs(prev?.kpis),
    lines:       genLines(prev?.lines),
    machines:    genMachines(prev?.machines),
    sensors:     genSensors(prev?.sensors),
    batches:     genBatches(prev?.batches, userRecords?.batches),
    fleet:       genFleet(prev?.fleet),
    coldStorage: genColdStorage(prev?.coldStorage),
    oee:         genOEE(prev?.oee),
    alerts:      genAlerts(prev?.alerts),
    topSKUs:     genTopSKUs(prev?.topSKUs),
    // user-managed mutable lists (pass through unchanged by generator)
    vendors:     userRecords?.vendors     || prev?.vendors     || SEED_VENDORS,
    purchaseOrders: userRecords?.purchaseOrders || prev?.purchaseOrders || SEED_POS,
    recipes:     userRecords?.recipes     || prev?.recipes     || SEED_RECIPES,
    workOrders:  userRecords?.workOrders  || prev?.workOrders  || SEED_WOS,
    spareParts:  userRecords?.spareParts  || prev?.spareParts  || SEED_SPARE,
    pmSchedules: userRecords?.pmSchedules || prev?.pmSchedules || SEED_PM,
    users:       userRecords?.users       || prev?.users       || SEED_USERS,
    roles:       userRecords?.roles       || prev?.roles       || SEED_ROLES,
  }
}

// ─── Seed data for mutable lists ─────────────────────────────────────────────
const SEED_VENDORS = [
  { id:'VND-001', name:'Aashirvaad Mills Ltd',        category:'Grains & Flour',    contact:'Rajesh Gupta',      phone:'+91 98201 44210', rating:4.8, onTime:96, orders:48, status:'preferred', dues:0,       email:'rajesh@aashirvaad.in',    city:'Jaipur',   gst:'08AARCA1234A1ZP' },
  { id:'VND-002', name:'Saffola Agro Pvt Ltd',         category:'Oils & Fats',       contact:'Priya Sharma',      phone:'+91 99001 22310', rating:4.5, onTime:91, orders:32, status:'approved',  dues:84000,   email:'priya@saffola.in',         city:'Indore',   gst:'23BBBCA5678B1ZQ' },
  { id:'VND-003', name:'Bajaj Sugar Mills',            category:'Sweeteners',         contact:'Anand Bajaj',       phone:'+91 97001 88440', rating:4.7, onTime:94, orders:28, status:'preferred', dues:0,       email:'anand@bajajsugar.in',      city:'Muzaffarnagar', gst:'09CCCCA9012C1ZR' },
  { id:'VND-004', name:'Uflex Ltd',                   category:'Packaging',          contact:'Manish Lal',        phone:'+91 98101 55120', rating:4.3, onTime:88, orders:60, status:'approved',  dues:142000,  email:'manish@uflex.in',          city:'Noida',    gst:'09DDDCA3456D1ZS' },
  { id:'VND-005', name:'Barry Callebaut India Pvt Ltd',category:'Cocoa & Chocolate', contact:'Suresh Kumar',      phone:'+91 96201 77840', rating:4.9, onTime:98, orders:12, status:'preferred', dues:0,       email:'suresh@barry.in',          city:'Pune',     gst:'27EEECA7890E1ZT' },
  { id:'VND-006', name:'Roha Dyechem Pvt Ltd',        category:'Food Additives',     contact:'Deepa Nair',        phone:'+91 98401 33910', rating:3.9, onTime:82, orders:18, status:'review',    dues:28000,   email:'deepa@roha.in',            city:'Mumbai',   gst:'27FFFCA1234F1ZU' },
  { id:'VND-007', name:'Tata Salt (TATA Chemicals)',  category:'Condiments',         contact:'Vinay Menon',       phone:'+91 97201 66540', rating:4.9, onTime:99, orders:22, status:'preferred', dues:0,       email:'vinay@tatachemicals.in',   city:'Mithapur', gst:'24GGGCA5678G1ZV' },
  { id:'VND-008', name:'Devshree Agro Foods',         category:'Fruit & Pulp',       contact:'Ramesh Ahuja',      phone:'+91 96401 22180', rating:4.6, onTime:93, orders:16, status:'approved',  dues:0,       email:'ramesh@devshree.in',       city:'Ahmedabad',gst:'24HHHCA9012H1ZW' },
  { id:'VND-009', name:'Parle Agro Pvt Ltd',          category:'Beverage Base',      contact:'Sneha Parle',       phone:'+91 98601 44290', rating:4.4, onTime:89, orders:9,  status:'approved',  dues:54000,   email:'sneha@parleagro.in',       city:'Mumbai',   gst:'27IIICA3456I1ZX' },
  { id:'VND-010', name:'HDFC Chemicals Ltd',          category:'Food Grade Chemicals',contact:'Ajay Khanna',      phone:'+91 99201 88130', rating:4.2, onTime:86, orders:14, status:'approved',  dues:0,       email:'ajay@hdfc-chem.in',        city:'Delhi',    gst:'07JJJCA7890J1ZY' },
  { id:'VND-011', name:'Amul Dairy (GCMMF)',          category:'Dairy & Milk Solids',contact:'Pradeep Shah',      phone:'+91 97601 55470', rating:4.8, onTime:97, orders:24, status:'preferred', dues:0,       email:'pradeep@amul.coop',        city:'Anand',    gst:'24KKKCA1234K1ZZ' },
  { id:'VND-012', name:'ITC Agri Business',           category:'Potato & Starch',    contact:'Meera Iyer',        phone:'+91 96801 77320', rating:4.6, onTime:92, orders:20, status:'approved',  dues:67000,   email:'meera@itcagribus.in',      city:'Hyderabad',gst:'36LLLCA5678L1ZA' },
  { id:'VND-013', name:'Essel Propack Ltd',           category:'Flexible Packaging', contact:'Vikram Seth',       phone:'+91 98801 33450', rating:4.4, onTime:90, orders:35, status:'approved',  dues:118000,  email:'vikram@esselpropack.in',   city:'Mumbai',   gst:'27MMMCA9012M1ZB' },
  { id:'VND-014', name:'Kancor Ingredients Ltd',      category:'Spices & Extracts',  contact:'Leena Thomas',      phone:'+91 97401 22680', rating:4.7, onTime:95, orders:11, status:'preferred', dues:0,       email:'leena@kancor.in',          city:'Ernakulam',gst:'32NNNCA3456N1ZC' },
  { id:'VND-015', name:'Sudarshan Chemical Industries',category:'Food Colours',      contact:'Rohit Desai',       phone:'+91 96601 44560', rating:4.1, onTime:84, orders:8,  status:'review',    dues:41000,   email:'rohit@sudarshan.in',       city:'Pune',     gst:'27OOOOA7890O1ZD' },
  { id:'VND-016', name:'Supreme Industries Ltd',      category:'HDPE Containers',    contact:'Anil Taparia',      phone:'+91 98201 66410', rating:4.5, onTime:91, orders:28, status:'approved',  dues:0,       email:'anil@supreme.in',          city:'Kanpur',   gst:'09PPPCA1234P1ZE' },
  { id:'VND-017', name:'Godrej Industries Ltd',       category:'Vegetable Oils',     contact:'Piramal Godrej',    phone:'+91 99401 88250', rating:4.6, onTime:93, orders:19, status:'approved',  dues:92000,   email:'piramal@godrejind.in',     city:'Mumbai',   gst:'27QQQCA5678Q1ZF' },
  { id:'VND-018', name:'Naturex Specialties India',   category:'Natural Flavours',   contact:'Swati Kulkarni',    phone:'+91 97801 55380', rating:4.3, onTime:87, orders:7,  status:'approved',  dues:0,       email:'swati@naturex.in',         city:'Bangalore',gst:'29RRRCA9012R1ZG' },
]

const SEED_POS = [
  { id:'PO-2026-0850', vendor:'Aashirvaad Mills Ltd',    item:'Refined Wheat Flour 50kg Bags',      qty:'25 MT', value:712500,  raised:'24 Mar', due:'30 Mar', status:'confirmed',  payment:'pending' },
  { id:'PO-2026-0849', vendor:'Tata Salt (TATA Chemicals)',item:'Iodized Salt 25kg Bags',           qty:'8 MT',  value:78400,   raised:'24 Mar', due:'28 Mar', status:'confirmed',  payment:'pending' },
  { id:'PO-2026-0848', vendor:'Amul Dairy (GCMMF)',       item:'SMP Skimmed Milk Powder',           qty:'2 MT',  value:284000,  raised:'23 Mar', due:'27 Mar', status:'in-transit', payment:'pending' },
  { id:'PO-2026-0847', vendor:'Essel Propack Ltd',        item:'Laminated Pouches 100g Biscuit',    qty:'500K pcs', value:485000,raised:'23 Mar', due:'29 Mar', status:'in-transit', payment:'pending' },
  { id:'PO-2026-0846', vendor:'ITC Agri Business',        item:'Potato Flakes Grade A',             qty:'4 MT',  value:268000,  raised:'23 Mar', due:'28 Mar', status:'confirmed',  payment:'pending' },
  { id:'PO-2026-0845', vendor:'Roha Dyechem Pvt Ltd',     item:'Food Colour FD&C Mix Blended',      qty:'200 kg',value:184000,  raised:'23 Mar', due:'30 Mar', status:'draft',      payment:'not-due' },
  { id:'PO-2026-0844', vendor:'Bajaj Sugar Mills',        item:'S30 Grade Sugar 50kg Bags',         qty:'15 MT', value:630000,  raised:'22 Mar', due:'27 Mar', status:'in-transit', payment:'pending' },
  { id:'PO-2026-0843', vendor:'Uflex Ltd',                item:'LDPE Packaging Film 500mm Roll',    qty:'5 MT',  value:710000,  raised:'22 Mar', due:'28 Mar', status:'confirmed',  payment:'pending' },
  { id:'PO-2026-0842', vendor:'Saffola Agro Pvt Ltd',     item:'Refined Palm Oil 15L Jerry Cans',  qty:'10 MT', value:1150000, raised:'21 Mar', due:'26 Mar', status:'in-transit', payment:'pending' },
  { id:'PO-2026-0841', vendor:'Aashirvaad Mills Ltd',     item:'Refined Wheat Flour 50kg — Order 1',qty:'20 MT', value:570000,  raised:'20 Mar', due:'25 Mar', status:'delivered',  payment:'paid'    },
  { id:'PO-2026-0840', vendor:'Barry Callebaut India',    item:'Cocoa Powder Alkalized 25kg',       qty:'1 MT',  value:380000,  raised:'18 Mar', due:'23 Mar', status:'delivered',  payment:'paid'    },
  { id:'PO-2026-0839', vendor:'Devshree Agro Foods',      item:'Alphonso Mango Pulp Grade A',       qty:'3 MT',  value:204000,  raised:'17 Mar', due:'22 Mar', status:'delivered',  payment:'paid'    },
  { id:'PO-2026-0838', vendor:'Kancor Ingredients Ltd',   item:'Turmeric Oleoresin 1L Packs',       qty:'50 kg', value:92000,   raised:'15 Mar', due:'20 Mar', status:'delivered',  payment:'paid'    },
  { id:'PO-2026-0837', vendor:'Supreme Industries Ltd',   item:'HDPE Drums 200L Industrial',        qty:'120 pcs',value:156000,  raised:'14 Mar', due:'19 Mar', status:'delivered',  payment:'paid'    },
  { id:'PO-2026-0836', vendor:'Godrej Industries Ltd',    item:'RBD Palmolein Oil 15L',             qty:'8 MT',  value:872000,  raised:'12 Mar', due:'17 Mar', status:'delivered',  payment:'paid'    },
]

const SEED_RECIPES = [
  { id:'RCP-001', name:'Bourbon Cream Biscuits v3.2',      category:'Biscuits',      version:'v3.2', status:'approved', lastUpdated:'12 Mar 2026', ingredients:8,  yield:'98.2%', line:'Line 1' },
  { id:'RCP-002', name:'Classic Masala Noodles v2.1',      category:'Noodles',       version:'v2.1', status:'approved', lastUpdated:'08 Mar 2026', ingredients:12, yield:'97.8%', line:'Line 2' },
  { id:'RCP-003', name:'Salted Chips Original v4.0',       category:'Chips',         version:'v4.0', status:'review',   lastUpdated:'20 Mar 2026', ingredients:6,  yield:'99.1%', line:'Line 3' },
  { id:'RCP-004', name:'Mango Frooti Concentrate v1.5',    category:'Beverage',      version:'v1.5', status:'approved', lastUpdated:'01 Mar 2026', ingredients:9,  yield:'96.4%', line:'Line 5' },
  { id:'RCP-005', name:'Dark Chocolate Wafer Bar v2.0',    category:'Confectionery', version:'v2.0', status:'draft',    lastUpdated:'22 Mar 2026', ingredients:7,  yield:'97.2%', line:'Line 6' },
  { id:'RCP-006', name:'Tangy Tomato Chips v2.3',          category:'Chips',         version:'v2.3', status:'approved', lastUpdated:'05 Mar 2026', ingredients:8,  yield:'98.8%', line:'Line 3' },
  { id:'RCP-007', name:'Cream & Onion Snack v1.8',         category:'Snacks',        version:'v1.8', status:'approved', lastUpdated:'28 Feb 2026', ingredients:11, yield:'97.4%', line:'Line 7' },
  { id:'RCP-008', name:'Strawberry Jam Biscuit v1.4',      category:'Biscuits',      version:'v1.4', status:'approved', lastUpdated:'14 Feb 2026', ingredients:9,  yield:'98.0%', line:'Line 1' },
  { id:'RCP-009', name:'Chilli Lime Rice Cracker v3.0',    category:'Snacks',        version:'v3.0', status:'review',   lastUpdated:'18 Mar 2026', ingredients:10, yield:'98.5%', line:'Line 7' },
  { id:'RCP-010', name:'Orange Squash Concentrate v2.2',   category:'Beverage',      version:'v2.2', status:'approved', lastUpdated:'10 Mar 2026', ingredients:8,  yield:'96.8%', line:'Line 5' },
  { id:'RCP-011', name:'Multigrain Digestive v1.1',        category:'Biscuits',      version:'v1.1', status:'draft',    lastUpdated:'23 Mar 2026', ingredients:14, yield:'97.6%', line:'Line 1' },
  { id:'RCP-012', name:'Instant Veg Hakka Noodles v1.0',   category:'Noodles',       version:'v1.0', status:'approved', lastUpdated:'20 Feb 2026', ingredients:10, yield:'98.2%', line:'Line 2' },
]

const SEED_WOS = [
  { id:'WO-2026-1145', asset:'Blending Tank BT1',    type:'Breakdown',  priority:'critical', desc:'Motor bearing failure — complete shutdown. Replace bearing and motor coupling assembly.', status:'open',        tech:'Suresh P',  raised:'24 Mar 11:20', eta:'25 Mar 08:00', cost:64000 },
  { id:'WO-2026-1144', asset:'Frying Unit FU-1',     type:'Corrective', priority:'high',     desc:'Temperature controller calibration drift — oil temp reading +8°C off actual value.',     status:'in-progress', tech:'Deepak S',  raised:'24 Mar 09:45', eta:'24 Mar 17:00', cost:18000 },
  { id:'WO-2026-1143', asset:'Conveyor Belt CB4',    type:'Breakdown',  priority:'critical', desc:'Belt mistrack & edge damage — temp fix applied, awaiting replacement belt.',             status:'in-progress', tech:'Ramesh K',  raised:'24 Mar 06:42', eta:'24 Mar 16:00', cost:52000 },
  { id:'WO-2026-1142', asset:'Packaging M-4A',       type:'Corrective', priority:'high',     desc:'Seal jaw misalignment causing 3.2% packaging defect rate. Jaw reset & torque check.',   status:'open',        tech:'Anita M',   raised:'23 Mar 14:20', eta:'24 Mar 18:00', cost:12000 },
  { id:'WO-2026-1141', asset:'Extruder EX-2',        type:'Preventive', priority:'medium',   desc:'Monthly screw wear measurement, lubrication, and barrel inspection as per schedule.',    status:'scheduled',   tech:'Suresh P',  raised:'22 Mar',       eta:'28 Mar 10:00', cost:8000  },
  { id:'WO-2026-1140', asset:'Sealing Unit S6',      type:'Inspection', priority:'low',      desc:'Post-PM inspection: verify seal wire tension, heater element resistance and coating.',   status:'scheduled',   tech:'Anita M',   raised:'22 Mar',       eta:'02 Apr 09:00', cost:4000  },
  { id:'WO-2026-1139', asset:'Filling Station F5',   type:'Preventive', priority:'medium',   desc:'Nozzle cleaning, flow meter calibration, and valve seat replacement.',                  status:'open',        tech:'Ramesh K',  raised:'23 Mar',       eta:'25 Mar 12:00', cost:7500  },
  { id:'WO-2026-1138', asset:'Conveyor Belt CB7',    type:'Inspection', priority:'low',      desc:'Routine belt inspection and lubrication of idler rollers and drive mechanism.',         status:'completed',   tech:'Deepak S',  raised:'20 Mar',       eta:'Done 21 Mar',  cost:3200  },
  { id:'WO-2026-1137', asset:'Mixing Unit M1',       type:'Preventive', priority:'medium',   desc:'Gearbox oil level check, filter change, and shaft seal inspection.',                    status:'completed',   tech:'Suresh P',  raised:'18 Mar',       eta:'Done 19 Mar',  cost:5500  },
  { id:'WO-2026-1136', asset:'Frying Unit FU-1',     type:'Corrective', priority:'high',     desc:'Oil spillage from discharge valve — valve seat replacement and system flush.',          status:'completed',   tech:'Ramesh K',  raised:'15 Mar',       eta:'Done 16 Mar',  cost:22000 },
]

const SEED_SPARE = [
  { id:'SP-001', name:'Conveyor Belt 500mm×10m',        machine:'CB4, CB7',          stock:2,  minStock:2,  unit:'rolls', cost:24000, status:'low',      supplier:'Bando India Pvt Ltd'      },
  { id:'SP-002', name:'Extruder Screw SS316 L/D=20',    machine:'EX-2',              stock:1,  minStock:1,  unit:'pcs',   cost:84000, status:'low',      supplier:'KRS Engineering'          },
  { id:'SP-003', name:'Seal Jaw Set 300°C Teflon',      machine:'PM-5, S6',          stock:4,  minStock:2,  unit:'sets',  cost:18000, status:'good',     supplier:'Bosch Rexroth India'      },
  { id:'SP-004', name:'Bearing 6205-2RS SKF',           machine:'Multiple',          stock:24, minStock:10, unit:'pcs',   cost:480,   status:'good',     supplier:'SKF India Ltd'            },
  { id:'SP-005', name:'V-Belt A-68 Fenner',             machine:'Multiple',          stock:8,  minStock:6,  unit:'pcs',   cost:1200,  status:'good',     supplier:'Fenner India'             },
  { id:'SP-006', name:'Heating Element 3kW Nickel',     machine:'S6, FU-1',          stock:0,  minStock:2,  unit:'pcs',   cost:8400,  status:'critical', supplier:'Cressall Resistors'       },
  { id:'SP-007', name:'Gear Oil GL-5 SAE90 20L',        machine:'All gearboxes',     stock:6,  minStock:4,  unit:'cans',  cost:3600,  status:'good',     supplier:'Castrol India'            },
  { id:'SP-008', name:'O-Ring Set PTFE 50pcs',          machine:'FU-1, M1',          stock:120,minStock:50, unit:'pcs',   cost:45,    status:'good',     supplier:'Parker Hannifin India'    },
  { id:'SP-009', name:'Proximity Sensor NPN 24VDC',     machine:'Multiple lines',    stock:3,  minStock:5,  unit:'pcs',   cost:3200,  status:'low',      supplier:'Pepperl+Fuchs India'      },
  { id:'SP-010', name:'PLC I/O Card Siemens ET200',     machine:'Control Panels',    stock:1,  minStock:1,  unit:'pcs',   cost:42000, status:'low',      supplier:'Siemens India Ltd'        },
  { id:'SP-011', name:'Drive Belt 5M-1000 HTD',         machine:'Line 3 Extruder',   stock:5,  minStock:3,  unit:'pcs',   cost:2800,  status:'good',     supplier:'Gates India'              },
  { id:'SP-012', name:'Pressure Relief Valve 6 bar',    machine:'Boiler, FU-1',      stock:3,  minStock:2,  unit:'pcs',   cost:6400,  status:'good',     supplier:'Forbes Marshall'          },
  { id:'SP-013', name:'Temperature Sensor PT100',       machine:'FU-1, Cold Storage',stock:8,  minStock:4,  unit:'pcs',   cost:1850,  status:'good',     supplier:'WIKA India'               },
  { id:'SP-014', name:'Pneumatic Cylinder Ø80mm 200mm', machine:'Packaging lines',   stock:2,  minStock:2,  unit:'pcs',   cost:9200,  status:'low',      supplier:'SMC Pneumatics India'     },
  { id:'SP-015', name:'Carbon Brush Motor 20×12×5mm',   machine:'Multiple motors',   stock:40, minStock:20, unit:'pcs',   cost:220,   status:'good',     supplier:'Mersen India'             },
  { id:'SP-016', name:'Hydraulic Oil ISO 46 20L',       machine:'Hydraulic systems', stock:10, minStock:6,  unit:'cans',  cost:2800,  status:'good',     supplier:'Bharat Petroleum'         },
  { id:'SP-017', name:'Safety Relay Pilz 24VDC',        machine:'Emergency stops',   stock:0,  minStock:2,  unit:'pcs',   cost:14500, status:'critical', supplier:'Pilz India'               },
  { id:'SP-018', name:'PTFE Food Grade Tape 25mm',      machine:'Sealing stations',  stock:18, minStock:10, unit:'rolls', cost:380,   status:'good',     supplier:'3M India'                 },
]

const SEED_PM = [
  { id:'PM-001', asset:'Conveyor Belt CB4',  task:'Belt tension & alignment check',       freq:'Weekly',    lastDone:'17 Mar', nextDue:'24 Mar', status:'overdue',   tech:'Ramesh K',  estTime:1.5 },
  { id:'PM-002', asset:'Extruder EX-2',      task:'Screw wear measurement & lubrication', freq:'Monthly',   lastDone:'28 Feb', nextDue:'28 Mar', status:'due-soon',  tech:'Suresh P',  estTime:3.0 },
  { id:'PM-003', asset:'Packaging M-5',      task:'Seal jaw calibration & gap check',     freq:'Bi-weekly', lastDone:'10 Mar', nextDue:'24 Mar', status:'due-soon',  tech:'Anita M',   estTime:2.0 },
  { id:'PM-004', asset:'Frying Unit FU-1',   task:'Oil drain, filter & system clean',     freq:'Weekly',    lastDone:'17 Mar', nextDue:'24 Mar', status:'due-today', tech:'Ramesh K',  estTime:2.5 },
  { id:'PM-005', asset:'Mixing Unit M1',     task:'Gearbox oil level & filter change',    freq:'Monthly',   lastDone:'01 Mar', nextDue:'01 Apr', status:'scheduled', tech:'Suresh P',  estTime:1.5 },
  { id:'PM-006', asset:'Sealing Unit S6',    task:'Heating element & wire inspection',    freq:'Monthly',   lastDone:'05 Mar', nextDue:'05 Apr', status:'scheduled', tech:'Anita M',   estTime:2.0 },
  { id:'PM-007', asset:'Blending Tank BT1',  task:'Agitator seal & bearing inspection',   freq:'Quarterly', lastDone:'01 Jan', nextDue:'01 Apr', status:'due-soon',  tech:'Deepak S',  estTime:4.0 },
  { id:'PM-008', asset:'Conveyor Belt CB7',  task:'Idler roller lubrication & alignment', freq:'Weekly',    lastDone:'18 Mar', nextDue:'25 Mar', status:'scheduled', tech:'Ramesh K',  estTime:1.0 },
  { id:'PM-009', asset:'Filling Station F5', task:'Nozzle clean & flow calibration',      freq:'Weekly',    lastDone:'17 Mar', nextDue:'24 Mar', status:'overdue',   tech:'Deepak S',  estTime:1.5 },
  { id:'PM-010', asset:'Frying Unit FU-1',   task:'Heat exchanger tube inspection',       freq:'Quarterly', lastDone:'15 Dec', nextDue:'15 Mar', status:'overdue',   tech:'Suresh P',  estTime:6.0 },
  { id:'PM-011', asset:'All compressors',    task:'Compressor oil & filter change',       freq:'Monthly',   lastDone:'01 Mar', nextDue:'01 Apr', status:'scheduled', tech:'Deepak S',  estTime:2.0 },
  { id:'PM-012', asset:'Boiler System',      task:'Safety valve test & scale removal',    freq:'Monthly',   lastDone:'28 Feb', nextDue:'28 Mar', status:'due-soon',  tech:'Suresh P',  estTime:5.0 },
]

const SEED_USERS = [
  { id:'USR-001', name:'Arjun Mehta',        email:'fmcg@gmail.com',           role:'Plant Manager',           dept:'Management',  status:'active',   last:'25 Mar 2026, 09:14 AM', loginCount:284 },
  { id:'USR-002', name:'Pooja Sharma',       email:'pooja@fmcgcorp.in',        role:'QC Manager',              dept:'Quality',     status:'active',   last:'25 Mar 2026, 08:42 AM', loginCount:196 },
  { id:'USR-003', name:'Suresh Patel',       email:'suresh@fmcgcorp.in',       role:'Production Supervisor',   dept:'Production',  status:'active',   last:'25 Mar 2026, 07:30 AM', loginCount:412 },
  { id:'USR-004', name:'Anita Mehta',        email:'anita@fmcgcorp.in',        role:'Maintenance Engineer',    dept:'Maintenance', status:'active',   last:'24 Mar 2026, 11:00 PM', loginCount:288 },
  { id:'USR-005', name:'Ravi Kumar',         email:'ravi@fmcgcorp.in',         role:'Line Operator',           dept:'Production',  status:'active',   last:'25 Mar 2026, 06:05 AM', loginCount:520 },
  { id:'USR-006', name:'Deepa Nair',         email:'deepa@fmcgcorp.in',        role:'QC Analyst',              dept:'Quality',     status:'active',   last:'25 Mar 2026, 08:18 AM', loginCount:312 },
  { id:'USR-007', name:'Ramesh Yadav',       email:'ramesh@fmcgcorp.in',       role:'Dispatch Coordinator',    dept:'Dispatch',    status:'active',   last:'25 Mar 2026, 07:45 AM', loginCount:168 },
  { id:'USR-008', name:'Priya Agarwal',      email:'priya@fmcgcorp.in',        role:'Stores Manager',          dept:'Stores',      status:'active',   last:'25 Mar 2026, 09:02 AM', loginCount:144 },
  { id:'USR-009', name:'Vikram Singh',       email:'vikram@fmcgcorp.in',       role:'Production Supervisor',   dept:'Production',  status:'active',   last:'24 Mar 2026, 10:30 PM', loginCount:386 },
  { id:'USR-010', name:'Sunita Meena',       email:'sunita@fmcgcorp.in',       role:'Packaging Supervisor',    dept:'Production',  status:'active',   last:'25 Mar 2026, 06:22 AM', loginCount:248 },
  { id:'USR-011', name:'Deepak Kumar',       email:'deepak@fmcgcorp.in',       role:'Maintenance Engineer',    dept:'Maintenance', status:'active',   last:'25 Mar 2026, 07:00 AM', loginCount:194 },
  { id:'USR-012', name:'Kavita Sharma',      email:'kavita@fmcgcorp.in',       role:'HR Manager',              dept:'HR',          status:'active',   last:'24 Mar 2026, 05:30 PM', loginCount:88  },
  { id:'USR-013', name:'Rohit Joshi',        email:'rohit@fmcgcorp.in',        role:'Finance Viewer',          dept:'Finance',     status:'active',   last:'24 Mar 2026, 03:15 PM', loginCount:62  },
  { id:'USR-014', name:'Anil Gupta',         email:'anil@fmcgcorp.in',         role:'Line Operator',           dept:'Production',  status:'active',   last:'25 Mar 2026, 06:08 AM', loginCount:440 },
  { id:'USR-015', name:'Demo Visitor',       email:'demo@ifactory.ai',         role:'Viewer / Guest',          dept:'Guest',       status:'inactive', last:'10 Mar 2026, 02:00 PM', loginCount:14  },
]

const SEED_ROLES = [
  { id:'ROLE-001', role:'Plant Manager',          users:1,  modules:'All modules — full portal access',               level:'Full access'     },
  { id:'ROLE-002', role:'QC Manager',             users:2,  modules:'Quality, Production, Inventory, Compliance',     level:'Read + Write'    },
  { id:'ROLE-003', role:'Production Supervisor',  users:4,  modules:'Production, Inventory, Workforce, Maintenance',  level:'Read + Write'    },
  { id:'ROLE-004', role:'Maintenance Engineer',   users:6,  modules:'Maintenance, Asset Health, Work Orders',         level:'Read + Write'    },
  { id:'ROLE-005', role:'Line Operator',          users:48, modules:'Production (assigned line only)',                 level:'Read only + Log' },
  { id:'ROLE-006', role:'Dispatch Coordinator',   users:3,  modules:'Supply Chain, Dispatch, Fleet GPS',              level:'Read + Write'    },
  { id:'ROLE-007', role:'Stores Manager',         users:2,  modules:'Inventory, Purchase Orders, Spare Parts',        level:'Read + Write'    },
  { id:'ROLE-008', role:'QC Analyst',             users:4,  modules:'Quality, Batch QC, AI Vision',                   level:'Read + Write'    },
  { id:'ROLE-009', role:'Finance Viewer',         users:2,  modules:'Analytics, Cost Reports, ERP Integration',       level:'Read only'       },
  { id:'ROLE-010', role:'HR Manager',             users:1,  modules:'Workforce, Attendance, Performance',             level:'Read + Write'    },
  { id:'ROLE-011', role:'Packaging Supervisor',   users:3,  modules:'Production (packaging), Inventory',             level:'Read + Write'    },
  { id:'ROLE-012', role:'Viewer / Guest',         users:5,  modules:'Dashboard overview only (limited)',              level:'Read only'       },
]


// ─── Provider ─────────────────────────────────────────────────────────────────
export function FmcgLiveDataProvider({ children }) {
  // Mutable user records stored separately so tick doesn't overwrite them
  const userRecordsRef = useRef({
    batches:      [],
    vendors:      SEED_VENDORS,
    purchaseOrders: SEED_POS,
    recipes:      SEED_RECIPES,
    workOrders:   SEED_WOS,
    spareParts:   SEED_SPARE,
    pmSchedules:  SEED_PM,
    users:        SEED_USERS,
    roles:        SEED_ROLES,
  })
  const [data, setData] = useState(() => generateSnapshot(null, userRecordsRef.current))

  useEffect(() => {
    setData(generateSnapshot(null, userRecordsRef.current))
    const id = setInterval(() => {
      setData(prev => generateSnapshot(prev, userRecordsRef.current))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // ── Mutation helpers ────────────────────────────────────────────────────────
  const mutate = (key, updater) => {
    userRecordsRef.current = {
      ...userRecordsRef.current,
      [key]: updater(userRecordsRef.current[key]),
    }
    // Immediate re-render with new record visible
    setData(prev => ({ ...prev, [key]: userRecordsRef.current[key],
      batches: key === 'batches'
        ? genBatches(prev.batches, userRecordsRef.current.batches)
        : prev.batches,
    }))
  }

  const actions = {
    // Batches
    addBatch: (form) => {
      const rec = {
        id: `BT-2026-${String(Date.now()).slice(-4)}`,
        sku: form.sku, line: form.line, qty: parseInt(form.qty),
        done: 0, pct: 0, status: 'running',
        qc: 'pending', yield: 98.0, startTime: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
        _user: true,
      }
      mutate('batches', list => [rec, ...list])
    },

    // Vendors
    addVendor: (form) => {
      const rec = {
        id: uid('VND'), name: form.name, category: form.category,
        contact: form.contact, phone: form.phone,
        rating: parseFloat(form.rating) || 4.0,
        onTime: parseInt(form.onTime) || 90,
        orders: 0, status: form.status || 'approved', dues: 0, _user: true,
      }
      mutate('vendors', list => [rec, ...list])
    },
    updateVendor: (id, patch) => mutate('vendors', list => list.map(v => v.id === id ? {...v, ...patch} : v)),
    deleteVendor: (id) => mutate('vendors', list => list.filter(v => v.id !== id)),

    // Purchase Orders
    addPO: (form) => {
      const rec = {
        id: `PO-2026-${String(Date.now()).slice(-4)}`,
        vendor: form.vendor, item: form.item, qty: form.qty,
        value: parseInt(form.value) || 0,
        raised: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}),
        due: form.due, status: 'draft', payment: 'not-due', _user: true,
      }
      mutate('purchaseOrders', list => [rec, ...list])
    },
    updatePO: (id, patch) => mutate('purchaseOrders', list => list.map(p => p.id === id ? {...p, ...patch} : p)),

    // Recipes
    addRecipe: (form) => {
      const rec = {
        id: uid('RCP'), name: form.name, category: form.category,
        version: form.version || 'v1.0',
        status: 'draft',
        lastUpdated: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),
        ingredients: parseInt(form.ingredients) || 1, _user: true,
      }
      mutate('recipes', list => [rec, ...list])
    },
    updateRecipe: (id, patch) => mutate('recipes', list => list.map(r => r.id === id ? {...r, ...patch} : r)),

    // Work Orders
    addWorkOrder: (form) => {
      const rec = {
        id: `WO-2026-${String(Date.now()).slice(-4)}`,
        asset: form.asset, type: form.type || 'Corrective',
        priority: form.priority || 'medium',
        desc: form.desc,
        status: 'open', tech: form.tech,
        raised: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) + ' ' + new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
        eta: form.eta, cost: parseInt(form.cost) || 0, _user: true,
      }
      mutate('workOrders', list => [rec, ...list])
    },
    updateWO: (id, patch) => mutate('workOrders', list => list.map(w => w.id === id ? {...w, ...patch} : w)),

    // Spare Parts
    addSparePart: (form) => {
      const rec = {
        id: uid('SP'), name: form.name, machine: form.machine,
        stock: parseInt(form.stock) || 0, minStock: parseInt(form.minStock) || 1,
        unit: form.unit || 'pcs', cost: parseInt(form.cost) || 0,
        status: parseInt(form.stock) === 0 ? 'critical' : parseInt(form.stock) <= parseInt(form.minStock) ? 'low' : 'good',
        _user: true,
      }
      mutate('spareParts', list => [rec, ...list])
    },
    updateSparePart: (id, patch) => mutate('spareParts', list => list.map(p => p.id === id ? {...p, ...patch} : p)),

    // PM Schedules
    addPMSchedule: (form) => {
      const rec = {
        id: uid('PM'), asset: form.asset, task: form.task,
        freq: form.freq || 'Monthly',
        lastDone: form.lastDone || '—',
        nextDue: form.nextDue,
        status: 'scheduled', tech: form.tech, _user: true,
      }
      mutate('pmSchedules', list => [rec, ...list])
    },

    // Users
    addUser: (form) => {
      const rec = {
        id: uid('USR'), name: form.name, email: form.email,
        role: form.role, dept: form.dept, status: 'active',
        last: 'Just now', _user: true,
      }
      mutate('users', list => [rec, ...list])
    },
    updateUser: (id, patch) => mutate('users', list => list.map(u => u.id === id ? {...u, ...patch} : u)),

    // Roles
    addRole: (form) => {
      const rec = {
        id: uid('ROLE'), role: form.role, users: 0,
        modules: form.modules, level: form.level, _user: true,
      }
      mutate('roles', list => [rec, ...list])
    },
  }

  return (
    <LiveDataContext.Provider value={{ ...data, actions }}>
      {children}
    </LiveDataContext.Provider>
  )
}

export function useLiveData() {
  const ctx = useContext(LiveDataContext)
  if (!ctx) throw new Error('useLiveData must be used inside FmcgLiveDataProvider')
  return ctx
}
