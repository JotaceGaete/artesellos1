/**
 * Script de diagnóstico para verificar configuración SMTP de Zoho
 * 
 * Uso:
 * 1. Asegúrate de tener las variables en .env.local
 * 2. Ejecuta: node test-smtp-config.js
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔍 Verificando configuración SMTP...\n');

  // Verificar variables de entorno
  const requiredVars = ['SMTP_USER', 'SMTP_PASSWORD'];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\n💡 Crea un archivo .env.local con:');
    console.error('   SMTP_HOST=smtp.zoho.com');
    console.error('   SMTP_PORT=465');
    console.error('   SMTP_USER=tu-email@artesellos.cl');
    console.error('   SMTP_PASSWORD=tu-contraseña');
    console.error('   CONTACT_MAIL_TO=contacto@artesellos.cl');
    return;
  }

  console.log('✅ Variables de entorno encontradas:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.zoho.com'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '465'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_PASSWORD: ${'*'.repeat(process.env.SMTP_PASSWORD.length)}`);
  console.log(`   CONTACT_MAIL_TO: ${process.env.CONTACT_MAIL_TO || process.env.SMTP_USER}\n`);

  // Crear transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verificar conexión
  console.log('🔌 Verificando conexión SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa!\n');
  } catch (error) {
    console.error('❌ Error al verificar conexión SMTP:\n');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Solución:');
      console.error('   1. Verifica que el usuario y contraseña sean correctos');
      console.error('   2. Si tienes 2FA activado, genera una contraseña de aplicación:');
      console.error('      https://accounts.zoho.com/home#security/app_specific_password');
      console.error('   3. Usa esa contraseña en SMTP_PASSWORD');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solución:');
      console.error('   1. Verifica tu conexión a internet');
      console.error('   2. Verifica que el puerto 465 no esté bloqueado');
      console.error('   3. Intenta con puerto 587 (cambia SMTP_PORT=587 y secure: false)');
    }
    return;
  }

  // Enviar email de prueba
  console.log('📧 Enviando email de prueba...');
  try {
    const info = await transporter.sendMail({
      from: `"Test Artesellos" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_MAIL_TO || process.env.SMTP_USER,
      subject: '🧪 Test de Configuración SMTP - Artesellos',
      text: 'Este es un email de prueba para verificar la configuración SMTP.',
      html: '<p>Este es un <strong>email de prueba</strong> para verificar la configuración SMTP.</p>',
    });

    console.log('✅ Email de prueba enviado exitosamente!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Enviado a: ${info.accepted.join(', ')}`);
    console.log('\n🎉 ¡Configuración SMTP correcta!');
  } catch (error) {
    console.error('❌ Error al enviar email de prueba:\n');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    if (error.response) {
      console.error(`   Respuesta: ${error.response}`);
    }
  }
}

// Ejecutar test
testSMTP().catch(console.error);

