// Validación de los campos de knowledge_base que administra el panel.
// Un fragmento puede ser RAG puro (solo content) o pregunta frecuente (question + aliases).

export type KnowledgeFields = {
  content: string;
  question: string | null;
  category: string | null;
  aliases: string[];
  active: boolean;
  sort_order: number;
  generate_embedding: boolean;
};

export type ParseResult = { ok: true; value: KnowledgeFields } | { ok: false; message: string };

const MAX_CONTENT = 4000;
const MAX_QUESTION = 300;
const MAX_CATEGORY = 60;
const MAX_ALIASES = 20;
const MAX_ALIAS = 300;

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export function parseKnowledgeFields(body: Record<string, unknown>): ParseResult {
  const content = cleanText(body.content, MAX_CONTENT);
  if (!content) return { ok: false, message: 'El campo "content" es requerido y debe ser un texto no vacío' };

  const question = cleanText(body.question, MAX_QUESTION);
  const category = cleanText(body.category, MAX_CATEGORY);

  let aliases: string[] = [];
  if (Array.isArray(body.aliases)) {
    aliases = body.aliases
      .map(a => cleanText(a, MAX_ALIAS))
      .filter((a): a is string => a !== null);
  } else if (typeof body.aliases === 'string') {
    aliases = body.aliases
      .split('\n')
      .map(a => cleanText(a, MAX_ALIAS))
      .filter((a): a is string => a !== null);
  }
  aliases = Array.from(new Set(aliases.map(a => a.toLowerCase()))).slice(0, MAX_ALIASES);

  if (!question && aliases.length > 0) {
    return { ok: false, message: 'Las formas alternativas requieren una pregunta principal' };
  }

  const sortRaw = body.sort_order === undefined || body.sort_order === null || body.sort_order === ''
    ? 100
    : Number(body.sort_order);
  if (!Number.isInteger(sortRaw) || sortRaw < 0 || sortRaw > 9999) {
    return { ok: false, message: 'El orden debe ser un entero entre 0 y 9999' };
  }

  return {
    ok: true,
    value: {
      content,
      question,
      category,
      aliases,
      active: body.active === undefined ? true : body.active === true,
      sort_order: sortRaw,
      generate_embedding: body.generate_embedding === undefined ? true : body.generate_embedding !== false,
    },
  };
}

/** Campos que se guardan en la fila (sin los indicadores de proceso). */
export function toRow(v: KnowledgeFields) {
  return {
    content: v.content,
    question: v.question,
    category: v.category,
    aliases: v.aliases.length ? v.aliases : null,
    active: v.active,
    sort_order: v.sort_order,
  };
}
