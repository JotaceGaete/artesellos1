'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resolveAssetUrl } from '@/lib/assetUrl';

const PLACEHOLDER = 'https://media.artesellos.cl/sin-image-producto-artesellos.png';

interface ImageItem {
  id: string;
  url: string;
  preview: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

interface ProductImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}

async function toWebP(file: File, maxPx = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      let { width, height } = img;
      const ratio = Math.min(1, maxPx / Math.max(width, height));
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => {
          if (blob) { resolve(blob); return; }
          canvas.toBlob(jpgBlob => {
            if (jpgBlob) resolve(jpgBlob);
            else reject(new Error('No se pudo convertir la imagen'));
          }, 'image/jpeg', quality);
        },
        'image/webp',
        quality,
      );
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = objUrl;
  });
}

async function uploadBlob(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append('file', blob, `product-${Date.now()}.webp`);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al subir');
  return data.url as string;
}

export default function ProductImageUploader({ value, onChange, onBusyChange }: ProductImageUploaderProps) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const initialized = useRef(false);
  const onChangeRef = useRef(onChange);
  const onBusyRef = useRef(onBusyChange);
  onChangeRef.current = onChange;
  onBusyRef.current = onBusyChange;

  // Initialize from value once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (value.length > 0) {
      setItems(value.map(url => ({
        id: Math.random().toString(36).slice(2),
        url,
        preview: resolveAssetUrl(url),
        uploading: false,
        progress: 100,
      })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent on every items change
  useEffect(() => {
    const urls = items.filter(i => i.url && !i.uploading && !i.error).map(i => i.url);
    onChangeRef.current(urls);
    onBusyRef.current?.(items.some(i => i.uploading));
  }, [items]);

  // Revoke all blob URLs on unmount
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => () => {
    itemsRef.current.forEach(item => {
      if (item.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
    });
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    const pending: ImageItem[] = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      url: '',
      preview: URL.createObjectURL(f),
      uploading: true,
      progress: 10,
    }));
    setItems(prev => [...prev, ...pending]);

    await Promise.all(
      files.map(async (file, i) => {
        const id = pending[i].id;
        try {
          const blob = await toWebP(file);
          setItems(prev => prev.map(x => x.id === id ? { ...x, progress: 55 } : x));
          const url = await uploadBlob(blob);
          URL.revokeObjectURL(pending[i].preview);
          setItems(prev => prev.map(x =>
            x.id === id
              ? { ...x, url, preview: resolveAssetUrl(url), uploading: false, progress: 100 }
              : x,
          ));
        } catch (err: any) {
          setItems(prev => prev.map(x =>
            x.id === id ? { ...x, uploading: false, error: err.message } : x,
          ));
        }
      }),
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/avif': [],
      'image/heic': [],
    },
    multiple: true,
    onDrop: processFiles,
  });

  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const setAsMain = (id: string) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  };

  // Drag-to-reorder handlers
  const onDragStart = (index: number) => setDraggingIndex(index);
  const onDragEnd = () => { setDraggingIndex(null); setDragOverIndex(null); };
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex !== null) setDragOverIndex(index);
  };
  const onDropReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === dropIndex) return;
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggingIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const uploadingCount = items.filter(i => i.uploading).length;
  const doneCount = items.filter(i => i.url && !i.uploading && !i.error).length;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <span className={`text-3xl transition-transform duration-150 ${isDragActive ? 'scale-125' : ''}`}>
            {isDragActive ? '📂' : '🖼️'}
          </span>
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Suelta aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-400">
            JPG · PNG · WebP · AVIF — Máx. 5 MB — Se optimizan a WebP automáticamente
          </p>
        </div>
      </div>

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={!item.uploading && !item.error}
              onDragStart={() => onDragStart(index)}
              onDragEnd={onDragEnd}
              onDragOver={e => onDragOver(e, index)}
              onDrop={e => onDropReorder(e, index)}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                item.error
                  ? 'border-red-300 bg-red-50'
                  : index === 0
                  ? 'border-indigo-500 ring-2 ring-indigo-100'
                  : dragOverIndex === index && draggingIndex !== index
                  ? 'border-indigo-400 ring-2 ring-indigo-100 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } ${draggingIndex === index ? 'opacity-30 scale-95 cursor-grabbing' : !item.uploading && !item.error ? 'cursor-grab' : ''}`}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={item.preview || PLACEHOLDER}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                />
              </div>

              {/* Upload overlay */}
              {item.uploading && (
                <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2 px-4">
                  <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Subiendo…</p>
                </div>
              )}

              {/* Error overlay */}
              {item.error && (
                <div className="absolute inset-0 bg-red-50/95 flex flex-col items-center justify-center gap-1.5 p-3">
                  <span className="text-red-500 text-xl">✕</span>
                  <p className="text-xs text-red-600 text-center leading-tight line-clamp-3">{item.error}</p>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-xs text-red-700 underline mt-1">
                    Quitar
                  </button>
                </div>
              )}

              {/* Actions (ready images only) */}
              {!item.uploading && !item.error && (
                <>
                  {index === 0 && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full shadow-sm pointer-events-none">
                      ★ Principal
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    title="Eliminar"
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    ✕
                  </button>

                  {index > 0 && (
                    <div className="absolute inset-x-0 bottom-0 p-2 pt-8 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setAsMain(item.id)}
                        className="w-full py-1 text-xs text-white font-semibold bg-white/20 hover:bg-white/30 rounded transition-colors"
                      >
                        ★ Establecer como principal
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      <div className="h-4 flex items-center justify-center">
        {uploadingCount > 0 ? (
          <p className="text-xs text-indigo-600 animate-pulse">
            Subiendo {uploadingCount} imagen{uploadingCount !== 1 ? 'es' : ''}…
          </p>
        ) : doneCount > 0 ? (
          <p className="text-xs text-gray-400">
            {doneCount} imagen{doneCount !== 1 ? 'es' : ''} · Arrastra para reordenar · La primera es la principal
          </p>
        ) : null}
      </div>
    </div>
  );
}
