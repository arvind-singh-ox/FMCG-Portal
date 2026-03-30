'use client'

import { useParams } from 'next/navigation'
import OverviewPage from '@/components/industries/steel-plant/pages/OverviewPage'
import RealTimeKPIs from '@/components/industries/steel-plant/pages/RealTimeKPIs'
import ProductionScheduling from '@/components/industries/steel-plant/pages/ProductionScheduling'
import AlertsNotifications from '@/components/industries/steel-plant/pages/AlertsNotifications'
import ScrapToRebar from '@/components/industries/steel-plant/pages/ScrapToRebar'
import BlastFurnaceOptimization from '@/components/industries/steel-plant/pages/BlastFurnaceOptimization'
import RawMaterial from '@/components/industries/steel-plant/pages/RawMaterial'
import QualityPrediction from '@/components/industries/steel-plant/pages/QualityPrediction'
import ConveyorHealth from '@/components/industries/steel-plant/pages/ConveyorHealth'
import EmissionMonitoring from '@/components/industries/steel-plant/pages/EmissionMonitoring'
import InventoryLogistics from '@/components/industries/steel-plant/pages/InventoryLogistics'
import EnergyOptimization from '@/components/industries/steel-plant/pages/EnergyOptimization'
import SmartSensors from '@/components/industries/steel-plant/pages/SmartSensors'
import AssetHealth from '@/components/industries/steel-plant/pages/AssetHealth'
import MaintenanceScheduling from '@/components/industries/steel-plant/pages/MaintenanceScheduling'
import DigitalTwin3D from '@/components/industries/steel-plant/pages/DigitalTwin3D'
import PredictiveProcess from '@/components/industries/steel-plant/pages/PredictiveProcess'
import EfficiencyOptimization from '@/components/industries/steel-plant/pages/EfficiencyOptimization'
import EnvironmentalDashboard from '@/components/industries/steel-plant/pages/EnvironmentalDashboard'
import ComplianceReports from '@/components/industries/steel-plant/pages/ComplianceReports'
import Integrations from '@/components/industries/steel-plant/pages/Integrations'
import AIInfrastructure from '@/components/industries/steel-plant/pages/AIInfrastructure'
import AIAnalytics from '@/components/industries/steel-plant/pages/AIAnalytics'
import PredictiveAnalytics from '@/components/industries/steel-plant/pages/PredictiveAnalytics'
import DigitalLOTO from '@/components/industries/steel-plant/pages/DigitalLOTO'
import Settings from '@/components/industries/steel-plant/pages/Settings'

const SECTION_MAP = {
  'overview': OverviewPage,
  'realtime-kpis': RealTimeKPIs,
  'production-scheduling': ProductionScheduling,
  'alerts-notifications': AlertsNotifications,
  'scrap-to-rebar': ScrapToRebar,
  'blast-furnace': BlastFurnaceOptimization,
  'raw-material': RawMaterial,
  'quality-prediction': QualityPrediction,
  'conveyor-health': ConveyorHealth,
  'emission-monitoring': EmissionMonitoring,
  'inventory-logistics': InventoryLogistics,
  'energy-optimization': EnergyOptimization,
  'smart-sensors': SmartSensors,
  'asset-health': AssetHealth,
  'anomaly-detection': null,
  'maintenance-scheduling': MaintenanceScheduling,
  'work-orders': null,
  'digital-twin-3d': DigitalTwin3D,
  'predictive-process': PredictiveProcess,
  'efficiency-optimization': EfficiencyOptimization,
  'env-compliance': EnvironmentalDashboard,
  'compliance-reports': ComplianceReports,
  'software-integrations': Integrations,
  'hardware-integrations': null,
  'ai-infrastructure': AIInfrastructure,
  'custom-reports': AIAnalytics,
  'realtime-analytics': null,
  'predictive-analytics': PredictiveAnalytics,
  'digital-loto': DigitalLOTO,
  'system-config': Settings,
  'user-settings': null,
  'version-info': null,
}

export default function SteelSectionPage() {
  const { section } = useParams()

  if (section === 'anomaly-detection') {
    return <AssetHealth defaultTab="anomaly" />
  }
  if (section === 'work-orders') {
    return <MaintenanceScheduling defaultTab="wo" />
  }
  if (section === 'hardware-integrations') {
    return <Integrations defaultTab="hardware" />
  }
  if (section === 'realtime-analytics') {
    return <AIAnalytics defaultTab="realtime" />
  }
  if (section === 'user-settings') {
    return <Settings defaultTab="user" />
  }
  if (section === 'version-info') {
    return <Settings defaultTab="version" />
  }

  const Component = SECTION_MAP[section]
  if (!Component) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Coming Soon</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>The <strong style={{ color: '#605dba' }}>{section.replace(/-/g, ' ')}</strong> module is under development.</p>
      </div>
    )
  }

  return <Component />
}
