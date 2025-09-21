'use server'

import { createSupabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { notifyContactTeam, sendContactConfirmation } from '@/lib/emailLogger';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
  contactId?: number;
  error?: string;
}

/**
 * Crea un nuevo mensaje de contacto
 */
export async function createContactMessage(formData: FormData): Promise<ContactResult> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Validaciones básicas
    if (!name || !email || !subject || !message) {
      return { success: false, error: 'Todos los campos son obligatorios' };
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Email inválido' };
    }

    if (message.length < 10) {
      return { success: false, error: 'El mensaje debe tener al menos 10 caracteres' };
    }

    const supabase = await createSupabaseServer();

    // Guardar mensaje en base de datos
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating contact message:', error);
      return { success: false, error: 'Error al guardar el mensaje' };
    }

    const contactId = data.id;

    // Enviar emails (en receive_only mode se loggean como skipped)
    await Promise.all([
      sendContactConfirmation(email, contactId, subject),
      notifyContactTeam(contactId, name, email, subject)
    ]);

    console.log(`✅ Contact message created: #${contactId} from ${email}`);
    
    revalidatePath('/contacto');
    return { success: true, contactId };

  } catch (err) {
    console.error('Error in createContactMessage:', err);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene mensajes de contacto (solo para admins)
 */
export async function getContactMessages(page: number = 1, limit: number = 20) {
  try {
    const supabase = await createSupabaseServer();

    // Verificar que el usuario es admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No autorizado' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' };
    }

    const offset = (page - 1) * limit;

    const { data: messages, error, count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching contact messages:', error);
      return { success: false, error: 'Error al obtener mensajes' };
    }

    return {
      success: true,
      messages: messages || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };

  } catch (err) {
    console.error('Error in getContactMessages:', err);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene un mensaje de contacto específico (solo para admins)
 */
export async function getContactMessage(id: number) {
  try {
    const supabase = await createSupabaseServer();

    // Verificar que el usuario es admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No autorizado' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' };
    }

    const { data: message, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contact message:', error);
      return { success: false, error: 'Mensaje no encontrado' };
    }

    return { success: true, message };

  } catch (err) {
    console.error('Error in getContactMessage:', err);
    return { success: false, error: 'Error interno del servidor' };
  }
}
