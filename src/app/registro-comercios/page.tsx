'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseUtils } from '@/lib/supabase';
import { sendWholesaleRegistration } from '@/lib/email';

interface WholesaleFormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_type: string;
  tax_id?: string;
  expected_volume: 'small' | 'medium' | 'large';
  address: {
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

const businessTypes = [
  'Tienda minorista',
  'Distribuidora',
  'Cadena de tiendas',
  'E-commerce',
  'Mayorista tradicional',
  'Otro'
];

const volumeOptions = [
  { value: 'small' as const, label: 'Pequeño (100-500 unidades/mes)', description: 'Ideal para comenzar' },
  { value: 'medium' as const, label: 'Mediano (500-2000 unidades/mes)', description: 'Crecimiento moderado' },
  { value: 'large' as const, label: 'Grande (2000+ unidades/mes)', description: 'Volumen alto' },
];

export default function RegistroComerciosPage() {
  const [formData, setFormData] = useState<WholesaleFormData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    business_type: '',
    tax_id: '',
    expected_volume: 'small',
    address: {
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Chile',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Enviar registro usando API route
      const result = await sendWholesaleRegistration({
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone,
        business_type: formData.business_type,
        tax_id: formData.tax_id,
        expected_volume: formData.expected_volume,
        address: formData.address,
      });

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error submitting wholesale registration:', error);
      setSubmitError('Error al enviar el registro. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">¡Registro enviado exitosamente!</h2>
            <p>Tu solicitud de registro como comercio mayorista ha sido enviada. Nuestro equipo la revisará y te contactaremos pronto.</p>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Registro de Comercios Mayoristas
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Únete a nuestra red de comercios mayoristas y disfruta de precios especiales,
          atención prioritaria y beneficios exclusivos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Beneficios */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">
              Beneficios para Mayoristas
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Precios especiales por volumen</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Descuentos adicionales</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Atención prioritaria</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Envíos programados</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Soporte técnico dedicado</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="text-lg font-semibold text-green-900 mb-3">
              Requisitos Mínimos
            </h4>
            <ul className="text-green-800 space-y-2 text-sm">
              <li>• Compra mínima inicial: 100 unidades</li>
              <li>• Compra mensual: 50+ unidades</li>
              <li>• Documentación comercial válida</li>
              <li>• Referencias comerciales (opcional)</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">
              Proceso de Aprobación
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-blue-900">Envío del formulario</p>
                  <p className="text-blue-700 text-sm">Completa toda la información</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-blue-900">Revisión</p>
                  <p className="text-blue-700 text-sm">Nuestro equipo revisa tu solicitud</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-blue-900">Contacto</p>
                  <p className="text-blue-700 text-sm">Te contactamos para coordinar</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-green-900">¡Listo!</p>
                  <p className="text-green-700 text-sm">Comienzas a disfrutar beneficios</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información de la Empresa
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de la Empresa */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Datos Empresariales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Empresa *
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Negocio *
                    </label>
                    <select
                      id="business_type"
                      name="business_type"
                      required
                      value={formData.business_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Información del Contacto */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Persona de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      required
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                      RUT/ID Fiscal
                    </label>
                    <input
                      type="text"
                      id="tax_id"
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleInputChange}
                      placeholder="12.345.678-9"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dirección Fiscal
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address.address_1" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección Línea 1 *
                    </label>
                    <input
                      type="text"
                      id="address.address_1"
                      name="address.address_1"
                      required
                      value={formData.address.address_1}
                      onChange={handleInputChange}
                      placeholder="Calle, número, oficina"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.address_2" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección Línea 2
                    </label>
                    <input
                      type="text"
                      id="address.address_2"
                      name="address.address_2"
                      value={formData.address.address_2}
                      onChange={handleInputChange}
                      placeholder="Departamento, piso, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        required
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        Región *
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        required
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.postcode" className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        id="address.postcode"
                        name="address.postcode"
                        value={formData.address.postcode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Volumen Esperado */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Volumen de Compra Esperado
                </h3>
                <div className="space-y-3">
                  {volumeOptions.map(option => (
                    <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                      <input
                        type="radio"
                        name="expected_volume"
                        value={option.value}
                        checked={formData.expected_volume === option.value}
                        onChange={handleInputChange}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
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
                {isSubmitting ? 'Enviando registro...' : 'Enviar Solicitud de Registro'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
