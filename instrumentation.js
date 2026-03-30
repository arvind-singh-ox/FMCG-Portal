export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { seedIndustries } = await import('./lib/seed')
      await seedIndustries()
    } catch (err) {
      console.error('[WARN] Seed failed (MongoDB may be unavailable):', err.message)
    }
  }
}
