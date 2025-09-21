import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface CreatePaymentBody {
  orderId: string
  items: Array<{ title: string; quantity: number; unit_price: number; currency_id?: string }>
  payer?: { name?: string; email?: string }
  returnUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePaymentBody
    const { orderId, items, payer, returnUrl } = body

    if (!orderId) {
      return NextResponse.json({ message: 'Falta orderId' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Faltan items' }, { status: 400 })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      // En desarrollo, si no hay token devolvemos un init_point simulado para probar el flujo
      const mockInitPoint = `/checkout?mp_status=mock&orderId=${encodeURIComponent(orderId)}`
      const mockPreferenceId = 'pref_mock_123'
      return NextResponse.json({ init_point: mockInitPoint, preference_id: mockPreferenceId, external_reference: orderId })
    }

    // Carga dinámica para evitar fallas si el paquete no está instalado en ciertos entornos
    const { MercadoPagoConfig, Preference } = await import('mercadopago')

    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    const success = returnUrl ? `${returnUrl}?status=approved&external_reference=${encodeURIComponent(orderId)}` : undefined
    const failure = returnUrl ? `${returnUrl}?status=rejected&external_reference=${encodeURIComponent(orderId)}` : undefined
    const pending = returnUrl ? `${returnUrl}?status=pending&external_reference=${encodeURIComponent(orderId)}` : undefined

    const pref = await preference.create({
      body: {
        items: items.map((it, index) => ({
          id: `item-${index}`,
          title: it.title,
          quantity: it.quantity,
          unit_price: it.unit_price,
          currency_id: it.currency_id || 'CLP'
        })),
        payer,
        external_reference: orderId,
        back_urls: success && failure && pending ? { success, failure, pending } : undefined,
        auto_return: 'approved'
      }
    })

    const initPoint = pref?.init_point || pref?.sandbox_init_point
    if (!initPoint) {
      return NextResponse.json({ message: 'No se recibió init_point desde Mercado Pago' }, { status: 502 })
    }

    return NextResponse.json({ init_point: initPoint, preference_id: pref.id, external_reference: orderId })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error creando link de pago' }, { status: 500 })
  }
}


