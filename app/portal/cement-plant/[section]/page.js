'use client'

import { useParams } from 'next/navigation'
import OverviewPage from '@/components/industries/cement-plant/pages/OverviewPage'
import RealTimeKPIs from '@/components/industries/cement-plant/pages/RealTimeKPIs'
import KilnOptimization from '@/components/industries/cement-plant/pages/KilnOptimization'
import ConveyorHealth from '@/components/industries/cement-plant/pages/ConveyorHealth'
import RawMaterial from '@/components/industries/cement-plant/pages/RawMaterial'
import QualityPrediction from '@/components/industries/cement-plant/pages/QualityPrediction'
import EmissionMonitoring from '@/components/industries/cement-plant/pages/EmissionMonitoring'
import InventoryLogistics from '@/components/industries/cement-plant/pages/InventoryLogistics'
import EnergyOptimization from '@/components/industries/cement-plant/pages/EnergyOptimization'
import DigitalTwinMonitoring from '@/components/industries/cement-plant/pages/DigitalTwinMonitoring'
import AIInsightsSummary from '@/components/industries/cement-plant/pages/AIInsightsSummary'
import SmartSensors from '@/components/industries/cement-plant/pages/SmartSensors'
import EnvironmentalDashboard from '@/components/industries/cement-plant/pages/EnvironmentalDashboard'
import ComplianceReports from '@/components/industries/cement-plant/pages/ComplianceReports'
import AssetHealth from '@/components/industries/cement-plant/pages/AssetHealth'
import MaintenanceScheduling from '@/components/industries/cement-plant/pages/MaintenanceScheduling'
import Integrations from '@/components/industries/cement-plant/pages/Integrations'
import AIInfrastructure from '@/components/industries/cement-plant/pages/AIInfrastructure'
import Robotics from '@/components/industries/cement-plant/pages/Robotics'
import AIAnalytics from '@/components/industries/cement-plant/pages/AIAnalytics'
import Settings from '@/components/industries/cement-plant/pages/Settings'

const SECTION_MAP = {
  'overview': OverviewPage,
  'realtime-kpis': RealTimeKPIs,
  'kiln-optimization': KilnOptimization,
  'conveyor-health': ConveyorHealth,
  'raw-material': RawMaterial,
  'quality-prediction': QualityPrediction,
  'emission-monitoring': EmissionMonitoring,
  'inventory-logistics': InventoryLogistics,
  'energy-optimization': EnergyOptimization,
  'digital-twin-monitoring': DigitalTwinMonitoring,
  'ai-insights': AIInsightsSummary,
  'smart-sensors': SmartSensors,
  'env-compliance': EnvironmentalDashboard,
  'compliance-reports': ComplianceReports,
  'asset-health': AssetHealth,
  'anomaly-detection': null,
  'maintenance-scheduling': MaintenanceScheduling,
  'work-orders': null,
  'ai-infrastructure': AIInfrastructure,
  'software-integrations': Integrations,
  'hardware-integrations': null,
  'robotics': Robotics,
  'static-arms': null,
  'palletizing': null,
  'mobile-robots': null,
  'custom-reports': AIAnalytics,
  'realtime-analytics': null,
  'system-config': Settings,
  'user-settings': null,
  'version-info': null,
}

export default function CementSectionPage() {
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
  if (section === 'static-arms') {
    return <Robotics defaultTab="arms" />
  }
  if (section === 'palletizing') {
    return <Robotics defaultTab="palletizing" />
  }
  if (section === 'mobile-robots') {
    return <Robotics defaultTab="mobile" />
  }

  const Component = SECTION_MAP[section]
  if (!Component) {
    return <OverviewPage />
  }

  return <Component />
}
