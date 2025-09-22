export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email';
import { supabaseUtils } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.customer_name || !data.customer_email || !data.quantity || !data.description) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Guardar en Supabase
    await supabaseUtils.createQuoteRequest({
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone || null,
      company: data.company || null,
      quantity: data.quantity,
      description: data.description,
      reference_image: data.reference_image || null,
      status: 'pending',
    });

    // Email functionality temporarily disabled for Edge Runtime compatibility
    // TODO: Implement email sending using a service compatible with Edge Runtime
    console.log('📧 Quote request received (email sending disabled for Edge Runtime):', {
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      quantity: data.quantity
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud de cotización enviada exitosamente'
    });

  } catch (error) {
    console.error('Error sending quote request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
