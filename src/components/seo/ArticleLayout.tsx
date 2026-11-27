import type { ReactNode } from "react";
import Link from "next/link";
import StampCover from "@/components/seo/StampCover";
import TableOfContents from "@/components/seo/TableOfContents";
import ProductPicks from "@/components/seo/ProductPicks";
import CtaBanner from "@/components/seo/CtaBanner";
import BlogCard from "@/components/seo/BlogCard";
import WhatsAppButton from "@/components/seo/WhatsAppButton";
import { PROSE_CLASSES } from "@/components/seo/SeoProse";
import { formatDateEs, relatedPosts, type BlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

type Props = {
  post: BlogPost;
  /** H1 del artículo (puede diferir del título corto del listado) */
  heading: string;
  lead: ReactNode;
  ctaTitle: string;
  ctaMessage: string;
  children: ReactNode;
};

const CONTENT_ID = "contenido-articulo";

export default function ArticleLayout({ post, heading, lead, ctaTitle, ctaMessage, children }: Props) {
  const url = `${SITE_URL}${post.href}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: heading,
      description: post.excerpt,
      image: [post.ogImage],
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      inLanguage: "es-CL",
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Artesellos", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "Artesellos",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/artesellos-logo.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cabecera */}
      <header className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <nav aria-label="Ruta de navegación" className="text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-indigo-700">Inicio</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/blog" className="hover:text-indigo-700">Blog</Link></li>
              <li aria-hidden className="hidden sm:block">/</li>
              <li className="hidden truncate text-slate-400 sm:block" aria-current="page">{post.title}</li>
            </ol>
          </nav>
          <span className="mt-6 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
            {post.category}
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">{lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">A</span>
              <span className="font-semibold text-slate-700">Equipo Artesellos</span>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={post.dateModified}>Actualizado el {formatDateEs(post.dateModified)}</time>
            <span aria-hidden>·</span>
            <span>{post.readMinutes} min de lectura</span>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <figure className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-indigo-900/5">
            <StampCover {...post.cover} />
          </figure>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14 lg:px-8">
        <article>
          <div id={CONTENT_ID} className={PROSE_CLASSES}>
            {children}
          </div>
          <ProductPicks products={post.products} />
          <CtaBanner title={ctaTitle} message={ctaMessage} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-8">
            <TableOfContents containerId={CONTENT_ID} />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-bold text-slate-900">¿Necesitas un timbre?</p>
              <p className="mt-1 text-sm text-slate-600">Te asesoramos sin costo y cotizas en minutos.</p>
              <WhatsAppButton message={ctaMessage} className="mt-4 w-full !px-4 !py-2.5 text-sm">
                WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </aside>
      </div>

      {/* Relacionados */}
      <section aria-labelledby="relacionados" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 id="relacionados" className="text-2xl font-extrabold tracking-tight text-slate-900">
            Sigue leyendo
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {relatedPosts(post.slug).map((p) => (
              <BlogCard key={p.slug} post={p} headingLevel="h3" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
