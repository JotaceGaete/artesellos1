import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contacto - Artesellos',
  description: 'Contáctanos para resolver tus dudas sobre timbres personalizados, pedidos y servicios.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contacto
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes dudas sobre nuestros timbres personalizados? 
            Estamos aquí para ayudarte. Envianos tu consulta y te responderemos a la brevedad.
            Puedes Contactarnos por WhatsApp
		  </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Formulario de contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Envianos tu consulta
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Información de contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Información de contacto
              </h2>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">E-mail</p>
                    <a
                      href="mailto:artesellos@outlook.com"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      artesellos@outlook.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Consultas generales y mayoristas
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                    <a
                      href="https://wa.me/56922384216"
                      className="text-green-600 hover:text-green-500 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +56 9 22384216
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Lunes a Viernes: 9:30 - 17:00
                    </p>
                  </div>
                </div>

                {/* Horario de atención */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Horario de atención</p>
                    <p className="text-sm text-gray-700">
                      Lunes a Viernes: 9:30 - 17:00
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Respuestas dentro de 30 minutos
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Ubicación</p>
                    <p className="text-sm text-gray-700">
                      Coronel, Chile
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Envíos desde Santiago o Coronel según la zona del país
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nuestra Ubicación
              </h3>
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-73.1562860%2C-37.0392160%2C-73.1362860%2C-37.0192160&layer=mapnik&marker=-37.0292160,-73.1462860"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Artesellos en Coronel, Chile"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                <a 
                  href="https://www.openstreetmap.org/?mlat=-37.0292160&mlon=-73.1462860#map=16/-37.0292160/-73.1462860"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Ver mapa más grande
                </a>
              </p>
            </div>

            {/* FAQ rápido */}
            <div className="bg-indigo-50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                Preguntas frecuentes
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-indigo-800">¿Cuánto demora mi pedido?</p>
                  <p className="text-indigo-700">Entre 1 y 2 días hábiles </p>
                </div>
                <div>
                  <p className="font-medium text-indigo-800">¿Hacen envíos a regiones?</p>
                  <p className="text-indigo-700">Sí, enviamos a todo Chile por Chilexpress, Starken o Bluexpress  </p>
                </div>
                <div>
                  <p className="font-medium text-indigo-800">¿Puedo personalizar mi timbre?</p>
                  <p className="text-indigo-700">¡Por supuesto! Texto, tamaño y colores a tu medida.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}