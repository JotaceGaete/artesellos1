// Ruta de diagnóstico para verificar la búsqueda RAG
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { findRelevantContext } from '@/lib/vectorSearch';
import { createSupabaseAdmin } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || 'que colores de tinta tienen';

    console.log('🔍 Diagnóstico RAG para:', query);

    // 1. Verificar que hay datos en la base
    const supabase = createSupabaseAdmin();
    const { data: allData, error: dataError } = await (supabase as any)
      .from('knowledge_base')
      .select('id, content')
      .order('id', { ascending: false });

    if (dataError) {
      return NextResponse.json({
        error: 'Error al obtener datos',
        details: dataError.message,
      }, { status: 500 });
    }

    // 2. Buscar contexto relevante con búsqueda vectorial
    const relevantContexts = await findRelevantContext(query, 0.3, 10);
    
    // 3. Intentar búsqueda por palabras clave como fallback
    let keywordResults: any[] = [];
    const normalizedQuery = query.toLowerCase();
    const stopWords = ['que', 'cual', 'donde', 'cuando', 'como', 'por', 'para', 'con', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'es', 'son', 'está', 'están', 'tiene', 'tienen', 'su', 'sus', 'mi', 'tu', 'nuestro', 'nuestra'];
    const keywords = normalizedQuery
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .map(word => word.replace(/[.,!?;:]/g, ''));
    
    if (keywords.length > 0) {
      const keywordConditions = keywords.map(keyword => `content.ilike.%${keyword}%`).join(',');
      const { data: keywordData, error: keywordError } = await (supabase as any)
        .from('knowledge_base')
        .select('content')
        .or(keywordConditions)
        .limit(10);
      
      if (!keywordError && keywordData) {
        keywordResults = keywordData;
      }
    }

    // 4. Verificar embeddings
    const { data: embeddingsData, error: embeddingsError } = await (supabase as any)
      .from('knowledge_base')
      .select('id, content, embedding')
      .limit(20);

    const diagnostics = {
      query,
      keywords_extracted: keywords,
      total_fragments_in_db: allData?.length || 0,
      fragments_found_vectorial: relevantContexts.length,
      fragments_found_keywords: keywordResults.length,
      relevant_contexts_vectorial: relevantContexts.map((c, i) => ({
        index: i + 1,
        content: c.substring(0, 100) + '...',
        full_content: c,
      })),
      relevant_contexts_keywords: keywordResults.map((item: any, i: number) => ({
        index: i + 1,
        content: item.content.substring(0, 100) + '...',
        full_content: item.content,
      })),
      all_fragments: allData?.map((item: any) => ({
        id: item.id,
        content: item.content.substring(0, 150) + (item.content.length > 150 ? '...' : ''),
        full_content: item.content,
        has_embedding: embeddingsData?.some((e: any) => e.id === item.id && e.embedding && Array.isArray(e.embedding) && e.embedding.length > 0) || false,
      })),
      embeddings_status: embeddingsError ? 'Error: ' + embeddingsError.message : 'OK',
      fragments_with_embeddings: embeddingsData?.filter((e: any) => e.embedding && Array.isArray(e.embedding) && e.embedding.length > 0).length || 0,
      search_working: relevantContexts.length > 0 || keywordResults.length > 0,
    };

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }, { status: 500 });
  }
}

