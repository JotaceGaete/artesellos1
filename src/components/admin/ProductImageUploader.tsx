'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';

interface UploadState {
  id: string;
  name: string;
  status: 'uploading' | 'error';
  error?: string;
}

interface ProductImageUploaderProps {
  urls: string[];
  uploading: UploadState[];
  onUpload: (files: FileList | File[]) => void;
  onRemove: (url: string) => void;
}

export default function ProductImageUploader({
  urls,
  uploading,
  onUpload,
  onRemove,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) onUpload(e.dataTransfer.files);
    },
    [onUpload],
  );

  return (
    <div className="space-y-3">
      {/* Thumbnails de imágenes ya subidas */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div key={url} className="relative group w-24 h-24">
              <Image
                src={url}
                alt={`Imagen ${i + 1}`}
                fill
                className="object-cover rounded-lg border border-gray-200"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Estado de archivos en curso */}
      {uploading.length > 0 && (
        <div className="space-y-1">
          {uploading.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              {item.status === 'uploading' ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500">Subiendo {item.name}…</span>
                </>
              ) : (
                <span className="text-red-600">✕ {item.name}: {item.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zona de carga */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors select-none"
      >
        <svg
          className="mx-auto mb-2 w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5V19a1 1 0 001 1h16a1 1 0 001-1v-2.5M16 10l-4-4m0 0L8 10m4-4v12"
          />
        </svg>
        <p className="text-sm text-gray-600">
          Arrastra imágenes aquí o{' '}
          <span className="text-indigo-600 underline">selecciona desde el equipo</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Máx 5 MB por imagen</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => {
            if (e.target.files) {
              onUpload(e.target.files);
              e.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}
