import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Aquí cargamos el componente del chat que creamos antes */}
      <ChatInterface />
    </main>
  );
}