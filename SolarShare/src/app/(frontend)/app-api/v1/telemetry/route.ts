import type { NextRequest } from 'next/server'
import { ingestTelemetry } from '@/server/telemetry/pipeline'
import { getTelemetryAdapter } from '@/server/telemetry/registry'
import { TelemetryError } from '@/server/telemetry/types'

export async function POST(request: NextRequest) {
  try {
    const adapter = getTelemetryAdapter(request.headers.get('x-solarshare-adapter'))
    const rawBody = await request.text()
    const result = await ingestTelemetry(adapter, rawBody, request.headers)
    return Response.json({ data: result }, { status: result.status === 'duplicate' ? 200 : 202 })
  } catch (error) {
    if (error instanceof TelemetryError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      )
    }
    return Response.json(
      {
        error: {
          code: 'INGESTION_FAILED',
          message: 'Telemetry ingestion could not be completed.',
        },
      },
      { status: 500 },
    )
  }
}
