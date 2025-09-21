'use server'

import { createSupabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { sendWholesaleConfirmation, notifyWholesaleTeam } from '@/lib/emailLogger';

export interface WholesaleFormData {
  rut: string;
  company: string;
  nombre_fantasia: string;
  giro: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  notes: string;
}

export interface WholesaleResult {
  success: boolean;
  requestId?: number;
  error?: string;
}

/**
 * Crea una nueva solicitud mayorista
 */
export async function createWholesaleRequest(formData: FormData): Promise<WholesaleResult> {
  try {
    const rut = formData.get('rut') as string;
    const company = formData.get('company') as string;
    const nombre_fantasia = formData.get('nombre_fantasia') as string;
    const giro = formData.get('giro') as string;
    const contact_name = formData.get('contact_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const notes = formData.get('notes') as string;

    // Validaciones básicas
    if (!rut || !company || !contact_name || !email || !city) {
      return { success: false, error: 'Todos los campos obligatorios deben ser completados' };
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Email inválido' };
    }

    const supabase = await createSupabaseServer();

    // Verificar que el usuario está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Debes estar logueado para enviar la solicitud' };
    }

    // Crear solicitud mayorista
    const { data: requestData, error: insertError } = await supabase
      .from('wholesale_requests')
      .insert({
        user_id: user.id,
        rut: rut.trim(),
        company: company.trim(),
        contact_name: contact_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        city: city.trim(),
        notes: notes?.trim() || `Nombre fantasía: ${nombre_fantasia}, Giro: ${giro}`,
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating wholesale request:', insertError);
      if (insertError.code === '23505') { // Unique constraint violation
        return { success: false, error: 'Ya existe una solicitud para este usuario o RUT' };
      }
      return { success: false, error: 'Error al crear la solicitud' };
    }

    const requestId = requestData.id;

    // Enviar emails (se loggean como skipped en receive_only mode)
    await Promise.all([
      sendWholesaleConfirmation(email, requestId, company),
      notifyWholesaleTeam(requestId, company, email)
    ]);

    console.log(`✅ Wholesale request created: #${requestId} for ${company}`);
    
    revalidatePath('/mayoristas');
    return { success: true, requestId };

  } catch (err) {
    console.error('Error in createWholesaleRequest:', err);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Guarda metadatos de archivo en la base de datos
 */
export async function saveFileMetadata(
  requestId: number,
  storageKey: string,
  originalName: string,
  mimeType: string,
  sizeBytes: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('art_files')
      .insert({
        request_id: requestId,
        storage_key: storageKey,
        original_name: originalName,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        upload_user_id: user.id,
        status: 'pending'
      });

    if (error) {
      console.error('Error saving file metadata:', error);
      return { success: false, error: 'Error al guardar metadatos del archivo' };
    }

    return { success: true };

  } catch (err) {
    console.error('Error in saveFileMetadata:', err);
    return { success: false, error: 'Error interno del servidor' };
  }
}
