'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseUtils, supabase } from '@/lib/supabase';
import { sendQuoteRequest } from '@/lib/email';

interface QuoteFormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company?: string;
  quantity: number;
  description: string;
  reference_image?: File;
}

export default function CotizacionesPage() {
  const [formData, setFormData] = useState<QuoteFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    company: '',
    quantity: 100,
    description: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, reference_image: file }));

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `quote-references/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let referenceImageUrl = '';

      // Subir imagen si existe
      if (formData.reference_image) {
        referenceImageUrl = await uploadImage(formData.reference_image) || '';
      }

      // Enviar solicitud usando API route
      const result = await sendQuoteRequest({
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        company: formData.company,
        quantity: formData.quantity,
        description: formData.description,
        reference_image: referenceImageUrl,
      });

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error submitting quote request:', error);
      setSubmitError('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">¡Solicitud enviada exitosamente!</h2>
            <p>Tu solicitud de cotización ha sido enviada a nuestro equipo. Te contactaremos pronto con una respuesta.</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Solicitar Cotización
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          ¿Necesitas una cantidad específica de timbres personalizados? Solicita una cotización personalizada
          y te enviaremos una oferta especial para tu proyecto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              ¿Por qué solicitar una cotización?
            </h3>
            <ul className="text-blue-800 space-y-2">
              <li>✓ Precios especiales por volumen</li>
              <li>✓ Diseños completamente personalizados</li>
              <li>✓ Atención prioritaria</li>
              <li>✓ Consultoría gratuita</li>
              <li>✓ Plazos flexibles</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Respuesta garantizada
            </h3>
            <p className="text-green-800">
              Te responderemos en menos de 24 horas hábiles con una cotización detallada
              y todas las especificaciones técnicas.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de contacto
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>📧 jotacegaete@gmail.com</p>
              <p>📱 WhatsApp: +56 9 XXXX XXXX</p>
              <p>🏢 Santiago, Chile</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información del Proyecto
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
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
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Detalles del Proyecto */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad aproximada *
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={50}>50 unidades</option>
                  <option value={100}>100 unidades</option>
                  <option value={200}>200 unidades</option>
                  <option value={500}>500 unidades</option>
                  <option value={1000}>1000 unidades</option>
                  <option value={2000}>2000+ unidades</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del proyecto *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu proyecto, el tipo de timbres que necesitas, colores, tamaños, fecha límite, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Imagen de referencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen de referencia (opcional)
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Sube una imagen de referencia para que entendamos mejor tu idea (máx. 5MB)
                </p>
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
                {isSubmitting ? 'Enviando solicitud...' : 'Solicitar Cotización'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sección de Preguntas Frecuentes */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Preguntas Frecuentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Cuál es el tiempo de entrega?
            </h3>
            <p className="text-gray-600">
              Para pedidos estándar, 7-10 días hábiles. Para pedidos personalizados grandes,
              coordinamos plazos según la complejidad.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Cuál es la cantidad mínima?
            </h3>
            <p className="text-gray-600">
              No tenemos cantidad mínima para cotizaciones personalizadas.
              Podemos trabajar desde 50 unidades en adelante.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Incluyen envío?
            </h3>
            <p className="text-gray-600">
              Sí, todos nuestros precios incluyen envío a domicilio dentro de Chile.
              Para envíos internacionales, cotizamos por separado.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Puedo modificar la cotización?
            </h3>
            <p className="text-gray-600">
              Claro, puedes solicitar modificaciones sin costo hasta que apruebes
              el diseño final y la cotización.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
