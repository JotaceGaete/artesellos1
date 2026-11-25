import type { Metadata } from 'next';
import ConsultasChat from '@/components/ConsultasChat';

export const metadata: Metadata = {
  title: 'Atención al cliente | Artesellos',
  description: 'Consulta precios, modelos, envíos y horarios de Artesellos.',
};

export default function ConsultasPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Atención al cliente</h1>
      <ConsultasChat />
    </main>
  );
}
