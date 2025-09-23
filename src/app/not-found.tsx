import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Ilustración divertida */}
        <div className="mb-8">
          <div className="relative">
            {/* Timbre gigante con cara triste */}
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                {/* Cara triste */}
                <div className="text-4xl">😞</div>
              </div>
            </div>
            
            {/* Líneas de "error" alrededor */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-red-400 rounded-full animate-pulse"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 border-2 border-yellow-400 rounded-full animate-pulse delay-100"></div>
            <div className="absolute -bottom-2 -left-6 w-4 h-4 border-2 border-blue-400 rounded-full animate-pulse delay-200"></div>
            <div className="absolute -bottom-4 -right-2 w-6 h-6 border-2 border-green-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Logo de Artesellos */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/favicon.svg" 
              alt="Artesellos Logo" 
              className="w-16 h-16 mr-3"
            />
            <span className="text-3xl font-bold text-gray-800">Artesellos</span>
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          4<span className="text-indigo-600">0</span>4
        </h1>
        
        {/* Subtítulo divertido */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          ¡Ups! Este timbre no existe
        </h2>
        
        {/* Descripción creativa */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Parece que este sello se perdió en el correo. 
          <br />
          No te preocupes, tenemos muchos otros timbres increíbles esperándote.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Inicio
          </Link>
          
          <Link
            href="/productos"
            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Ver Productos
          </Link>
        </div>

        {/* Sección de timbres sugeridos */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ¿Buscas algo específico? 🎯
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/categoria/romanticos" className="text-center p-3 rounded-lg hover:bg-indigo-50 transition-colors">
              <div className="text-2xl mb-2">💕</div>
              <div className="text-sm font-medium text-gray-700">Románticos</div>
            </Link>
            <Link href="/categoria/celebraciones" className="text-center p-3 rounded-lg hover:bg-indigo-50 transition-colors">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm font-medium text-gray-700">Celebraciones</div>
            </Link>
            <Link href="/categoria/infantiles" className="text-center p-3 rounded-lg hover:bg-indigo-50 transition-colors">
              <div className="text-2xl mb-2">🧸</div>
              <div className="text-sm font-medium text-gray-700">Infantiles</div>
            </Link>
            <Link href="/categoria/bodas" className="text-center p-3 rounded-lg hover:bg-indigo-50 transition-colors">
              <div className="text-2xl mb-2">💒</div>
              <div className="text-sm font-medium text-gray-700">Bodas</div>
            </Link>
          </div>
        </div>

        {/* Mensaje final divertido */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Si crees que esto es un error, 
            <Link href="/contacto" className="text-indigo-600 hover:text-indigo-800 underline ml-1">
              contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
