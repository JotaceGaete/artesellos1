import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Usar Node.js runtime para nodemailer
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parsear el FormData
    const formData = await req.formData();
    
    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const notas = formData.get('notas') as string;
    const archivo = formData.get('archivo') as File | null;

    // Validación de campos requeridos
    if (!nombre || !email) {
      return NextResponse.json(
        { success: false, error: 'Nombre y email son campos requeridos' },
        { status: 400 }
      );
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validación de archivo
    if (!archivo || archivo.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes subir un archivo de diseño' },
        { status: 400 }
      );
    }

    // Validar formato de archivo
    const allowedExtensions = ['.pdf', '.ai', '.cdr', '.jpg', '.jpeg', '.png'];
    const fileName = archivo.name.toLowerCase();
    const isValidFormat = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFormat) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Formato de archivo no permitido. Solo se aceptan: PDF, AI, CDR, JPG, PNG' 
        },
        { status: 400 }
      );
    }

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ Variables de entorno SMTP no configuradas');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuración del servidor de correo incompleta. Por favor contacta al administrador.',
        },
        { status: 500 }
      );
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📧 Configurando transporter para envío de diseño...');
    
    // Configurar transporter para Zoho Mail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Preparar el contenido del email
    const mailOptions = {
      from: `"Artesellos Web" <${process.env.SMTP_USER}>`,
      to: 'contacto@artesellos.cl',
      subject: `Nueva Solicitud de Diseño Personalizado - ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Nueva Solicitud de Diseño Personalizado</h2>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>

          ${notas ? `
          <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400E; margin-top: 0;">Notas y Especificaciones</h3>
            <p style="white-space: pre-wrap; color: #78350F;">${notas}</p>
          </div>
          ` : ''}

          <div style="background-color: #E0E7FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3730A3; margin-top: 0;">Archivo Adjunto</h3>
            <p><strong>Nombre del archivo:</strong> ${archivo.name}</p>
            <p><strong>Tamaño:</strong> ${(archivo.size / 1024).toFixed(2)} KB</p>
            <p><strong>Tipo:</strong> ${archivo.type || 'No especificado'}</p>
          </div>

          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Este correo fue enviado desde el formulario de diseño personalizado de Artesellos.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: archivo.name,
          content: buffer,
          contentType: archivo.type || 'application/octet-stream',
        },
      ],
    };

    console.log('📤 Enviando correo con diseño adjunto...');
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Correo enviado exitosamente:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Tu diseño ha sido enviado exitosamente. Nos pondremos en contacto contigo pronto.',
    });
  } catch (error: unknown) {
    console.error('❌ Error al procesar la solicitud de diseño:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Hubo un error al enviar tu diseño. Por favor intenta nuevamente o contáctanos directamente.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

