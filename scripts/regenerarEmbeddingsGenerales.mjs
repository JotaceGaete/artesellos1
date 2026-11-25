// Regenera el embedding RAG de los fragmentos GENERALES actualizados por la limpieza de 2026-11-25.
// Solo toca los ids indicados, en UNA sola llamada a OpenAI (text-embedding-3-small).
// Uso:
//   node scripts/regenerarEmbeddingsGenerales.mjs            -> muestra qué haría (no llama a OpenAI ni escribe)
//   node scripts/regenerarEmbeddingsGenerales.mjs --ejecutar -> genera y guarda los embeddings
// Requiere NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y OPENAI_API_KEY (en .env.local).
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

// Fragmentos generales (category null) que cambian en la limpieza y deben ser recuperables por RAG.
// 145 incluido: "casi 30 años" se mantiene por instrucción del 2026-11-25.
const IDS = [111, 116, 138, 139, 140, 141, 145, 148];
const EJECUTAR = process.argv.includes('--ejecutar');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, key);
const { data, error } = await supabase
  .from('knowledge_base')
  .select('id, content, category, active')
  .in('id', IDS)
  .order('id', { ascending: true });
if (error) throw error;

const problemas = [];
if (data.length !== IDS.length) problemas.push(`Se encontraron ${data.length} de ${IDS.length} filas`);
for (const r of data ?? []) {
  if (!r.active) problemas.push(`id ${r.id} inactiva`);
  if (r.category === 'oficial') problemas.push(`id ${r.id} es FAQ oficial (no lleva embedding RAG)`);
}
if (problemas.length) {
  console.error('No se ejecuta. Problemas:\n- ' + problemas.join('\n- '));
  process.exit(1);
}

console.log(`Filas a regenerar (${data.length}):`, data.map(r => r.id).join(', '));
if (!EJECUTAR) {
  console.log('Modo prueba: no se llamó a OpenAI ni se escribió nada. Agrega --ejecutar para aplicar.');
  process.exit(0);
}
if (!openaiKey) throw new Error('Falta OPENAI_API_KEY');

const openai = new OpenAI({ apiKey: openaiKey });
// Una sola petición para todas las filas.
const res = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: data.map(r => r.content),
});

for (const [i, row] of data.entries()) {
  const embedding = res.data[i].embedding;
  const { error: upErr } = await supabase
    .from('knowledge_base')
    .update({ embedding })
    .eq('id', row.id)
    .is('category', null);
  if (upErr) throw upErr;
  console.log(`✔ id ${row.id}: embedding de ${embedding.length} dimensiones guardado`);
}
console.log('Listo. Verifica con: select id, (embedding is not null) from knowledge_base order by id;');
