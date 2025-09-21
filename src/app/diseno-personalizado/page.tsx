'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseUtils } from '@/lib/supabase';
import { sendCustomDesign } from '@/lib/email';

interface DesignData {
  text: string;
  font: string;
  color: string;
  shape: 'circle' | 'square' | 'rectangle' | 'heart' | 'star';
  size: 'small' | 'medium' | 'large';
  icons: string[];
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  design_data: DesignData;
}

const fonts = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

const colors = [
  { name: 'Negro', value: '#000000' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Morado', value: '#9333ea' },
  { name: 'Dorado', value: '#fbbf24' },
  { name: 'Plateado', value: '#9ca3af' },
];

const shapes = [
  { name: 'Círculo', value: 'circle' as const, icon: '○' },
  { name: 'Cuadrado', value: 'square' as const, icon: '□' },
  { name: 'Rectángulo', value: 'rectangle' as const, icon: '▭' },
  { name: 'Corazón', value: 'heart' as const, icon: '♥' },
  { name: 'Estrella', value: 'star' as const, icon: '★' },
];

const sizes = [
  { name: 'Pequeño (2cm)', value: 'small' as const },
  { name: 'Mediano (3cm)', value: 'medium' as const },
  { name: 'Grande (4cm)', value: 'large' as const },
];

const availableIcons = [
  '🎂', '🎉', '💍', '👶', '🎓', '💼', '🏆', '🎵', '🎨', '📚',
  '🌟', '💫', '✨', '🌈', '🎈', '🎁', '🏠', '🌸', '🍀', '⚽'
];

export default function DisenoPersonalizadoPage() {
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    design_data: {
      text: '',
      font: 'Arial, sans-serif',
      color: '#000000',
      shape: 'circle',
      size: 'medium',
      icons: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('design_data.')) {
      const designField = name.replace('design_data.', '');
      setFormData(prev => ({
        ...prev,
        design_data: {
          ...prev.design_data,
          [designField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleIconToggle = (icon: string) => {
    setFormData(prev => ({
      ...prev,
      design_data: {
        ...prev.design_data,
        icons: prev.design_data.icons.includes(icon)
          ? prev.design_data.icons.filter(i => i !== icon)
          : [...prev.design_data.icons, icon],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Enviar diseño usando API route
      const result = await sendCustomDesign({
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        design_data: formData.design_data,
      });

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error submitting custom design:', error);
      setSubmitError('Error al enviar el diseño. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShapePreview = () => {
    const shape = shapes.find(s => s.value === formData.design_data.shape);
    return shape?.icon || '○';
  };

  const getSizeClass = () => {
    switch (formData.design_data.size) {
      case 'small': return 'text-2xl';
      case 'medium': return 'text-3xl';
      case 'large': return 'text-4xl';
      default: return 'text-3xl';
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">¡Diseño enviado exitosamente!</h2>
            <p>Tu diseño personalizado ha sido enviado a nuestro equipo. Te contactaremos pronto con una cotización.</p>
          </div>
          <Link
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Diseña Tu Timbre Personalizado
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Crea un diseño único para tu timbre personalizado. Elige forma, color, fuente y agrega íconos especiales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulario */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Personal
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    required
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Diseño del Timbre */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Diseño del Timbre
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="design_data.text" className="block text-sm font-medium text-gray-700 mb-1">
                    Texto del timbre *
                  </label>
                  <input
                    type="text"
                    id="design_data.text"
                    name="design_data.text"
                    required
                    maxLength={20}
                    value={formData.design_data.text}
                    onChange={handleInputChange}
                    placeholder="Ej: Feliz Cumpleaños"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo 20 caracteres
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="design_data.font" className="block text-sm font-medium text-gray-700 mb-1">
                      Fuente
                    </label>
                    <select
                      id="design_data.font"
                      name="design_data.font"
                      value={formData.design_data.font}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {fonts.map(font => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="design_data.color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      id="design_data.color"
                      name="design_data.color"
                      value={formData.design_data.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {colors.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forma
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {shapes.map(shape => (
                        <button
                          key={shape.value}
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            design_data: { ...prev.design_data, shape: shape.value }
                          }))}
                          className={`p-3 border rounded-lg text-center hover:border-indigo-500 transition-colors ${
                            formData.design_data.shape === shape.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{shape.icon}</div>
                          <div className="text-xs">{shape.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño
                    </label>
                    <div className="space-y-2">
                      {sizes.map(size => (
                        <label key={size.value} className="flex items-center">
                          <input
                            type="radio"
                            name="design_data.size"
                            value={size.value}
                            checked={formData.design_data.size === size.value}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm">{size.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Íconos (opcional - máximo 3)
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {availableIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleIconToggle(icon)}
                        disabled={formData.design_data.icons.length >= 3 && !formData.design_data.icons.includes(icon)}
                        className={`p-2 border rounded text-center hover:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          formData.design_data.icons.includes(icon)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Íconos seleccionados: {formData.design_data.icons.length}/3
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Diseño'}
            </button>
          </form>
        </div>

        {/* Vista Previa */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vista Previa del Diseño
            </h3>

            <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center min-h-[200px]">
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: formData.design_data.size === 'small' ? '80px' :
                         formData.design_data.size === 'large' ? '120px' : '100px',
                  height: formData.design_data.size === 'small' ? '80px' :
                          formData.design_data.size === 'large' ? '120px' : '100px',
                }}
              >
                {/* Forma del timbre */}
                <div
                  className={`absolute inset-0 border-4 flex items-center justify-center ${
                    formData.design_data.shape === 'circle' ? 'rounded-full' :
                    formData.design_data.shape === 'square' ? 'rounded' :
                    formData.design_data.shape === 'rectangle' ? 'rounded' :
                    formData.design_data.shape === 'heart' ? 'rounded-full' : 'rounded'
                  }`}
                  style={{
                    borderColor: formData.design_data.color,
                    width: formData.design_data.shape === 'rectangle' ? '120px' : 'auto',
                  }}
                >
                  {/* Contenido del timbre */}
                  <div className="text-center">
                    {formData.design_data.icons.length > 0 && (
                      <div className="mb-1">
                        {formData.design_data.icons.slice(0, 2).join(' ')}
                      </div>
                    )}
                    {formData.design_data.text && (
                      <div
                        style={{
                          fontFamily: formData.design_data.font,
                          color: formData.design_data.color,
                        }}
                        className={`font-bold leading-tight ${getSizeClass()}`}
                      >
                        {formData.design_data.text}
                      </div>
                    )}
                    {formData.design_data.icons.length > 2 && (
                      <div className="mt-1">
                        {formData.design_data.icons.slice(2).join(' ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Nota:</strong> Esta es una vista previa aproximada. El diseño final puede variar ligeramente.</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Qué sucede después?
            </h4>
            <ul className="text-blue-800 space-y-2">
              <li>✓ Revisaremos tu diseño personalizado</li>
              <li>✓ Te enviaremos una cotización por correo</li>
              <li>✓ Si apruebas el precio, procederemos con la producción</li>
              <li>✓ Recibirás tus timbres personalizados en 7-10 días hábiles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
