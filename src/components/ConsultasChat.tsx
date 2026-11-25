'use client';

// Chat de página completa para /consultas. Reutiliza /api/chat y el lector de stream compartido.
// Navegación: solo el área de mensajes se desplaza; el campo de escritura y las sugerencias quedan fijos.
// El streaming no fuerza el desplazamiento si el usuario está leyendo mensajes anteriores.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ProductCards from '@/components/ProductCards';
import { readChatStream, ProductCard } from '@/lib/chatStream';

type Message = { id: string; role: 'user' | 'assistant'; content: string; products?: ProductCard[]; footer?: string };

const SUGERENCIAS = ['¿Cuánto cuesta el envío?', 'Shiny 722', '¿Cuál es el horario de atención?'];
const NEAR_BOTTOM_PX = 60;

export default function ConsultasChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  const listRef = useRef<HTMLDivElement>(null); // único contenedor con scroll
  const lastUserRef = useRef<HTMLDivElement>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const pinnedRef = useRef(true); // true: el streaming sigue el final; false: el usuario lee arriba
  const pendingUserScrollRef = useRef(false);

  const measureBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  function onListScroll() {
    const near = measureBottom();
    pinnedRef.current = near;
    setAtBottom(near);
  }

  function goToLatest() {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    pinnedRef.current = true;
    setAtBottom(true);
  }

  // Tras enviar: mostrar el inicio de la respuesta (el mensaje del usuario arriba), no el final.
  // Se mueve solo el contenedor de mensajes, nunca la página.
  useEffect(() => {
    if (!pendingUserScrollRef.current) return;
    pendingUserScrollRef.current = false;
    const el = listRef.current;
    const node = lastUserRef.current;
    if (el && node) el.scrollTo({ top: node.offsetTop - 8, behavior: 'smooth' });
    setAtBottom(measureBottom());
  }, [messages]);

  // Streaming: solo sigue el final si el usuario estaba al final.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !pinnedRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || isLoading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
    const history = [...messages, userMsg];
    lastUserIdRef.current = userMsg.id;
    pendingUserScrollRef.current = true;
    pinnedRef.current = false;
    setMessages(history);
    setInput('');
    setIsLoading(true);
    setError(null);

    const assistantId = `a-${Date.now()}`;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/plain, */*' },
        body: JSON.stringify({ messages: history, productInfo: null }),
      });
      if (!response.ok) {
        let message = 'No pudimos responder en este momento. Intenta más tarde.';
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // respuesta no JSON: se usa el mensaje genérico
        }
        throw new Error(message);
      }

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);
      await readChatStream(response, (ev) => {
        setMessages(prev => prev.map(m => (m.id === assistantId
          ? {
              ...m,
              content: ev.content ? m.content + ev.content : m.content,
              products: ev.products ?? m.products,
              footer: ev.footer ? (m.footer ?? '') + ev.footer : m.footer,
            }
          : m)));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow">
      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          onScroll={onListScroll}
          className="h-full overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4"
        >
          {messages.length === 0 && (
            <p className="text-[16px] text-gray-700">
              Escribe tu consulta sobre timbres, envíos, horarios o un modelo específico. Puedes usar las sugerencias de abajo.
            </p>
          )}
          {messages.map(m => (
            <div
              key={m.id}
              ref={m.id === lastUserIdRef.current && m.role === 'user' ? lastUserRef : undefined}
              className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={`${m.products?.length ? 'w-full' : 'max-w-[85%]'} min-w-0 break-words rounded-2xl px-4 py-2 text-[16px] ${
                  m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {m.role === 'assistant' ? (
                  <div className="prose max-w-none text-[16px]">
                    {m.content && <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>}
                    {m.products && m.products.length > 0 && <ProductCards products={m.products} />}
                    {m.footer && <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.footer}</ReactMarkdown>}
                    {!m.content && !m.products && !m.footer && '…'}
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {error && <p role="alert" className="text-[16px] text-red-600">{error}</p>}
        </div>

        {!atBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={goToLatest}
            className="absolute bottom-3 right-3 rounded-full bg-indigo-600 px-3 py-1.5 text-[14px] font-semibold text-white shadow-lg hover:bg-indigo-700"
          >
            ↓ Ir al último mensaje
          </button>
        )}
      </div>

      {/* Sugerencias siempre visibles: una fila compacta que se desliza en móviles */}
      <div className="flex-none overflow-x-auto border-t border-gray-100 bg-white">
        <div className="flex gap-2 whitespace-nowrap p-2">
          {SUGERENCIAS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={isLoading}
              className="shrink-0 rounded-full border border-indigo-200 px-3 py-1.5 text-[16px] text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex-none flex gap-2 border-t border-gray-100 p-2 sm:p-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu consulta…"
          maxLength={1000}
          aria-label="Consulta"
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex-none rounded-md bg-indigo-600 px-4 py-2 text-[16px] text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
