export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email';
import { supabaseUtils } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.customer_name || !data.customer_email || !data.design_data) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Guardar en Supabase
    await supabaseUtils.createCustomDesign({
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      design_data: data.design_data,
      status: 'pending',
    });

    // Email functionality temporarily disabled for Edge Runtime compatibility
    // TODO: Implement email sending using a service compatible with Edge Runtime
    console.log('📧 Custom design request received (email sending disabled for Edge Runtime):', {
      customer_name: data.customer_name,
      customer_email: data.customer_email
    });

    return NextResponse.json({
      success: true,
      message: 'Diseño personalizado enviado exitosamente'
    });

  } catch (error) {
    console.error('Error sending custom design:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
