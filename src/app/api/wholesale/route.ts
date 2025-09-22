export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email';
import { supabaseUtils } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.company_name || !data.contact_name || !data.email || !data.phone || !data.business_type || !data.address) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Guardar en Supabase
    await supabaseUtils.createWholesaleRegistration({
      company_name: data.company_name,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      business_type: data.business_type,
      tax_id: data.tax_id || null,
      address: data.address,
      expected_volume: data.expected_volume,
      status: 'pending',
    });

    // Email functionality temporarily disabled for Edge Runtime compatibility
    // TODO: Implement email sending using a service compatible with Edge Runtime
    console.log('📧 Wholesale registration received (email sending disabled for Edge Runtime):', {
      company_name: data.company_name,
      contact_name: data.contact_name,
      email: data.email
    });

    return NextResponse.json({
      success: true,
      message: 'Registro de comercio enviado exitosamente'
    });

  } catch (error) {
    console.error('Error sending wholesale registration:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
