'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, Edit2, Database, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface KnowledgeItem {
  id: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newContent, setNewContent] = useState('');
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

    try {
      setError(null);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al insertar');
      }

      setSuccess('Fragmento agregado exitosamente');
      setNewContent('');
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

    try {
      setError(null);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: newContent.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar');
      }

      setSuccess('Fragmento actualizado exitosamente');
      setNewContent('');
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
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsAdding(false);
    setNewContent('');
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
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Ingresa el contenido del fragmento de conocimiento..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
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
                        <textarea
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
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

