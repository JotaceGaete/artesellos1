import Link from 'next/link';

const cards = [
  {
    href: '/admin/productos',
    icon: '📦',
    title: 'Productos',
    description: 'Ver, editar y gestionar el catálogo completo',
    color: 'indigo',
  },
  {
    href: '/admin/productos/nuevo',
    icon: '➕',
    title: 'Nuevo producto',
    description: 'Crear un producto desde cero',
    color: 'emerald',
  },
  {
    href: '/admin/knowledge-base',
    icon: '🧠',
    title: 'Base de conocimiento',
    description: 'Gestionar fragmentos del chatbot',
    color: 'amber',
  },
  {
    href: '/',
    icon: '🌐',
    title: 'Ver sitio',
    description: 'Abrir el catálogo público',
    color: 'gray',
    external: true,
  },
];

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200',
  gray: 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300',
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenido. ¿Qué quieres hacer hoy?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            target={card.external ? '_blank' : undefined}
            className={`flex items-start gap-4 p-5 rounded-xl border transition-all hover:shadow-sm ${colorMap[card.color]}`}
          >
            <span className="text-2xl">{card.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{card.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
