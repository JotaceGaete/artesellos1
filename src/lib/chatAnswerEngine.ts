// Motor de respuestas directas del chat (sin OpenAI).
// 1) Preguntas frecuentes de knowledge_base (question + aliases), solo coincidencias claras.
// 2) Consulta de modelo concreto en stock_timbres (marca + número).
// Ante cualquier ambigüedad devuelve null y el chat continúa con su flujo normal.

import type { SupabaseClient } from '@supabase/supabase-js';
import { ProductCard, ChatAnswer, Disponibilidad } from './chatStream';

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
  precio: number | null;
  stock: number | null;
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

const PRODUCT_INTRO = '📦 **Encontré estos productos:**';
const PRODUCT_FOOTER =
  '¿Necesitas más información sobre alguno de estos modelos?\n\n' +
  '_💡 Nota: Nuestra tienda física en el centro de Santiago cuenta con mayor stock. Para cantidades mayores o productos específicos, contáctanos directamente._';

/** Normaliza una fila de stock_timbres (texto con espacios, precios como texto). Stock nulo se conserva como nulo. */
export function normalizeStockRow(raw: any): StockRow {
  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    marca: String(raw.marca ?? '').trim(),
    modelo: String(raw.modelo ?? '').trim(),
    color: String(raw.color ?? '').trim(),
    categoria: String(raw.categoria ?? '').trim(),
    ancho_mm: num(raw.ancho_mm) ?? 0,
    alto_mm: num(raw.alto_mm) ?? 0,
    precio: num(raw.precio),
    stock: num(raw.stock),
    imagen_url: raw.imagen_url ? String(raw.imagen_url) : null,
  };
}

/** Estado público de disponibilidad. La cantidad real nunca sale del servidor. */
export function availabilityOf(stock: number | null): Disponibilidad {
  if (stock === null) return 'consultar';
  return stock > 0 ? 'disponible' : 'agotado';
}

export function toProductCards(rows: StockRow[]): ProductCard[] {
  return rows.map(r => ({
    marca: r.marca,
    modelo: r.modelo,
    color: r.color,
    categoria: r.categoria,
    medidas: r.ancho_mm && r.alto_mm ? `${r.ancho_mm}x${r.alto_mm}mm` : '',
    precio: r.precio && r.precio > 0 ? r.precio : null,
    imagen_url: r.imagen_url,
    disponibilidad: availabilityOf(r.stock),
  }));
}

export function buildProductAnswer(rows: StockRow[]): ChatAnswer {
  return { content: PRODUCT_INTRO, products: toProductCards(rows), footer: PRODUCT_FOOTER };
}

/** Busca el modelo en stock_timbres. Sin llamadas a OpenAI. */
export async function answerCatalogIntent(
  admin: SupabaseClient,
  intent: CatalogIntent,
): Promise<ChatAnswer> {
  const { data, error } = await (admin as any)
    .from('stock_timbres')
    .select('marca, modelo, color, categoria, ancho_mm, alto_mm, precio, stock, imagen_url')
    .ilike('marca', `%${intent.brand}%`)
    .ilike('modelo', `%${intent.model}%`)
    .limit(30);

  if (error) throw error;
  const rows = ((data ?? []) as any[]).map(normalizeStockRow).filter(r =>
    new RegExp(`(^|[^0-9])${intent.model}($|[^0-9])`).test(r.modelo),
  );

  if (rows.length === 0) {
    return {
      content: `No encontré el modelo **${intent.brand} ${intent.model}** en nuestro catálogo online. Escríbenos por WhatsApp y revisamos si podemos conseguirlo para ti.`,
    };
  }
  return buildProductAnswer(rows);
}

export const WHATSAPP_URL = 'https://wa.me/56922384216';

/** Medición de latencia por mecanismo (visible en los registros del servidor). */
export function logLatency(mechanism: string, startedAt: number, extra = ''): void {
  console.log(`[latencia] ${mechanism} ms=${Date.now() - startedAt}${extra ? ` ${extra}` : ''}`);
}

// Saludos y agradecimientos: respuesta local, sin IA ni cuota. Solo mensajes cortos.
const SMALL_TALK: Array<{ re: RegExp; reply: string }> = [
  {
    re: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey)$/,
    reply: '¡Hola! ¿En qué te puedo ayudar? Puedes preguntarme por un modelo (por ejemplo, "Shiny 722"), por envíos, horarios o por cómo hacer tu pedido.',
  },
  {
    re: /^(gracias|muchas gracias|ok|okey|listo|perfecto|chao|adios)$/,
    reply: `¡Con gusto! Si necesitas algo más, aquí estoy. Para concretar tu pedido también puedes escribirnos por WhatsApp: ${WHATSAPP_URL}`,
  },
];

export function smallTalkAnswer(query: string): ChatAnswer | null {
  const norm = normalizeText(query);
  if (!norm || norm.split(' ').length > 3) return null;
  const hit = SMALL_TALK.find(t => t.re.test(norm));
  return hit ? { content: hit.reply } : null;
}

// ----- Búsqueda textual en knowledge_base (sin embeddings, sin OpenAI) -----

const KB_STOP = new Set([
  'que', 'como', 'cual', 'cuales', 'cuanto', 'cuanta', 'cuantos', 'cuando', 'donde', 'para', 'por',
  'con', 'sin', 'hay', 'hacen', 'tienen', 'tiene', 'puedo', 'puede', 'quiero', 'quisiera', 'necesito',
  'favor', 'sobre', 'del', 'los', 'las', 'una', 'uno', 'unos', 'unas', 'pero', 'este', 'esta', 'hola',
  'tengo', 'son', 'ser', 'estan', 'estoy', 'mas', 'muy',
]);

/** Raíces de palabras (5 letras) para tolerar plurales y conjugaciones simples. */
function kbStems(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(' ')
      .filter(t => t.length >= 3 && !KB_STOP.has(t))
      .map(t => (t.length > 5 ? t.slice(0, 5) : t)),
  );
}

export type KbRow = { id: number; content: string; question: string | null; aliases: string[] | null };

const KB_MIN_COVERAGE = 0.6;
const KB_MIN_MARGIN = 0.15;

/**
 * Busca el fragmento que responde la consulta. Devuelve null si no es suficientemente confiable:
 * pocas palabras de la consulta, cobertura baja, o dos respuestas distintas casi empatadas.
 * Fragmentos con el mismo texto (duplicados) cuentan como una sola respuesta.
 */
export function matchKnowledgeText(query: string, rows: KbRow[]): KbRow | null {
  const qStems = [...kbStems(query)];
  if (qStems.length < 2) return null;

  const scored = new Map<string, { row: KbRow; score: number; coverage: number }>();
  for (const row of rows) {
    if (!row.content) continue;
    const key = normalizeText(row.content);
    const body = kbStems(row.content);
    const questionText = [row.question ?? '', ...(row.aliases ?? [])].join(' ');
    const qset = kbStems(questionText);
    const hits = qStems.filter(q => body.has(q)).length;
    const qHits = qStems.filter(q => qset.has(q)).length;
    const coverage = hits / qStems.length;
    const score = coverage + 0.5 * (qHits / qStems.length);
    const prev = scored.get(key);
    if (!prev || score > prev.score) scored.set(key, { row, score, coverage });
  }

  const ranked = [...scored.values()].sort((a, b) => b.score - a.score);
  if (ranked.length === 0) return null;
  const top = ranked[0];
  if (top.coverage < KB_MIN_COVERAGE) return null;
  const second = ranked[1];
  if (second && second.score > top.score - KB_MIN_MARGIN) return null;
  return top.row;
}

export async function answerFromKnowledge(admin: SupabaseClient, query: string): Promise<ChatAnswer | null> {
  const t0 = Date.now();
  try {
    const { data, error } = await (admin as any)
      .from('knowledge_base')
      .select('id, content, question, aliases')
      .eq('active', true)
      .limit(500);
    if (error) throw error;
    const row = matchKnowledgeText(query, (data ?? []) as KbRow[]);
    logLatency('texto_base', t0, row ? 'resultado=si' : 'resultado=no');
    return row ? { content: row.content } : null;
  } catch (err) {
    logLatency('texto_base', t0, 'resultado=error');
    console.error('[chat] Búsqueda textual no disponible:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Respuesta directa de preguntas frecuentes desde knowledge_base. Null si no hay coincidencia clara. */
export async function answerFaq(admin: SupabaseClient, query: string): Promise<ChatAnswer | null> {
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
    return row ? { content: row.content } : null;
  } catch (err) {
    // Migración aún no aplicada o fallo puntual: no hay respuesta directa, el chat continúa.
    console.error('[chat] FAQ no disponible:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Motor completo de respuestas directas. Nunca lanza: devuelve null si debe continuar el flujo normal.
 */
export async function tryDirectAnswer(admin: SupabaseClient, query: string): Promise<ChatAnswer | null> {
  const small = smallTalkAnswer(query);
  if (small) return small;

  const t0 = Date.now();
  const faq = await answerFaq(admin, query);
  logLatency('faq', t0, faq ? 'resultado=si' : 'resultado=no');
  if (faq) return faq;

  const intent = parseCatalogIntent(query);
  if (intent) {
    const t1 = Date.now();
    try {
      const ans = await answerCatalogIntent(admin, intent);
      logLatency('catalogo', t1, 'resultado=si');
      return ans;
    } catch (err) {
      logLatency('catalogo', t1, 'resultado=error');
      console.error('[chat] Catálogo no disponible:', err instanceof Error ? err.message : String(err));
      return null;
    }
  }

  return answerFromKnowledge(admin, query);
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
  `Por hoy ya usamos las consultas automáticas, pero puedes seguir preguntando por modelos (por ejemplo, "Shiny 722"), envíos, horarios o cómo hacer tu pedido. Para atención inmediata escríbenos por WhatsApp: ${WHATSAPP_URL}`;
