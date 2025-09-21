'use client'

import { useState, useEffect } from 'react'
import { getContactMessages, getContactMessage } from '@/lib/actions/contactActions'
import { generateSupportMailto } from '@/lib/emailConfig'
import { ChevronLeft, ChevronRight, Mail, Copy, Eye } from 'lucide-react'

interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

interface ContactMessagesData {
  messages: ContactMessage[]
  total: number
  page: number
  totalPages: number
}

export default function ContactMessages() {
  const [data, setData] = useState<ContactMessagesData | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const loadMessages = async (pageNum: number = 1) => {
    setLoading(true)
    setError('')
    
    try {
      const result = await getContactMessages(pageNum, 20)
      
      if (result.success) {
        setData(result as ContactMessagesData)
      } else {
        setError(result.error || 'Error al cargar mensajes')
      }
    } catch (err) {
      setError('Error inesperado')
      console.error('Error loading contact messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessage = async (id: number) => {
    try {
      const result = await getContactMessage(id)
      
      if (result.success) {
        setSelectedMessage(result.message)
      } else {
        setError(result.error || 'Error al cargar mensaje')
      }
    } catch (err) {
      setError('Error inesperado')
      console.error('Error loading contact message:', err)
    }
  }

  const copyMailtoLink = (message: ContactMessage) => {
    const mailtoLink = generateSupportMailto(message.id)
    navigator.clipboard.writeText(mailtoLink)
    alert('Enlace mailto copiado al portapapeles')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    loadMessages(page)
  }, [page])

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMessage(null)}
            className="flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a la lista
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => copyMailtoLink(selectedMessage)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar mailto
            </button>
            
            <a
              href={generateSupportMailto(selectedMessage.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Mail className="w-4 h-4 mr-2" />
              Responder
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Consulta #{selectedMessage.id}
            </h2>
            <div className="text-sm text-gray-500">
              Recibida el {formatDate(selectedMessage.created_at)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMessage.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${selectedMessage.email}`} className="text-indigo-600 hover:text-indigo-500">
                    {selectedMessage.email}
                  </a>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Asunto</label>
              <p className="mt-1 text-sm text-gray-900">{selectedMessage.subject}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mensaje</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                  {selectedMessage.message}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mensajes de Contacto</h2>
        <button
          onClick={() => loadMessages(page)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : data ? (
        <>
          <div className="bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {data.messages.map((message) => (
                <li key={message.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          #{message.id} - {message.subject}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyMailtoLink(message)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copiar mailto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={generateSupportMailto(message.id)}
                            className="text-indigo-600 hover:text-indigo-500"
                            title="Responder por email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => loadMessage(message.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        De: {message.name} ({message.email})
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {message.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Paginación */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-md">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((page - 1) * 20) + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(page * 20, data.total)}
                    </span>{' '}
                    de <span className="font-medium">{data.total}</span> mensajes
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {page} de {data.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay mensajes de contacto.</p>
        </div>
      )}
    </div>
  )
}
