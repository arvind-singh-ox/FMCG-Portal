'use client'

const ACCENT = '#605dba'

const zones = [
  { name: 'Preheater', temp: 340, status: 'normal', health: 94 },
  { name: 'Calciner', temp: 870, status: 'normal', health: 91 },
  { name: 'Burning Zone', temp: 1450, status: 'warning', health: 78 },
  { name: 'Transition Zone', temp: 1280, status: 'normal', health: 88 },
  { name: 'Cooling Zone', temp: 980, status: 'normal', health: 95 },
  { name: 'Clinker Cooler', temp: 120, status: 'normal', health: 92 },
]

const sensors = [
  { label: 'Kiln Shell Temp', value: '285°C', status: 'normal' },
  { label: 'Kiln Speed', value: '3.8 RPM', status: 'normal' },
  { label: 'Kiln Torque', value: '72%', status: 'normal' },
  { label: 'Draft Pressure', value: '-2.4 mbar', status: 'normal' },
  { label: 'Clinker Free Lime', value: '1.2%', status: 'normal' },
  { label: 'NOx Level', value: '480 ppm', status: 'warning' },
  { label: 'Bearing Vibration', value: '4.2 mm/s', status: 'warning' },
  { label: 'Motor Current', value: '245 A', status: 'normal' },
]

function KilnHealth() {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Kiln Health Monitoring</h3>
          <p style={styles.sub}>Real-time kiln zone temperatures and sensor readings</p>
        </div>
        <span style={styles.statusBadge}>
          <span style={styles.statusDot} /> Kiln Running
        </span>
      </div>

      {/* Zone Heatmap */}
      <div style={styles.zoneSection}>
        <div style={styles.zoneSectionLabel}>Temperature Zones</div>
        <div style={styles.zones}>
          {zones.map((z) => (
            <div key={z.name} style={styles.zoneCard}>
              <div style={styles.zoneHeader}>
                <span style={styles.zoneName}>{z.name}</span>
                <span style={{ ...styles.zoneStatus, color: z.status === 'warning' ? '#f59e0b' : '#16a34a' }}>
                  {z.status === 'warning' ? 'Attention' : 'Normal'}
                </span>
              </div>
              <div style={styles.zoneTemp}>{z.temp}°C</div>
              <div style={styles.healthBar}>
                <div style={{
                  ...styles.healthFill,
                  width: `${z.health}%`,
                  background: z.health > 85 ? ACCENT : z.health > 70 ? '#f59e0b' : '#ef4444',
                }} />
              </div>
              <div style={styles.healthLabel}>Health: {z.health}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Grid */}
      <div style={styles.sensorSection}>
        <div style={styles.zoneSectionLabel}>Live Sensor Readings</div>
        <div style={styles.sensorGrid}>
          {sensors.map((s) => (
            <div key={s.label} style={styles.sensorItem}>
              <div style={styles.sensorLabel}>{s.label}</div>
              <div style={styles.sensorValue}>
                {s.value}
                {s.status === 'warning' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" style={{ marginLeft: '6px' }}>
                    <path d="M12 2L2 22h20L12 2zm0 6v6m0 2v2" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 },
  sub: { margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, color: '#16a34a' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  zoneSection: { marginBottom: '20px' },
  zoneSectionLabel: { fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '10px' },
  zones: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' },
  zoneCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e8ecf1' },
  zoneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  zoneName: { fontSize: '11px', fontWeight: 600, color: '#475569' },
  zoneStatus: { fontSize: '9px', fontWeight: 600 },
  zoneTemp: { fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' },
  healthBar: { height: '4px', background: '#e8ecf1', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' },
  healthFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s' },
  healthLabel: { fontSize: '10px', color: '#94a3b8' },
  sensorSection: {},
  sensorGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  sensorItem: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e8ecf1' },
  sensorLabel: { fontSize: '11px', color: '#94a3b8', marginBottom: '4px' },
  sensorValue: { fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center' },
}

export default KilnHealth
