'use client'
import { useParams } from 'next/navigation'
import OverviewPage from '@/components/industries/fmcg/pages/OverviewPage'
import RealTimeKPIs from '@/components/industries/fmcg/pages/RealTimeKPIs'
import OEEMonitor from '@/components/industries/fmcg/pages/OEEMonitor'
import AIInsightsSummary from '@/components/industries/fmcg/pages/AIInsightsSummary'
import ProductionManagement from '@/components/industries/fmcg/pages/ProductionManagement'
import InventoryManagement from '@/components/industries/fmcg/pages/InventoryManagement'
import QualityControl from '@/components/industries/fmcg/pages/QualityControl'
import SupplyChain from '@/components/industries/fmcg/pages/SupplyChain'
import DemandForecasting from '@/components/industries/fmcg/pages/DemandForecasting'
import Maintenance from '@/components/industries/fmcg/pages/Maintenance'
import Workforce from '@/components/industries/fmcg/pages/Workforce'
import Integrations from '@/components/industries/fmcg/pages/Integrations'
import Settings from '@/components/industries/fmcg/pages/Settings'
import AIVisionCamera from '@/components/industries/fmcg/pages/AIVisionCamera'
import AIDigitalTwin from '@/components/industries/fmcg/pages/AIDigitalTwin'
import AIPredictiveMaintenance from '@/components/industries/fmcg/pages/AIPredictiveMaintenance'

export default function FmcgSectionPage() {
  const { section } = useParams()

  // Production sub-tabs
  if (section === 'line-efficiency') return <ProductionManagement defaultTab="line" />
  if (section === 'recipe-management') return <ProductionManagement defaultTab="recipe" />
  if (section === 'production-planning') return <ProductionManagement defaultTab="planning" />

  // Inventory sub-tabs
  if (section === 'finished-goods') return <InventoryManagement defaultTab="finished" />
  if (section === 'expiry-management') return <InventoryManagement defaultTab="expiry" />
  if (section === 'cold-storage') return <InventoryManagement defaultTab="cold" />

  // Quality sub-tabs
  if (section === 'ai-vision-qc') return <QualityControl defaultTab="ai" />
  if (section === 'compliance') return <QualityControl defaultTab="compliance" />
  if (section === 'qc-reports') return <QualityControl defaultTab="reports" />

  // Supply chain sub-tabs
  if (section === 'purchase-orders') return <SupplyChain defaultTab="po" />
  if (section === 'dispatch-tracking') return <SupplyChain defaultTab="dispatch" />
  if (section === 'fleet-gps') return <SupplyChain defaultTab="fleet" />

  // AI analytics sub-tabs
  if (section === 'sales-trends') return <DemandForecasting defaultTab="trends" />
  if (section === 'cost-analysis') return <DemandForecasting defaultTab="cost" />

  // Maintenance sub-tabs
  if (section === 'preventive-maintenance') return <Maintenance defaultTab="preventive" />
  if (section === 'work-orders') return <Maintenance defaultTab="wo" />
  if (section === 'spare-parts') return <Maintenance defaultTab="spare" />

  // Workforce sub-tabs
  if (section === 'attendance') return <Workforce defaultTab="attendance" />
  if (section === 'performance') return <Workforce defaultTab="performance" />

  // Integration sub-tabs
  if (section === 'iot-sensors') return <Integrations defaultTab="iot" />
  if (section === 'communication') return <Integrations defaultTab="comm" />
  if (section === 'hardware-integration') return <Integrations defaultTab="hardware" />

  // AI Intelligence
  if (section === 'ai-vision-camera')  return <AIVisionCamera />
  if (section === 'digital-twin')      return <AIDigitalTwin />
  if (section === 'predictive-ai')     return <AIPredictiveMaintenance />

  // Admin sub-tabs
  if (section === 'roles-permissions') return <Settings defaultTab="roles" />
  if (section === 'audit-logs') return <Settings defaultTab="audit" />
  if (section === 'system-config') return <Settings defaultTab="config" />

  // Direct section map
  const map = {
    'overview':           <OverviewPage />,
    'realtime-kpis':      <RealTimeKPIs />,
    'oee-monitor':        <OEEMonitor />,
    'ai-insights':        <AIInsightsSummary />,
    'batch-tracking':     <ProductionManagement defaultTab="batch" />,
    'raw-materials':      <InventoryManagement defaultTab="raw" />,
    'batch-qc':           <QualityControl defaultTab="qc" />,
    'vendor-management':  <SupplyChain defaultTab="vendor" />,
    'demand-forecasting': <DemandForecasting defaultTab="forecast" />,
    'asset-health':       <Maintenance defaultTab="asset" />,
    'shift-scheduling':   <Workforce defaultTab="shifts" />,
    'erp-integration':    <Integrations defaultTab="erp" />,
    'user-management':    <Settings defaultTab="users" />,
    'ai-vision-camera':   <AIVisionCamera />,
    'digital-twin':       <AIDigitalTwin />,
    'predictive-ai':      <AIPredictiveMaintenance />,
  }

  return map[section] ?? <OverviewPage />
}
