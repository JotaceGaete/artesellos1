export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email';
import { supabaseUtils } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Guardar en Supabase
    await supabaseUtils.createContactMessage({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      status: 'unread',
    });

    // Email functionality temporarily disabled for Edge Runtime compatibility
    // TODO: Implement email sending using a service compatible with Edge Runtime
    console.log('📧 Contact message received (email sending disabled for Edge Runtime):', {
      name: data.name,
      email: data.email,
      subject: data.subject
    });

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente'
    });

  } catch (error) {
    console.error('Error sending contact message:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}