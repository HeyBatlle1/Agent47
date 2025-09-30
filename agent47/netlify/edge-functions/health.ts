import type { Context } from "https://edge.netlify.com"

export default async (request: Request, context: Context) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      region: context.geo?.region || 'unknown',
      country: context.geo?.country?.code || 'unknown',
    },
    services: {
      database: 'checking...',
      ai: 'checking...'
    }
  }

  return Response.json(health, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })
}

export const config = {
  path: "/api/health"
}