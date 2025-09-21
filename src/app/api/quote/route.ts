import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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

    const emailTemplate = emailTemplates.quoteRequest(data);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

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
