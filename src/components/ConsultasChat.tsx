'use client';

// Chat de página completa para /consultas. Reutiliza /api/chat: respuestas directas, catálogo y
// cuota de IA se resuelven en el servidor, igual que en el widget flotante.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ProductCards from '@/components/ProductCards';
import { readChatStream, ProductCard } from '@/lib/chatStream';

type Message = { id: string; role: 'user' | 'assistant'; content: string; products?: ProductCard[]; footer?: string };

const SUGERENCIAS = ['¿Cuánto cuesta el envío?', 'Shiny 722', '¿Cuál es el horario de atención?'];

export default function ConsultasChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || isLoading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
    const history = [...messages, userMsg];
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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto w-full bg-white rounded-2xl shadow border border-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-gray-700">Escribe tu consulta sobre timbres, envíos, horarios o un modelo específico.</p>
            <div className="flex flex-wrap gap-2">
              {SUGERENCIAS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="px-3 py-1.5 text-sm rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`${m.products?.length ? 'w-full' : 'max-w-[85%]'} rounded-2xl px-4 py-2 text-[16px] ${
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
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="border-t border-gray-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu consulta…"
          maxLength={1000}
          aria-label="Consulta"
          className="flex-1 px-3 py-2 text-[16px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
