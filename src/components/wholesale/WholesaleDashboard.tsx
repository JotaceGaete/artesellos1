'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  CreditCard,
  Star
} from 'lucide-react'
import FileUploader from './FileUploader'
import { WholesaleAccount, PriceLevel } from '@/types/wholesale'

interface WholesaleDashboardProps {
  account: WholesaleAccount
}

export default function WholesaleDashboard({ account }: WholesaleDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'orders'>('overview')

  const getLevelInfo = (level?: PriceLevel) => {
    switch (level) {
      case 'A':
        return { name: 'Nivel A', discount: '30%', color: 'text-green-600 bg-green-100' }
      case 'B':
        return { name: 'Nivel B', discount: '25%', color: 'text-blue-600 bg-blue-100' }
      case 'C':
        return { name: 'Nivel C', discount: '20%', color: 'text-orange-600 bg-orange-100' }
      default:
        return { name: 'Sin nivel', discount: '0%', color: 'text-gray-600 bg-gray-100' }
    }
  }

  const levelInfo = getLevelInfo(account.nivel)

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'upload', name: 'Subir Archivos', icon: <Upload className="w-5 h-5" /> },
    { id: 'orders', name: 'Mis Pedidos', icon: <Package className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel Mayorista
                </h1>
                <p className="text-gray-600 mt-1">
                  Bienvenido, {account.nombre_fantasia || account.razon_social}
                </p>
              </div>
              
              {/* Level Badge */}
              <div className={`px-4 py-2 rounded-full ${levelInfo.color} flex items-center space-x-2`}>
                <Star className="w-4 h-4" />
                <span className="font-semibold">
                  {levelInfo.name} - {levelInfo.discount} descuento
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-8 mt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Estado de la Cuenta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Cuenta Aprobada</p>
                    <p className="text-sm text-gray-500">Desde {new Date(account.approved_at || account.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">{levelInfo.name}</p>
                    <p className="text-sm text-gray-500">{levelInfo.discount} de descuento</p>
                  </div>
                </div>

                {account.has_credit && (
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Crédito Aprobado</p>
                      <p className="text-sm text-gray-500">Límite: ${account.credit_limit?.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="w-8 h-8 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Catálogo
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Explora nuestro catálogo completo con precios mayoristas
                </p>
                <Link
                  href="/productos"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
                >
                  Ver Productos
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Subir Archivos
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Sube tus diseños para timbres personalizados
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Comenzar
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-8 h-8 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mis Pedidos
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Revisa el estado de tus pedidos y facturas
                </p>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Ver Pedidos
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cuenta aprobada</p>
                    <p className="text-xs text-gray-500">
                      {new Date(account.approved_at || account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No hay actividad reciente</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Subir Archivos para Timbres Personalizados
              </h2>
              <FileUploader wholesaleAccountId={account.id} />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mis Pedidos
              </h2>
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No tienes pedidos aún</p>
                <p className="text-sm mt-2">
                  Comienza explorando nuestro catálogo o subiendo archivos personalizados
                </p>
                <div className="mt-6 space-x-4">
                  <Link
                    href="/productos"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
                  >
                    Ver Catálogo
                  </Link>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Subir Archivos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
