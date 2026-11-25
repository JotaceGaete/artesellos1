'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, Edit2, Database, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface KnowledgeItem {
  id: number;
  content: string;
  category?: string | null;
  question?: string | null;
  aliases?: string[] | null;
  active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

type Meta = {
  kind: 'faq' | 'general';
  question: string;
  category: string;
  aliases: string; // una por línea
  active: boolean;
  sort_order: string;
  generate_embedding: boolean;
};

const EMPTY_META: Meta = {
  kind: 'faq',
  question: '',
  category: '',
  aliases: '',
  active: true,
  sort_order: '100',
  generate_embedding: true,
};

function metaPayload(m: Meta) {
  const aliases = m.aliases.split('\n').map(a => a.trim()).filter(Boolean);
  const sort_order = m.sort_order === '' ? 100 : Number(m.sort_order);
  if (m.kind === 'faq') {
    // Pregunta frecuente comercial: categoría oficial automática y sin embedding.
    return {
      question: m.question.trim(),
      category: 'oficial',
      aliases,
      active: m.active,
      sort_order,
      generate_embedding: false,
    };
  }
  return {
    question: m.question.trim() || null,
    category: m.category.trim() || null,
    aliases,
    active: m.active,
    sort_order,
    generate_embedding: m.generate_embedding,
  };
}

function validateMeta(m: Meta): string | null {
  if (m.kind === 'faq' && !m.question.trim()) return 'La pregunta principal es obligatoria en una pregunta frecuente';
  return null;
}

function MetaFields({ meta, setMeta }: { meta: Meta; setMeta: (m: Meta) => void }) {
  const set = (patch: Partial<Meta>) => setMeta({ ...meta, ...patch });
  const isFaq = meta.kind === 'faq';
  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-md border ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`;
  return (
    <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 mr-2">Tipo de entrada:</span>
        <button type="button" className={tabClass(isFaq)} onClick={() => set({ kind: 'faq' })}>
          Pregunta frecuente
        </button>
        <button type="button" className={tabClass(!isFaq)} onClick={() => set({ kind: 'general' })}>
          Información general
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isFaq ? 'Pregunta principal' : 'Pregunta principal (opcional)'}
        </label>
        <input
          value={meta.question}
          onChange={(e) => set({ question: e.target.value })}
          placeholder="Ej: ¿Cuánto cuesta el envío?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Formas alternativas de preguntar (una por línea)</label>
        <textarea
          value={meta.aliases}
          onChange={(e) => set({ aliases: e.target.value })}
          disabled={isFaq ? false : !meta.question.trim()}
          placeholder={'costo del envio\nenvían a regiones'}
          className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        />
      </div>

      {!isFaq && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input
              value={meta.category}
              onChange={(e) => set({ category: e.target.value })}
              placeholder="marcas, productos, empresa…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden de presentación</label>
            <input
              type="number"
              min={0}
              max={9999}
              value={meta.sort_order}
              onChange={(e) => set({ sort_order: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={meta.active} onChange={(e) => set({ active: e.target.checked })} />
          Activo (visible para el chat)
        </label>
        {!isFaq && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={meta.generate_embedding} onChange={(e) => set({ generate_embedding: e.target.checked })} />
            Generar embedding para búsqueda RAG (usa OpenAI)
          </label>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newContent, setNewContent] = useState('');
  const [meta, setMeta] = useState<Meta>(EMPTY_META);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/knowledge-base');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar fragmentos');
      }
      
      setItems(data.items || []);
    } catch (err: any) {
      console.error('Error al cargar items:', err);
      setError(err.message || 'Error al cargar fragmentos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newContent.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }
    const metaError = validateMeta(meta);
    if (metaError) {
      setError(metaError);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), ...metaPayload(meta) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al insertar');
      }

      setSuccess('Fragmento agregado exitosamente');
      setNewContent('');
      setMeta(EMPTY_META);
      setIsAdding(false);
      await loadItems();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = async (id: number) => {
    if (!newContent.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }
    const metaError = validateMeta(meta);
    if (metaError) {
      setError(metaError);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: newContent.trim(), ...metaPayload(meta) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar');
      }

      setSuccess('Fragmento actualizado exitosamente');
      setNewContent('');
      setMeta(EMPTY_META);
      setIsEditing(null);
      await loadItems();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este fragmento?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/admin/knowledge-base?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar');
      }

      setSuccess('Fragmento eliminado exitosamente');
      await loadItems();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePopulateExamples = async () => {
    if (!confirm('¿Deseas poblar la base de conocimiento con ejemplos? Esto puede tomar unos momentos.')) {
      return;
    }

    try {
      setIsPopulating(true);
      setError(null);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'populate_examples' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al poblar ejemplos');
      }

      setSuccess('Base de conocimiento poblada exitosamente');
      await loadItems();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleRegenerateEmbeddings = async () => {
    if (!confirm('¿Deseas regenerar los embeddings de todos los fragmentos? Esto puede tomar varios minutos y consumirá créditos de OpenAI.')) {
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);
      const response = await fetch('/api/admin/knowledge-base/regenerate-embeddings', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al regenerar embeddings');
      }

      setSuccess(`Embeddings regenerados: ${data.processed} fragmentos procesados exitosamente`);
      setTimeout(() => setSuccess(null), 8000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const startEdit = (item: KnowledgeItem) => {
    setIsEditing(item.id);
    setNewContent(item.content);
    setMeta({
      kind: item.category === 'oficial' ? 'faq' : 'general',
      question: item.question ?? '',
      category: item.category ?? '',
      aliases: (item.aliases ?? []).join('\n'),
      active: item.active !== false,
      sort_order: String(item.sort_order ?? 100),
      // Información general: embedding según la casilla. Las FAQ no generan embedding.
      generate_embedding: (item.category ?? '') !== 'oficial',
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsAdding(false);
    setNewContent('');
    setMeta(EMPTY_META);
    setError(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento RAG</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona los fragmentos de conocimiento que el chatbot utiliza para responder preguntas
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRegenerateEmbeddings}
              disabled={isRegenerating || isPopulating}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Regenera los embeddings para todos los fragmentos que no los tienen"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Regenerar Embeddings
                </>
              )}
            </button>
            <button
              onClick={handlePopulateExamples}
              disabled={isPopulating || isRegenerating}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPopulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Poblando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Poblar Ejemplos
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsAdding(true);
                setIsEditing(null);
                setNewContent('');
                setError(null);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-md hover:bg-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Fragmento
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        {isAdding && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Fragmento
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Ingresa el contenido del fragmento de conocimiento..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <MetaFields meta={meta} setMeta={setMeta} />
            <div className="mt-4 flex items-center justify-end space-x-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando fragmentos...</span>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No hay fragmentos de conocimiento</p>
                <p className="text-sm text-gray-500">
                  Agrega tu primer fragmento o usa el botón "Poblar Ejemplos" para comenzar
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    {isEditing === item.id ? (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
                        <textarea
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <MetaFields meta={meta} setMeta={setMeta} />
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 whitespace-pre-wrap">{item.content}</p>
                          {item.created_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              Creado: {new Date(item.created_at).toLocaleString('es-CL')}
                              {item.updated_at && item.updated_at !== item.created_at && (
                                <> • Actualizado: {new Date(item.updated_at).toLocaleString('es-CL')}</>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Total: {items.length} fragmento{items.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

