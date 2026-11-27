"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string };

/** Índice del artículo: lee los h2 con id del contenido y marca la sección visible. */
export default function TableOfContents({ containerId }: { containerId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const heads = Array.from(root.querySelectorAll<HTMLHeadingElement>(":scope > h2[id]"));
    setItems(heads.map((h) => ({ id: h.id, label: h.textContent ?? "" })));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [containerId]);

  if (!items.length) return null;

  return (
    <nav aria-label="Contenido del artículo">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">En este artículo</p>
      <ol className="mt-4 space-y-1 border-l border-slate-200">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition ${
                active === it.id
                  ? "border-indigo-600 font-semibold text-indigo-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
