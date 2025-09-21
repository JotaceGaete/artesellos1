import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // body: { items: [{title, quantity, unit_price}], payer: {name,email}, returnUrl }
    // Aquí luego integraremos el SDK de Mercado Pago utilizando MP_ACCESS_TOKEN
    // Por ahora devolvemos un init_point simulado para continuar el flujo

    const mockInitPoint = '/checkout?mp_status=mock'
    const mockPreferenceId = 'pref_mock_123'
    return NextResponse.json({ init_point: mockInitPoint, preference_id: mockPreferenceId })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error creando preferencia' }, { status: 500 })
  }
}


