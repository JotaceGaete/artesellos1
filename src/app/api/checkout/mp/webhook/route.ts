import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('🔔 Webhook de Mercado Pago recibido:', JSON.stringify(body, null, 2));

    // Verificar que tenemos los datos necesarios
    if (!body.type || !body.data) {
      console.log('❌ Webhook sin tipo o datos válidos');
      return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 });
    }

    const { type, data } = body;

    // Solo procesamos notificaciones de pagos
    if (type === 'payment') {
      const paymentId = data.id;
      
      if (!paymentId) {
        console.log('❌ Payment ID no encontrado');
        return NextResponse.json({ message: 'Payment ID requerido' }, { status: 400 });
      }

      // Obtener información del pago desde Mercado Pago
      const accessToken = process.env.MP_ACCESS_TOKEN;
      if (!accessToken) {
        console.log('❌ MP_ACCESS_TOKEN no configurado');
        return NextResponse.json({ message: 'Token no configurado' }, { status: 500 });
      }

      try {
        // Hacer petición a Mercado Pago para obtener detalles del pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!mpResponse.ok) {
          throw new Error(`Error al obtener pago: ${mpResponse.status}`);
        }

        const payment = await mpResponse.json();
        console.log('💳 Detalles del pago:', JSON.stringify(payment, null, 2));

        // Extraer información relevante
        const externalReference = payment.external_reference;
        const status = payment.status;
        const transactionAmount = payment.transaction_amount;
        const currency = payment.currency_id;

        if (!externalReference) {
          console.log('❌ External reference no encontrado en el pago');
          return NextResponse.json({ message: 'External reference no encontrado' }, { status: 400 });
        }

        // Actualizar el estado de la orden en nuestra base de datos
        const supabase = await createSupabaseServer();
        
        let orderStatus = 'pending';
        switch (status) {
          case 'approved':
            orderStatus = 'paid';
            break;
          case 'rejected':
          case 'cancelled':
            orderStatus = 'cancelled';
            break;
          case 'pending':
            orderStatus = 'pending';
            break;
          default:
            orderStatus = 'pending';
        }

        // Actualizar la orden
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: orderStatus,
            payment_status: status,
            payment_id: paymentId,
            payment_method: 'mercadopago',
            updated_at: new Date().toISOString(),
          })
          .eq('id', externalReference);

        if (updateError) {
          console.error('❌ Error actualizando orden:', updateError);
          return NextResponse.json({ message: 'Error actualizando orden' }, { status: 500 });
        }

        console.log(`✅ Orden ${externalReference} actualizada a estado: ${orderStatus}`);

        // Si el pago fue aprobado, podrías enviar un email de confirmación aquí
        if (status === 'approved') {
          console.log(`🎉 Pago aprobado para orden ${externalReference}`);
          // Aquí podrías agregar lógica para enviar email de confirmación
        }

        return NextResponse.json({ 
          message: 'Webhook procesado correctamente',
          orderId: externalReference,
          status: orderStatus 
        });

      } catch (mpError) {
        console.error('❌ Error consultando Mercado Pago:', mpError);
        return NextResponse.json({ message: 'Error consultando pago' }, { status: 500 });
      }
    }

    // Para otros tipos de notificaciones, solo logueamos
    console.log(`ℹ️ Notificación de tipo ${type} recibida pero no procesada`);
    return NextResponse.json({ message: 'Notificación recibida' });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// Manejar peticiones GET para verificación
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Webhook endpoint activo',
    timestamp: new Date().toISOString()
  });
}