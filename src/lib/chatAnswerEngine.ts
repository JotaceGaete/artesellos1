// Motor de respuestas directas del chat (sin OpenAI).
// 1) Preguntas frecuentes de knowledge_base (question + aliases), solo coincidencias claras.
// 2) Consulta de modelo concreto en stock_timbres (marca + número).
// Ante cualquier ambigüedad devuelve null y el chat continúa con su flujo normal.

import type { SupabaseClient } from '@supabase/supabase-js';

export type FaqRow = {
  id: number;
  content: string;
  question: string | null;
  aliases: string[] | null;
  sort_order: number;
};

export type StockRow = {
  marca: string;
  modelo: string;
  color: string;
  categoria: string;
  ancho_mm: number;
  alto_mm: number;
  precio: number;
  stock: number;
  imagen_url: string | null;
};

const FAQ_MIN_FUZZY = 0.8;

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'que', 'en', 'y', 'o', 'a', 'al', 'del',
  'es', 'son', 'por', 'para', 'con', 'me', 'mi', 'tu', 'su', 'hay', 'como', 'cual', 'cuales',
  'cuanto', 'cuanta', 'cuanto', 'cuando', 'donde', 'se', 'lo', 'le', 'ustedes', 'usted',
]);

/** Minúsculas, sin tildes, sin signos y con espacios simples. */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contentTokens(input: string): Set<string> {
  return new Set(normalizeText(input).split(' ').filter(t => t && !STOP_WORDS.has(t)));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Busca una pregunta frecuente que responda con seguridad a la consulta.
 * Devuelve null si no hay coincidencia clara o si dos preguntas distintas empatan.
 */
export function matchFaq(query: string, rows: FaqRow[]): FaqRow | null {
  const qNorm = normalizeText(query);
  if (!qNorm) return null;
  const qTokens = contentTokens(query);

  const scored = rows
    .filter(r => r.question && r.content)
    .map(row => {
      const phrases = [row.question as string, ...(row.aliases ?? [])];
      let best = 0;
      let exact = false;
      for (const phrase of phrases) {
        if (normalizeText(phrase) === qNorm) {
          exact = true;
          best = 1;
          break;
        }
        best = Math.max(best, jaccard(qTokens, contentTokens(phrase)));
      }
      return { row, best, exact };
    })
    .filter(x => x.exact || x.best >= FAQ_MIN_FUZZY)
    .sort((a, b) => b.best - a.best || a.row.sort_order - b.row.sort_order);

  if (scored.length === 0) return null;
  const top = scored[0];
  const rival = scored.find(x => x.row.id !== top.row.id);
  // Ambigüedad: otra pregunta distinta con puntaje casi igual -> no responder directo.
  if (rival && rival.best >= top.best - 0.05) return null;
  return top.row;
}

const BRAND_NAMES = ['shiny', 'trodat', 'automatik', 'colop', 'traxx'] as const;

// Palabras que pueden acompañar a un modelo sin cambiar la intención (precio, stock, saludo).
const CATALOG_FILLER = new Set([
  'cuanto', 'cuesta', 'cuestan', 'precio', 'precios', 'valor', 'vale', 'tiene', 'tienen',
  'tienes', 'stock', 'disponible', 'disponibles', 'disponibilidad', 'hay', 'quiero', 'busco',
  'timbre', 'timbres', 'sello', 'sellos', 'modelo', 'el', 'la', 'un', 'una', 'de', 'del',
  'para', 'me', 'puedo', 'ver', 'mostrar', 'muestrame', 'muestra', 'info', 'informacion',
  'que', 'es', 'cual', 'the', 'hola', 'buenas', 'por', 'favor', 'y', 'o', 'a', 'en', 'sobre',
]);

export type CatalogIntent = { brand: string; model: string };

/**
 * Detecta una consulta que es SOLO un modelo concreto ("shiny 722", "cuánto cuesta el trodat 4912").
 * Si la frase contiene otros temas (garantía, envío…), devuelve null para no responder a medias.
 */
export function parseCatalogIntent(query: string): CatalogIntent | null {
  const norm = normalizeText(query);
  const m = norm.match(/\b(shiny|trodat|automatik|colop|traxx)\s*(\d{2,4})\b/);
  if (!m) return null;
  const residual = norm.replace(m[0], ' ').split(' ').filter(Boolean);
  const onlyFiller = residual.every(t => CATALOG_FILLER.has(t) || /^\d+$/.test(t));
  if (!onlyFiller) return null;
  if (!BRAND_NAMES.includes(m[1] as (typeof BRAND_NAMES)[number])) return null;
  return { brand: m[1], model: m[2] };
}

/** Formato de productos del chat (fotografía, medidas, categoría, precio y disponibilidad). */
export function formatProductResults(data: StockRow[]): string {
  let respuesta = '\n\n📦 **Encontré estos productos:**\n\n';

  for (const item of data) {
    respuesta += `### **${item.marca} ${item.modelo}** - ${item.color}\n\n`;
    respuesta += `- **Medidas:** ${item.ancho_mm}x${item.alto_mm}mm\n`;
    respuesta += `- **Categoría:** ${item.categoria}\n`;

    if (item.precio && item.precio > 0) {
      respuesta += `- **Precio:** $${item.precio.toLocaleString('es-CL')}\n`;
    }

    if (item.stock > 0) {
      respuesta += `- **Disponibilidad online:** ✅ **${item.stock} unidades**\n`;
    } else {
      respuesta += `- **Disponibilidad online:** ⚠️ Consultar disponibilidad\n`;
    }

    if (item.imagen_url) {
      respuesta += `\n![${item.marca} ${item.modelo} ${item.color}](${item.imagen_url})\n`;
    }
    respuesta += '\n---\n\n';
  }

  respuesta += '\n💬 **¿Necesitas más información sobre alguno de estos modelos?**\n\n';
  respuesta += '_💡 Nota: Nuestra tienda física en el centro de Santiago cuenta con mayor stock. Para cantidades mayores o productos específicos, contáctanos directamente._';
  return respuesta;
}

/** Busca el modelo en stock_timbres. Sin llamadas a OpenAI. */
export async function answerCatalogIntent(
  admin: SupabaseClient,
  intent: CatalogIntent,
): Promise<string> {
  const { data, error } = await (admin as any)
    .from('stock_timbres')
    .select('marca, modelo, color, categoria, ancho_mm, alto_mm, precio, stock, imagen_url')
    .ilike('marca', intent.brand)
    .ilike('modelo', `%${intent.model}%`)
    .limit(30);

  if (error) throw error;
  const rows = ((data ?? []) as StockRow[]).filter(r =>
    new RegExp(`(^|[^0-9])${intent.model}($|[^0-9])`).test(String(r.modelo)),
  );

  if (rows.length === 0) {
    return `No encontré el modelo **${intent.brand} ${intent.model}** en nuestro catálogo online. Escríbenos por WhatsApp y revisamos si podemos conseguirlo para ti.`;
  }
  return formatProductResults(rows);
}

/** Respuesta directa de preguntas frecuentes desde knowledge_base. Null si no hay coincidencia clara. */
export async function answerFaq(admin: SupabaseClient, query: string): Promise<string | null> {
  try {
    const { data, error } = await (admin as any)
      .from('knowledge_base')
      .select('id, content, question, aliases, sort_order')
      .eq('active', true)
      .not('question', 'is', null)
      .order('sort_order', { ascending: true })
      .limit(500);
    if (error) throw error;
    const row = matchFaq(query, (data ?? []) as FaqRow[]);
    return row ? row.content : null;
  } catch (err) {
    // Migración aún no aplicada o fallo puntual: no hay respuesta directa, el chat continúa.
    console.error('[chat] FAQ no disponible:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Motor completo de respuestas directas. Nunca lanza: devuelve null si debe continuar el flujo normal.
 */
export async function tryDirectAnswer(admin: SupabaseClient, query: string): Promise<string | null> {
  const faq = await answerFaq(admin, query);
  if (faq) return faq;

  const intent = parseCatalogIntent(query);
  if (!intent) return null;
  try {
    return await answerCatalogIntent(admin, intent);
  } catch (err) {
    console.error('[chat] Catálogo no disponible:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ----- Cuota de consultas IA (servidor, persistente y atómica) -----

export const AI_DAILY_LIMIT = 5;

/** HMAC de la IP con prefijo propio para la cuota de chat (no se guarda la IP en claro). */
export async function hashChatClient(ip: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`chat:${ip}`));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}

/** Clave de cuota: cliente + día UTC. Crear sesiones nuevas no reinicia la cuota. */
export function aiQuotaKey(clientHash: string, now: Date = new Date()): string {
  return `${clientHash}:${now.toISOString().slice(0, 10)}`;
}

/** Consume una consulta IA. Fail-closed: si la cuota no se puede verificar, no se usa IA. */
export async function consumeAiQuota(admin: SupabaseClient, key: string): Promise<boolean> {
  try {
    const { data, error } = await (admin as any).rpc('chat_ai_consume', {
      p_key: key,
      p_limit: AI_DAILY_LIMIT,
    });
    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error('[chat] Cuota IA no disponible:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

export const AI_QUOTA_MESSAGE =
  'Por hoy alcanzaste el límite de consultas automáticas. Puedes seguir preguntando por modelos concretos (por ejemplo, "Shiny 722") o revisar nuestras preguntas frecuentes. Para más ayuda, escríbenos por WhatsApp.';
