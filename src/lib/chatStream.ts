// Contrato compartido del chat: fichas de producto y eventos del stream (servidor y cliente).
// Las fichas NUNCA incluyen cantidades de stock: solo el estado de disponibilidad.

export type Disponibilidad = 'disponible' | 'agotado' | 'consultar';

export type ProductCard = {
  marca: string;
  modelo: string;
  color: string;
  categoria: string;
  medidas: string;
  precio: number | null;
  imagen_url: string | null;
  disponibilidad: Disponibilidad;
};

export type ChatAnswer = {
  content: string;
  products?: ProductCard[];
  footer?: string;
};

export type ChatEvent = { content?: string; products?: ProductCard[]; footer?: string };

/** Serializa una respuesta en eventos SSE: texto, fichas, pie y cierre. */
export function answerToSse(answer: ChatAnswer): string {
  let out = '';
  if (answer.content) out += `data: ${JSON.stringify({ content: answer.content })}\n\n`;
  if (answer.products && answer.products.length > 0) out += `data: ${JSON.stringify({ products: answer.products })}\n\n`;
  if (answer.footer) out += `data: ${JSON.stringify({ footer: answer.footer })}\n\n`;
  out += 'data: [DONE]\n\n';
  return out;
}

/** Lee el stream del chat y entrega cada evento. Acepta también texto plano en JSON. */
export async function readChatStream(response: Response, onEvent: (ev: ChatEvent) => void): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No se pudo leer la respuesta.');
  const decoder = new TextDecoder();
  let buffer = '';

  const handle = (raw: string) => {
    const line = raw.trim();
    if (!line.startsWith('data: ')) return;
    const payload = line.slice(6);
    if (payload === '[DONE]') return;
    try {
      const data = JSON.parse(payload);
      if (typeof data === 'string') onEvent({ content: data });
      else if (data && typeof data === 'object') onEvent(data as ChatEvent);
    } catch {
      // línea incompleta o no JSON: se ignora
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    for (let i = 0; i < lines.length - 1; i++) handle(lines[i]);
    buffer = lines[lines.length - 1];
  }
  if (buffer.trim()) handle(buffer);
}
