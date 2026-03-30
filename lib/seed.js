import dbConnect from './db'
import Industry from './models/Industry'
import logger from './logger'

export async function seedIndustries() {
  await dbConnect()

  await Industry.findOneAndUpdate(
    { slug: 'cement-plant' },
    {
      slug: 'cement-plant',
      name: 'Cement Plant',
      description: 'Cement manufacturing plant monitoring and management',
      portalRoute: '/portal/cement-plant',
      config: {
        kpis: ['production', 'kiln-uptime', 'energy', 'quality', 'oee', 'mtbf', 'safety', 'emissions'],
        modules: ['dashboard', 'ai-vision', 'predictive-maintenance', 'digital-twin', 'compliance', 'analytics', 'settings'],
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  logger.info('Synced cement-plant industry')

  await Industry.findOneAndUpdate(
    { slug: 'steel-plant' },
    {
      slug: 'steel-plant',
      name: 'Steel Plant',
      description: 'Steel manufacturing plant monitoring and management',
      portalRoute: '/portal/steel-plant',
      config: {
        kpis: ['crude-steel', 'furnace-uptime', 'energy', 'yield', 'oee', 'mtbf', 'safety', 'emissions'],
        modules: ['dashboard', 'blast-furnace', 'asset', 'maintenance', 'integrations', 'ai-vision', 'inspection', 'gate-pass', 'ehs', 'compliance', 'shutdown', 'inventory'],
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  logger.info('Synced steel-plant industry')

  await Industry.findOneAndUpdate(
    { slug: 'fmcg' },
    {
      slug: 'fmcg',
      name: 'FMCG Portal',
      description: 'Fast-Moving Consumer Goods — production, quality, supply chain & AI analytics',
      portalRoute: '/portal/fmcg',
      config: {
        kpis: ['production', 'oee', 'quality-pass-rate', 'dispatch', 'inventory', 'demand-forecast', 'energy', 'workforce'],
        modules: ['dashboard', 'production', 'inventory', 'quality', 'supply-chain', 'ai-analytics', 'maintenance', 'workforce', 'integrations', 'admin'],
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  logger.info('Synced fmcg industry')
}
