import type { Metadata } from "next";
import BlogCard from "@/components/seo/BlogCard";
import CtaBanner from "@/components/seo/CtaBanner";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog | Guías sobre timbres y sellos en Chile",
  description:
    "Artículos sobre timbres de goma, costos en Chile, tipos de sellos y buenas prácticas para empresas y emprendedores.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/blog",
    title: "Blog Artesellos | Guías sobre timbres y sellos en Chile",
    description:
      "Guías prácticas sobre timbres de goma, costos y tipos de sellos para negocios en Chile.",
    images: [{ url: BLOG_POSTS[0].ogImage }],
  },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = BLOG_POSTS;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Artesellos",
    url: `${SITE_URL}/blog`,
    inLanguage: "es-CL",
    blogPost: BLOG_POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}${p.href}`,
      datePublished: p.datePublished,
      dateModified: p.dateModified,
      image: p.ogImage,
    })),
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[22px] border-indigo-100" />
        <div aria-hidden className="pointer-events-none absolute right-40 top-40 h-24 w-24 rounded-full border-[8px] border-indigo-100" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
            Blog Artesellos
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Guías sobre timbres y sellos en Chile
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Guías prácticas sobre timbres de goma, costos y tipos de sellos para negocios en Chile,
            escritas por quienes los fabrican todos los días.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <BlogCard post={featured} featured />
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
        <CtaBanner
          title="¿Prefieres que te asesoremos directo?"
          message="Hola Artesellos, leí su blog y quiero cotizar un timbre."
        />
      </main>
    </div>
  );
}
