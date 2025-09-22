'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon,
  Package,
  Loader
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ArtFile, ArtFileValidation } from '@/types/wholesale'

interface FileUploaderProps {
  wholesaleAccountId: string
}

interface UploadedFileInfo extends File {
  id: string
  preview?: string
  validations?: ArtFileValidation
  status: 'uploading' | 'validating' | 'success' | 'error'
  error?: string
}

export default function FileUploader({ wholesaleAccountId }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFileInfo[]>([])
  const [jobData, setJobData] = useState({
    stamp_size: '',
    text_content: '',
    ink_color: 'Negro',
    quantity: 1,
    reference: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const validateFile = async (file: File): Promise<ArtFileValidation> => {
    return new Promise((resolve) => {
      const validation: ArtFileValidation = {
        is_vector: file.type === 'application/pdf' || file.type === 'image/svg+xml',
        is_single_color: true, // Por defecto, requiere validación manual
        has_transparency: false,
        size_mb: file.size / (1024 * 1024)
      }

      // Para imágenes, obtener dimensiones
      if (file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          validation.dimensions = {
            width: img.width,
            height: img.height
          }
          validation.dpi = Math.min(img.width, img.height) >= 1200 ? 600 : 300
          resolve(validation)
        }
        img.onerror = () => resolve(validation)
        img.src = URL.createObjectURL(file)
      } else {
        resolve(validation)
      }
    })
  }

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('art-files')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    return fileName
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFileInfo[] = acceptedFiles.map(file => ({
      ...file,
      id: `${Date.now()}-${file.name}`,
      status: 'uploading' as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Procesar cada archivo
    for (const file of newFiles) {
      try {
        // Actualizar estado a validando
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'validating' } : f
        ))

        // Validar archivo
        const validations = await validateFile(file)

        // Subir archivo
        const storagePath = await uploadFileToStorage(file)

        // Crear registro en base de datos
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuario no autenticado')

        const { error: dbError } = await supabase
          .from('art_files')
          .insert({
            user_id: user.id,
            filename: file.name,
            storage_key: storagePath,
            mime_type: file.type,
            size_bytes: file.size,
            validations,
            status: 'pending'
          })

        if (dbError) throw dbError

        // Actualizar estado a exitoso
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'success', 
            validations 
          } : f
        ))

      } catch (error: unknown) {
        // Actualizar estado a error
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'error', 
            error: errorMessage 
          } : f
        ))
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/svg+xml': ['.svg'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6" />
    }
    return <FileText className="w-6 h-6" />
  }

  const getValidationIcon = (file: UploadedFileInfo) => {
    switch (file.status) {
      case 'uploading':
      case 'validating':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Crear trabajo personalizado
      const { data: job, error: jobError } = await supabase
        .from('custom_jobs')
        .insert({
          user_id: user.id,
          wholesale_account_id: wholesaleAccountId,
          stamp_size: jobData.stamp_size,
          text_content: jobData.text_content,
          ink_color: jobData.ink_color,
          quantity: jobData.quantity,
          reference: jobData.reference,
          status: 'draft'
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Asociar archivos exitosos al trabajo
      const successfulFiles = files.filter(f => f.status === 'success')
      if (successfulFiles.length > 0) {
        const { error: updateError } = await supabase
          .from('art_files')
          .update({ job_id: job.id })
          .in('filename', successfulFiles.map(f => f.name))

        if (updateError) throw updateError
      }

      // Limpiar formulario
      setFiles([])
      setJobData({
        stamp_size: '',
        text_content: '',
        ink_color: 'Negro',
        quantity: 1,
        reference: ''
      })

      alert('Trabajo enviado exitosamente. Te contactaremos con la cotización.')

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const hasValidFiles = files.some(f => f.status === 'success')

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          PDF, SVG, PNG, JPG - Máximo 10MB por archivo, hasta 3 archivos
        </p>
        
        {/* Validation Requirements */}
        <div className="text-left bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto">
          <h4 className="font-medium text-gray-900 mb-2">Requisitos Técnicos:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Vectores:</strong> 1 color (negro), sin transparencias, trazo mínimo 0.25 pt</li>
            <li>• <strong>Raster:</strong> Mínimo 1200×1200 px, 600 dpi, B/N o escala de grises, fondo blanco</li>
            <li>• <strong>Formato:</strong> PDF/SVG para vectores, PNG/JPG para imágenes</li>
          </ul>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Archivos Subidos</h3>
          {files.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 text-gray-500">
                {getFileIcon(file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                
                {file.validations && (
                  <div className="text-xs text-gray-600 mt-1">
                    {file.validations.is_vector ? 'Vector' : 'Raster'} • 
                    {file.validations.dimensions ? 
                      ` ${file.validations.dimensions.width}×${file.validations.dimensions.height}px` : 
                      ' Dimensiones no detectadas'
                    }
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {getValidationIcon(file)}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
        <h3 className="font-medium text-gray-900">Detalles del Pedido</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño del Timbre *
            </label>
            <input
              type="text"
              value={jobData.stamp_size}
              onChange={(e) => setJobData(prev => ({ ...prev, stamp_size: e.target.value }))}
              placeholder="38mm x 14mm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de Tinta *
            </label>
            <select
              value={jobData.ink_color}
              onChange={(e) => setJobData(prev => ({ ...prev, ink_color: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="Negro">Negro</option>
              <option value="Azul">Azul</option>
              <option value="Rojo">Rojo</option>
              <option value="Verde">Verde</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad *
            </label>
            <input
              type="number"
              min="1"
              value={jobData.quantity}
              onChange={(e) => setJobData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia Interna
            </label>
            <input
              type="text"
              value={jobData.reference}
              onChange={(e) => setJobData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="REF-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto/Observaciones *
          </label>
          <textarea
            value={jobData.text_content}
            onChange={(e) => setJobData(prev => ({ ...prev, text_content: e.target.value }))}
            placeholder="Describe el texto que debe ir en el timbre o cualquier observación especial..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!hasValidFiles || submitting}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Package className="w-5 h-5" />
              <span>Agregar al Pedido</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
