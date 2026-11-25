import type { Metadata } from 'next';
import ConsultasChat from '@/components/ConsultasChat';

export const metadata: Metadata = {
  title: 'Atención al cliente | Artesellos',
  description: 'Consulta precios, modelos, envíos y horarios de Artesellos.',
};

// Altura = pantalla visible menos el encabezado sticky (5rem). Solo el área de mensajes se desplaza.
export default function ConsultasPage() {
  return (
    <main className="h-[calc(100dvh-5rem)] overflow-hidden bg-gray-50 p-2 sm:p-4">
      <h1 className="sr-only">Atención al cliente</h1>
      <ConsultasChat />
    </main>
  );
}
