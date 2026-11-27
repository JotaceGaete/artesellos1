import Link from "next/link";
import type { ProductPick } from "@/lib/blog";

type Props = {
  products: ProductPick[];
  title?: string;
  subtitle?: string;
};

/** Tarjetas con fotos reales del catálogo. Enlazan a la ficha del producto (enlazado interno). */
export default function ProductPicks({
  products,
  title = "Modelos recomendados para este caso",
  subtitle = "Fotos reales de nuestro catálogo. Elige el cuerpo y nosotros grabamos tu diseño.",
}: Props) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="picks-title" className="not-prose my-14">
      <h2 id="picks-title" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/producto/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex aspect-square items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={`Timbre ${p.name}`}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="mt-1 flex-1 text-sm text-slate-500">{p.note}</p>
                <span className="mt-3 text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
                  Ver modelo →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
