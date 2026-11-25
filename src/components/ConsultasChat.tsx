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

const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const SUGERENCIAS = [
  {
    texto: '¿Cuánto se demoran?',
    detalle: 'Tiempos de entrega',
    icono: (<svg {...svgProps} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  },
  {
    texto: '¿Dónde están ubicados?',
    detalle: 'Coronel y retiro',
    icono: (<svg {...svgProps} aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>),
  },
  {
    texto: '¿Cuál es el horario de atención?',
    detalle: 'Lunes a viernes',
    icono: (<svg {...svgProps} aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>),
  },
];
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
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_20px_50px_-20px_rgba(109,40,217,0.35)]">
      <div className="flex flex-none items-center gap-3 bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-white">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-white text-[18px] font-extrabold text-violet-700" aria-hidden="true">A</div>
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-tight">Atención Artesellos</h2>
          <p className="text-[13px] opacity-90"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />En línea · responde al instante</p>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          onScroll={onListScroll}
          className="h-full overflow-y-auto overscroll-contain bg-gradient-to-b from-violet-50/60 to-white p-3 sm:p-4 space-y-4"
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
                  m.role === 'user' ? 'bg-violet-700 text-white' : 'bg-violet-100 text-gray-800'
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

      {/* Sugerencias siempre visibles: tarjetas en una fila que se desliza en móviles */}
      <div className="flex-none overflow-x-auto border-t border-violet-100 bg-white">
        <div className="flex gap-2.5 p-2.5">
          {SUGERENCIAS.map(s => (
            <button
              key={s.texto}
              type="button"
              onClick={() => send(s.texto)}
              disabled={isLoading}
              className="flex min-w-[13rem] flex-1 items-center gap-2.5 rounded-xl border border-violet-100 bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-50"
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-violet-100 text-violet-700 [&>svg]:h-4 [&>svg]:w-4">{s.icono}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-tight text-gray-800">{s.texto}</span>
                <span className="block text-[13px] text-gray-500">{s.detalle}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex-none flex gap-2 border-t border-violet-100 p-2 sm:p-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu consulta…"
          maxLength={1000}
          aria-label="Consulta"
          className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-[16px] focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex-none rounded-full bg-violet-700 px-5 py-2 text-[16px] font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
