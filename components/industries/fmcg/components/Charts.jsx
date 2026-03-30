'use client'
// ─── Shared chart/viz components for FMCG portal ─────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'

const ACCENT = '#1a9b6c'

// ─── Animated number ticker ───────────────────────────────────────────────────
export function AnimNumber({ value, decimals = 0, prefix = '', suffix = '', className, style }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const raf  = useRef(null)

  useEffect(() => {
    const from = prev.current
    const to = typeof value === 'number' ? value : parseFloat(value) || 0
    prev.current = to
    if (Math.abs(from - to) < 0.001) return
    cancelAnimationFrame(raf.current)
    const dur = 600
    const t0  = performance.now()
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      setDisplay(from + (to - from) * ease(p))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value])

  const fmt = typeof display === 'number'
    ? (decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString())
    : display

  return <span className={className} style={style}>{prefix}{fmt}{suffix}</span>
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
export function Sparkline({ data = [], color = ACCENT, height = 48, filled = true, strokeWidth = 2 }) {
  const ref = useRef(null)
  const [w, setW] = useState(200)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  if (!data || data.length < 2) return <div ref={ref} style={{ width: '100%', height }} />
  const max = Math.max(...data), min = Math.min(...data)
  const rng = max - min || 1
  const pad = 4
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / rng) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const gid = `sg${color.replace('#', '')}${Math.random().toString(36).slice(2,6)}`
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {filled && <polygon points={`${pad},${height} ${pts} ${w - pad},${height}`} fill={`url(#${gid})`} />}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
        {/* Last point dot */}
        {data.length > 0 && (() => {
          const lastPt = pts.split(' ').pop().split(',')
          return <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
        })()}
      </svg>
    </div>
  )
}

// ─── Donut / Ring gauge ───────────────────────────────────────────────────────
export function RingGauge({ value, max = 100, size = 120, color = ACCENT, label, sublabel, thickness = 10 }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80)
    return () => clearTimeout(t)
  }, [value])

  const pct    = Math.min(animated / max, 1)
  const r      = (size - thickness) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ * (1 - pct * 0.75)  // 0.75 = 270° arc
  const startAngle = -225 * (Math.PI / 180) // starts at bottom-left

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(0deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#f1f5f9" strokeWidth={thickness}
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          transform={`rotate(-225 ${size/2} ${size/2})`}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={`${circ * 0.75 * pct} ${circ * (1 - 0.75 * pct)}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          transform={`rotate(-225 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        paddingTop: size * 0.1
      }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
          {typeof value === 'number' ? (value >= 10 ? Math.round(value) : value.toFixed(1)) : value}
        </div>
        {label    && <div style={{ fontSize: size * 0.1,  color: '#64748b', fontWeight: 600, marginTop: 2 }}>{label}</div>}
        {sublabel && <div style={{ fontSize: size * 0.09, color: '#94a3b8', marginTop: 1 }}>{sublabel}</div>}
      </div>
    </div>
  )
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────
export function HBarChart({ data, height = 200, color = ACCENT, showValues = true }) {
  // data: [{label, value}]
  const max = Math.max(...data.map(d => d.value)) || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>{d.label}</span>
            {showValues && <span style={{ color: '#1e293b', fontWeight: 700 }}>{d.value.toLocaleString()}</span>}
          </div>
          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(d.value / max) * 100}%`,
              background: d.color || color,
              borderRadius: 4,
              transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SVG Column bar chart ─────────────────────────────────────────────────────
export function BarChart({
  data, // [{label, value, color?}]
  height = 180, barColor = ACCENT, animate = true,
  showGrid = true, formatVal = v => v.toLocaleString()
}) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)
  const [w, setW] = useState(400)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [])

  if (!data?.length) return null
  const padL = 36, padR = 8, padT = 12, padB = 28
  const max   = Math.max(...data.map(d => d.value)) * 1.1 || 1
  const innerW = w - padL - padR
  const innerH = height - padT - padB
  const barW   = Math.max(4, (innerW / data.length) * 0.6)
  const gap    = innerW / data.length

  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height}>
        {/* Grid */}
        {showGrid && gridLines.map(pct => {
          const y = padT + innerH * (1 - pct)
          return (
            <g key={pct}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
                {pct === 0 ? '0' : formatVal(Math.round(max * pct))}
              </text>
            </g>
          )
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x    = padL + gap * i + (gap - barW) / 2
          const full = innerH * (d.value / max)
          const barH = animated ? full : 0
          const y    = padT + innerH - barH
          const col  = d.color || barColor
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx="3" ry="3" fill={col}
                style={{ transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms, y 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms` }}
              />
              <text x={x + barW / 2} y={height - padB + 14} textAnchor="middle" fontSize="10" fill="#64748b">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Multi-line SVG chart ─────────────────────────────────────────────────────
export function LineChart({ series, labels, height = 200, showDots = true }) {
  // series: [{name, data, color}], labels: string[]
  const ref = useRef(null)
  const [w, setW] = useState(500)
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [])

  if (!series?.length) return null
  const allVals = series.flatMap(s => s.data)
  const max = Math.max(...allVals) * 1.1 || 1
  const min = Math.min(...allVals, 0)
  const rng = max - min || 1

  const padL = 40, padR = 12, padT = 12, padB = 24
  const iW = w - padL - padR
  const iH = height - padT - padB
  const n  = series[0]?.data?.length || 1

  const toX = (i) => padL + (i / (n - 1)) * iW
  const toY = (v) => padT + (1 - (v - min) / rng) * iH

  const gridVals = [min, min + rng * 0.25, min + rng * 0.5, min + rng * 0.75, max / 1.1]

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`lcg${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {/* Grid */}
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={toY(v)} x2={w - padR} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
              {Math.round(v).toLocaleString()}
            </text>
          </g>
        ))}
        {/* Label X */}
        {labels?.map((l, i) => (
          <text key={i} x={toX(i)} y={height - padB + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{l}</text>
        ))}
        {/* Series */}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
          const polyPts = `${padL},${padT + iH} ${pts} ${toX(s.data.length - 1)},${padT + iH}`
          return (
            <g key={si}>
              <polygon points={polyPts} fill={`url(#lcg${si})`} />
              <polyline
                points={pts} fill="none"
                stroke={s.color} strokeWidth="2.5"
                strokeLinejoin="round" strokeLinecap="round"
                strokeDasharray={animated ? 'none' : '0 9999'}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              {showDots && s.data.map((v, i) => (
                <circle
                  key={i} cx={toX(i)} cy={toY(v)} r="3"
                  fill={s.color}
                  style={{ opacity: animated ? 1 : 0, transition: `opacity 0.3s ${i * 80}ms` }}
                />
              ))}
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
        {series.map((s, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 12, height: 3, background: s.color, borderRadius: 2, display: 'inline-block' }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Donut pie chart ──────────────────────────────────────────────────────────
export function DonutChart({ segments, size = 160, thickness = 28, centerLabel, centerValue }) {
  // segments: [{label, value, color}]
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t) }, [])

  const total = segments.reduce((s, d) => s + d.value, 0) || 1
  const r = (size - thickness) / 2
  const circ = 2 * Math.PI * r
  let cumPct = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {segments.map((seg, i) => {
            const pct = seg.value / total
            const dash = animated ? circ * pct * 0.95 : 0
            const gap  = circ - dash
            const offset = circ * (1 - cumPct) - circ * pct
            cumPct += pct
            return (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${animated ? circ * pct * 0.94 : 0} ${circ}`}
                strokeDashoffset={-(circ * (cumPct - pct))}
                strokeLinecap="butt"
                style={{ transition: `stroke-dasharray 0.8s ease ${i * 100}ms` }}
              />
            )
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {centerValue && <div style={{ fontSize: size * 0.18, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{centerValue}</div>}
            {centerLabel && <div style={{ fontSize: size * 0.1, color: '#64748b' }}>{centerLabel}</div>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginLeft: 'auto' }}>
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Heat strip (for shift patterns, temp history) ────────────────────────────
export function HeatStrip({ values, colorScale, label, height = 28 }) {
  // values: number[], colorScale: (v) => string
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</div>}
      <div style={{ display: 'flex', gap: 2, height }}>
        {values.map((v, i) => (
          <div
            key={i}
            title={`${v}`}
            style={{
              flex: 1, borderRadius: 3,
              background: colorScale(v),
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Live pulse indicator ─────────────────────────────────────────────────────
export function LivePulse({ color = '#10b981', label = 'Live', size = 8 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <style>{`@keyframes livering{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.5);opacity:0}}`}</style>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'livering 1.5s ease-out infinite' }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </span>
  )
}

// ─── Trend chip ───────────────────────────────────────────────────────────────
export function TrendChip({ value, suffix = '%', up, neutral }) {
  const isUp  = up !== undefined ? up : parseFloat(value) > 0
  const color = neutral ? '#64748b' : isUp ? '#10b981' : '#ef4444'
  const bg    = neutral ? '#f1f5f9' : isUp ? '#f0fdf4' : '#fef2f2'
  const arrow = neutral ? '—' : isUp ? '▲' : '▼'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 20 }}>
      {arrow} {value}{suffix}
    </span>
  )
}

// ─── Animated progress bar ────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = ACCENT, height = 8, showLabel = false, label }) {
  const [pct, setPct] = useState(0)
  useEffect(() => { const t = setTimeout(() => setPct(Math.min((value / max) * 100, 100)), 100); return () => clearTimeout(t) }, [value, max])
  return (
    <div>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
          {label && <span style={{ color: '#64748b' }}>{label}</span>}
          {showLabel && <span style={{ fontWeight: 700, color: '#1e293b' }}>{value.toFixed(1)}%</span>}
        </div>
      )}
      <div style={{ height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: height / 2,
          transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}

// ─── Stacked bar for OEE breakdown ───────────────────────────────────────────
export function StackedBar({ segments, height = 24 }) {
  // segments: [{label, value, color}]
  return (
    <div style={{ height, display: 'flex', borderRadius: height / 2, overflow: 'hidden', gap: 2 }}>
      {segments.map((s, i) => (
        <div
          key={i}
          title={`${s.label}: ${s.value}%`}
          style={{
            flex: s.value,
            background: s.color,
            transition: 'flex 0.8s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {s.value > 10 && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', opacity: 0.9 }}>{s.value}%</span>}
        </div>
      ))}
    </div>
  )
}
