import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4 overflow-hidden">
      {/* Blob de luz difusa de fondo - Decorativo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-gradient-to-br from-indigo-200/40 via-purple-200/40 to-pink-200/30 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        
        {/* Número 404 Gigante con degradado y animación */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-[180px] sm:text-[220px] md:text-[280px] font-black leading-none mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              404
            </span>
          </h1>
        </div>

        {/* Título principal */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Página no encontrada
          </h2>
        </div>

        {/* Subtítulo */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Botón Primario */}
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg 
                  className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
                Volver al Inicio
              </span>
              {/* Efecto hover brillante */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            {/* Botón Secundario */}
            <Link
              href="/productos"
              className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              <span className="flex items-center gap-2">
                Ver Catálogo
                <svg 
                  className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Mensaje de ayuda adicional */}
        <div className="animate-in fade-in duration-700 delay-700 mt-16">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <Link 
              href="/contacto" 
              className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-4 transition-colors"
            >
              Contáctanos
            </Link>
          </p>
        </div>
      </div>

      {/* Elementos decorativos adicionales */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-300"></div>
    </div>
  );
}
