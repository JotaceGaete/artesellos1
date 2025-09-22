/**
 * Sistema de logging para emails
 * Registra todos los intentos de envío de email para auditoría
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { EMAIL_CONFIG, canSendEmails } from './emailConfig';

export interface EmailLogData {
  to: string;
  subject: string;
  template?: string;
  payload?: Record<string, any>;
}

/**
 * Registra un intento de envío de email en la base de datos
 */
export async function logEmail(
  data: EmailLogData,
  status: 'sent' | 'failed' | 'skipped_receive_only' = 'skipped_receive_only',
  errorMessage?: string
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: logEntry, error } = await (supabase as any)
      .from('mail_log')
      .insert({
        to_email: data.to,
        subject: data.subject,
        template: data.template,
        payload_json: data.payload || {},
        status,
        error_message: errorMessage,
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error logging email:', error);
      return { success: false, error: error.message };
    }

    console.log(`📧 Email logged: ${status} - ${data.subject} to ${data.to}`);
    return { success: true, id: logEntry.id };

  } catch (err) {
    console.error('❌ Error logging email:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Simula el envío de un email (para reemplazar funciones sendEmail existentes)
 * En modo receive_only, solo registra el log sin enviar
 */
export async function sendEmail(data: EmailLogData): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!canSendEmails()) {
    // Modo receive_only: solo registrar en log
    console.log(`📧 [RECEIVE_ONLY] Email skipped: ${data.subject} to ${data.to}`);
    return await logEmail(data, 'skipped_receive_only');
  }

  // TODO: En modo active, aquí iría la integración con SMTP/Resend/Mailgun
  console.log(`📧 [ACTIVE] Email would be sent: ${data.subject} to ${data.to}`);
  return await logEmail(data, 'sent');
}

/**
 * Plantillas de email predefinidas
 */
export const EMAIL_TEMPLATES = {
  CONTACT_CONFIRMATION: 'contact_confirmation',
  WHOLESALE_CONFIRMATION: 'wholesale_confirmation',
  WHOLESALE_APPROVED: 'wholesale_approved',
  WHOLESALE_REJECTED: 'wholesale_rejected',
} as const;

/**
 * Envía email de confirmación de contacto (skipped en receive_only)
 */
export async function sendContactConfirmation(
  userEmail: string,
  contactId: number,
  subject: string
) {
  return await sendEmail({
    to: userEmail,
    subject: `Confirmación de consulta #${contactId}`,
    template: EMAIL_TEMPLATES.CONTACT_CONFIRMATION,
    payload: {
      contactId,
      originalSubject: subject,
      supportEmail: EMAIL_CONFIG.SUPPORT,
    }
  });
}

/**
 * Envía email de confirmación de solicitud mayorista (skipped en receive_only)
 */
export async function sendWholesaleConfirmation(
  userEmail: string,
  requestId: number,
  companyName: string
) {
  return await sendEmail({
    to: userEmail,
    subject: `Solicitud mayorista recibida #${requestId}`,
    template: EMAIL_TEMPLATES.WHOLESALE_CONFIRMATION,
    payload: {
      requestId,
      companyName,
      wholesaleEmail: EMAIL_CONFIG.WHOLESALE,
    }
  });
}

/**
 * Notifica al equipo sobre nueva solicitud mayorista (skipped en receive_only)
 */
export async function notifyWholesaleTeam(
  requestId: number,
  companyName: string,
  userEmail: string
) {
  return await sendEmail({
    to: EMAIL_CONFIG.WHOLESALE,
    subject: `Nueva solicitud mayorista #${requestId} - ${companyName}`,
    template: 'wholesale_team_notification',
    payload: {
      requestId,
      companyName,
      userEmail,
    }
  });
}

/**
 * Notifica al equipo sobre nuevo mensaje de contacto (skipped en receive_only)
 */
export async function notifyContactTeam(
  contactId: number,
  name: string,
  email: string,
  subject: string
) {
  return await sendEmail({
    to: EMAIL_CONFIG.SUPPORT,
    subject: `Nueva consulta #${contactId} - ${subject}`,
    template: 'contact_team_notification',
    payload: {
      contactId,
      name,
      email,
      originalSubject: subject,
    }
  });
}
