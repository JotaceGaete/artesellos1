// Funciones para búsqueda vectorial con RAG
import OpenAI from 'openai';
import { createSupabaseAdmin } from './supabaseServer';
import type { KnowledgeBase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convierte una consulta de texto en un vector de embeddings usando OpenAI
 */
async function getQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // o 'text-embedding-ada-002' según disponibilidad
      input: query,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ Error al generar embedding:', error);
    throw new Error('Error al generar embedding de la consulta');
  }
}

/**
 * Busca contenido relevante en la base de conocimiento usando búsqueda vectorial
 * @param query - La pregunta del usuario
 * @param match_threshold - Umbral de similitud (0.0 a 1.0), por defecto 0.7
 * @param match_count - Número máximo de resultados, por defecto 5
 * @returns Array de strings con el contenido relevante
 */
export async function findRelevantContext(
  query: string,
  match_threshold: number = 0.7,
  match_count: number = 5
): Promise<string[]> {
  try {
    console.log('🔍 Iniciando búsqueda RAG para:', query);

    // Paso 1: Vectorizar la consulta
    const queryEmbedding = await getQueryEmbedding(query);
    console.log('✅ Embedding generado, dimensión:', queryEmbedding.length);

    // Paso 2: Búsqueda en Supabase usando pg_vector
    const supabase = createSupabaseAdmin();

    // Usar la función RPC de Supabase para búsqueda de similitud de coseno
    // Asumiendo que existe una función SQL en Supabase llamada 'match_knowledge_base'
    // Si no existe, usaremos una consulta directa con el operador de similitud
    const { data, error } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: match_threshold,
      match_count: match_count,
    });

    if (error) {
      // Si la función RPC no existe, intentar con consulta directa
      console.warn('⚠️ Función RPC no encontrada, intentando consulta directa:', error.message);
      
      // Alternativa: consulta directa usando el operador de similitud de pg_vector
      // Nota: Esto requiere que la tabla tenga un índice vectorial configurado
      const { data: directData, error: directError } = await supabase
        .from('knowledge_base')
        .select('content, embedding')
        .limit(match_count);

      if (directError) {
        console.error('❌ Error en consulta directa:', directError);
        // Calcular similitud manualmente si es necesario
        return await findRelevantContextManual(queryEmbedding, match_threshold, match_count);
      }

      // Calcular similitud de coseno manualmente
      const results = await calculateCosineSimilarity(
        queryEmbedding,
        directData || [],
        match_threshold,
        match_count
      );

      console.log('✅ Resultados encontrados:', results.length);
      return results.map((item: any) => item.content);
    }

    // Si la función RPC funcionó, extraer el contenido
    if (data && Array.isArray(data)) {
      const contents = data.map((item: any) => item.content || item);
      console.log('✅ Resultados RPC encontrados:', contents.length);
      return contents;
    }

    return [];
  } catch (error: any) {
    console.error('❌ Error en findRelevantContext:', error);
    // Retornar array vacío en caso de error para no romper el flujo
    return [];
  }
}

/**
 * Calcula similitud de coseno manualmente cuando la función RPC no está disponible
 */
async function calculateCosineSimilarity(
  queryEmbedding: number[],
  candidates: Array<{ content: string; embedding: number[] }>,
  threshold: number,
  limit: number
): Promise<Array<{ content: string; similarity: number }>> {
  const results: Array<{ content: string; similarity: number }> = [];

  for (const candidate of candidates) {
    if (!candidate.embedding || !Array.isArray(candidate.embedding)) {
      continue;
    }

    // Calcular similitud de coseno
    const similarity = cosineSimilarity(queryEmbedding, candidate.embedding);

    if (similarity >= threshold) {
      results.push({
        content: candidate.content,
        similarity,
      });
    }
  }

  // Ordenar por similitud descendente y limitar
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}

/**
 * Calcula la similitud de coseno entre dos vectores
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    console.warn('⚠️ Vectores de diferente dimensión');
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Búsqueda manual cuando no hay función RPC disponible
 */
async function findRelevantContextManual(
  queryEmbedding: number[],
  match_threshold: number,
  match_count: number
): Promise<string[]> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('content, embedding')
      .limit(100); // Obtener más candidatos para filtrar

    if (error) {
      console.error('❌ Error al obtener datos de knowledge_base:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No hay datos en knowledge_base');
      return [];
    }

    // Calcular similitud para cada candidato
    const results = await calculateCosineSimilarity(
      queryEmbedding,
      data as Array<{ content: string; embedding: number[] }>,
      match_threshold,
      match_count
    );

    return results.map((item) => item.content);
  } catch (error) {
    console.error('❌ Error en búsqueda manual:', error);
    return [];
  }
}

