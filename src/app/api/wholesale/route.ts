import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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

    // Enviar email usando nodemailer
    const adminEmail = process.env.CONTACT_EMAIL || 'jotacegaete@gmail.com';

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailTemplate = emailTemplates.wholesaleRegistration(data);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

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
