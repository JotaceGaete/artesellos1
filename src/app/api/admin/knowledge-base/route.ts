export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';
import { insertKnowledge, populateExampleKnowledge } from '@/lib/populateKnowledgeBase';
import { requireAdminSession } from '@/lib/adminSession';
import { parseKnowledgeFields, toRow } from '@/lib/knowledgeFields';

// Embedding solo para fragmentos RAG (acción del administrador, no del chat).
async function embedText(text: string): Promise<number[]> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const r = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
  return r.data[0].embedding;
}

// GET - Listar fragmentos de conocimiento
export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;

    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await (supabase as any)
      .from('knowledge_base')
      .select('id, content, category, question, aliases, active, sort_order')
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error al listar conocimiento:', error);
      return NextResponse.json({
        message: error.message || 'Error al cargar fragmentos',
        details: error.details || error.hint || null
      }, { status: 500 });
    }

    const { count, error: countError } = await (supabase as any)
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (countError) console.warn('⚠️ Error al obtener count:', countError);

    return NextResponse.json({ items: data || [], total: count || 0, limit, offset });
  } catch (err: any) {
    console.error('❌ Error en GET knowledge-base:', err);
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

// POST - Insertar nuevo fragmento o poblar con ejemplos
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const { action, content, contents } = body;

    if (action === 'populate_examples') {
      try {
        await populateExampleKnowledge();
        return NextResponse.json({ success: true, message: 'Base de conocimiento poblada con ejemplos exitosamente' });
      } catch (error: any) {
        console.error('❌ Error al poblar ejemplos:', error);
        return NextResponse.json({ success: false, message: error?.message || 'Error al poblar ejemplos' }, { status: 500 });
      }
    }

    if (action === 'insert_multiple' && Array.isArray(contents)) {
      const results = [];
      for (const contentItem of contents) {
        if (typeof contentItem === 'string' && contentItem.trim()) {
          const result = await insertKnowledge(contentItem.trim());
          results.push(result);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      const successCount = results.filter(r => r.success).length;
      return NextResponse.json({
        success: true,
        message: `${successCount} de ${contents.length} fragmentos insertados exitosamente`,
        results,
      });
    }

    const parsed = parseKnowledgeFields(body as Record<string, unknown>);
    if (parsed.ok === false) {
      return NextResponse.json({ message: parsed.message }, { status: 400 });
    }

    const fields = parsed.value;
    const embedding = fields.generate_embedding ? await embedText(fields.content) : null;
    const supabase = createSupabaseAdmin();
    const { data, error } = await (supabase as any)
      .from('knowledge_base')
      .insert({ ...toRow(fields), embedding })
      .select('id')
      .single();

    if (error || !data) {
      console.error('❌ Error al insertar fragmento:', error);
      return NextResponse.json({ success: false, message: 'Error al insertar fragmento de conocimiento' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id, message: 'Fragmento de conocimiento insertado exitosamente' });
  } catch (err: any) {
    console.error('❌ Error en POST knowledge-base:', err);
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

// PUT - Actualizar fragmento existente
export async function PUT(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ message: 'El campo "id" es requerido y debe ser un número' }, { status: 400 });
    }

    const parsed = parseKnowledgeFields(body as Record<string, unknown>);
    if (parsed.ok === false) {
      return NextResponse.json({ message: parsed.message }, { status: 400 });
    }

    const fields = parsed.value;
    const embedding = fields.generate_embedding ? await embedText(fields.content) : null;
    const supabase = createSupabaseAdmin();

    const { data, error } = await (supabase as any)
      .from('knowledge_base')
      .update({ ...toRow(fields), embedding })
      .eq('id', id)
      .select('id, content, category, question, aliases, active, sort_order')
      .single();

    if (error) {
      console.error('❌ Error al actualizar:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Fragmento de conocimiento actualizado exitosamente' });
  } catch (err: any) {
    console.error('❌ Error en PUT knowledge-base:', err);
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

// DELETE - Eliminar fragmento
export async function DELETE(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'El parámetro "id" es requerido' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('knowledge_base').delete().eq('id', parseInt(id));

    if (error) {
      console.error('❌ Error al eliminar:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Fragmento de conocimiento eliminado exitosamente' });
  } catch (err: any) {
    console.error('❌ Error en DELETE knowledge-base:', err);
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}
