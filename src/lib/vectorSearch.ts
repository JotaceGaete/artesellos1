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
  match_threshold: number = 0.3,
  match_count: number = 10
): Promise<string[]> {
  try {
    console.log('🔍 Iniciando búsqueda RAG para:', query);
    console.log('📊 Parámetros:', { match_threshold, match_count });

    // Paso 1: Vectorizar la consulta
    const queryEmbedding = await getQueryEmbedding(query);
    console.log('✅ Embedding generado, dimensión:', queryEmbedding.length);

    // Paso 2: Búsqueda en Supabase usando pg_vector
    const supabase = createSupabaseAdmin();

    // Intentar primero con la función RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: match_threshold,
      match_count: match_count,
    });

    if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      const contents = rpcData.map((item: any) => item.content || item);
      console.log('✅ Resultados RPC encontrados:', contents.length);
      console.log('📝 Primer resultado:', contents[0]?.substring(0, 100) + '...');
      return contents;
    }

    // Si la función RPC falla o no devuelve resultados, usar cálculo manual
    if (rpcError) {
      console.warn('⚠️ Función RPC no disponible o error:', rpcError.message);
    } else {
      console.warn('⚠️ Función RPC no devolvió resultados con umbral', match_threshold);
    }

    console.log('🔄 Intentando búsqueda manual con umbral reducido...');
    
    // Intentar con umbral más bajo si no hay resultados
    const manualResults = await findRelevantContextManual(queryEmbedding, match_threshold, match_count);
    
    if (manualResults.length > 0) {
      console.log('✅ Resultados manuales encontrados:', manualResults.length);
      return manualResults;
    }

    // Si aún no hay resultados, intentar con umbral muy bajo
    if (match_threshold > 0.1) {
      console.log('🔄 Intentando con umbral muy bajo (0.1)...');
      const veryLowThresholdResults = await findRelevantContextManual(queryEmbedding, 0.1, match_count);
      
      if (veryLowThresholdResults.length > 0) {
        console.log('✅ Resultados con umbral muy bajo encontrados:', veryLowThresholdResults.length);
        return veryLowThresholdResults;
      }
    }

    // Si aún no hay resultados, devolver los mejores aunque estén por debajo del umbral
    console.log('🔄 Devolviendo mejores resultados disponibles (sin filtro de umbral)...');
    const allResults = await findRelevantContextManual(queryEmbedding, 0, match_count);
    
    if (allResults.length > 0) {
      console.log('✅ Devolviendo', allResults.length, 'mejores resultados disponibles');
      return allResults;
    }

    console.log('ℹ️ No se encontraron resultados en la base de conocimiento');
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

    // Si threshold es 0, incluir todos los resultados
    // Si threshold > 0, solo incluir los que superen el umbral
    if (threshold === 0 || similarity >= threshold) {
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
    const { data, error } = await (supabase as any)
      .from('knowledge_base')
      .select('content, embedding')
      .limit(200); // Obtener más candidatos para filtrar

    if (error) {
      console.error('❌ Error al obtener datos de knowledge_base:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No hay datos en knowledge_base');
      return [];
    }

    // Filtrar solo los que tienen embedding válido
    const validData = data.filter((item: any) => 
      item.embedding && 
      Array.isArray(item.embedding) && 
      item.embedding.length > 0
    );

    console.log(`📊 Analizando ${validData.length} candidatos válidos (de ${data.length} total) con umbral ${match_threshold}`);

    if (validData.length === 0) {
      console.warn('⚠️ No hay fragmentos con embeddings válidos en la base de datos');
      return [];
    }

    // Calcular similitud para cada candidato
    const results = await calculateCosineSimilarity(
      queryEmbedding,
      validData as Array<{ content: string; embedding: number[] }>,
      match_threshold,
      match_count
    );

    if (results.length > 0) {
      console.log(`✅ Encontrados ${results.length} resultados con similitud >= ${match_threshold}`);
      console.log('📊 Similitudes:', results.map(r => `${r.similarity.toFixed(3)}`).join(', '));
      console.log('📝 Primer resultado:', results[0].content.substring(0, 100) + '...');
    } else {
      console.log(`ℹ️ No se encontraron resultados con similitud >= ${match_threshold}`);
      if (validData.length > 0) {
        // Calcular similitud de todos para ver qué tan cerca están
        const allResults = await calculateCosineSimilarity(
          queryEmbedding,
          validData as Array<{ content: string; embedding: number[] }>,
          0,
          match_count
        );
        if (allResults.length > 0) {
          console.log('📊 Mejores similitudes encontradas (sin umbral):', 
            allResults.slice(0, 5).map(r => `${r.similarity.toFixed(3)}`).join(', '));
        }
      }
    }

    return results.map((item) => item.content);
  } catch (error) {
    console.error('❌ Error en búsqueda manual:', error);
    return [];
  }
}

