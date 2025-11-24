import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { nombre, email, telefono, mensaje } = await req.json();

    // Validación de campos requeridos
    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
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

    console.log('📧 Configurando transporter de Zoho Mail...');

    // Configurar transporter específico para Zoho
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true para puerto 465 (SSL)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Opciones adicionales para Zoho
      tls: {
        rejectUnauthorized: true,
      },
    });

    // Verificar conexión
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');

    // Construir HTML profesional del email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo mensaje de contacto - Artesellos</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
              📬 Nuevo Mensaje de Contacto
            </h1>
            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
              Recibido desde artesellos.cl
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            
            <!-- Datos del remitente -->
            <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
              <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: 600;">
                Datos del Cliente
              </h2>
              
              <div style="margin-bottom: 12px;">
                <strong style="color: #4b5563; display: inline-block; width: 100px;">👤 Nombre:</strong>
                <span style="color: #1f2937;">${nombre}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <strong style="color: #4b5563; display: inline-block; width: 100px;">✉️ Email:</strong>
                <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a>
              </div>
              
              ${telefono ? `
              <div style="margin-bottom: 12px;">
                <strong style="color: #4b5563; display: inline-block; width: 100px;">📞 Teléfono:</strong>
                <a href="tel:${telefono}" style="color: #4f46e5; text-decoration: none;">${telefono}</a>
              </div>
              ` : ''}
            </div>

            <!-- Mensaje -->
            <div style="margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600;">
                💬 Mensaje:
              </h3>
              <div style="background-color: #ffffff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; line-height: 1.6; color: #374151;">
                ${mensaje.replace(/\n/g, '<br>')}
              </div>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border-radius: 8px;">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                Responde rápidamente para no perder esta oportunidad
              </p>
              <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                📧 Responder al Cliente
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              Este mensaje fue enviado desde el formulario de contacto de <strong>Artesellos.cl</strong>
            </p>
            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
              🕒 ${new Date().toLocaleString('es-CL', { 
                timeZone: 'America/Santiago',
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configurar opciones del email
    const mailOptions = {
      from: `"Formulario Artesellos" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_MAIL_TO || 'contacto@artesellos.cl',
      replyTo: email,
      subject: `💬 Nuevo mensaje de ${nombre} - Artesellos`,
      html: htmlContent,
      text: `
Nuevo mensaje de contacto

Nombre: ${nombre}
Email: ${email}
${telefono ? `Teléfono: ${telefono}` : ''}

Mensaje:
${mensaje}

---
Enviado desde artesellos.cl
${new Date().toLocaleString('es-CL')}
      `.trim(),
    };

    console.log('📤 Enviando email...');
    
    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      messageId: info.messageId,
    });

  } catch (error: any) {
    console.error('❌ Error al enviar email:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al enviar el mensaje',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
