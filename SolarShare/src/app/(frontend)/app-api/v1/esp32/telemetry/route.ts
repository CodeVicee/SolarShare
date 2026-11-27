import type { NextRequest } from 'next/server'
import { ingestESP32Telemetry } from '@/server/esp32/ingestion'
import { TelemetryError } from '@/server/telemetry/types'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const result = await ingestESP32Telemetry(rawBody, request.headers)

    return Response.json(
      { data: result },
      { status: result.status === 'duplicate' ? 200 : 202 },
    )
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
          code: 'ESP32_INGESTION_FAILED',
          message: 'ESP32 telemetry ingestion could not be completed.',
        },
      },
      { status: 500 },
    )
  }
}
