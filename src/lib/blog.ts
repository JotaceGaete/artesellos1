import type { StampCoverTone } from "@/components/seo/StampCover";

export type ProductPick = {
  slug: string;
  name: string;
  image: string;
  note: string;
};

export type Cover = {
  title: string;
  lines: string[];
  shape: "round" | "rect";
  tone: StampCoverTone;
};

export type BlogPost = {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  datePublished: string;
  dateModified: string;
  cover: Cover;
  /** Foto real para compartir en redes (og:image). Debe ser JPG/PNG/WebP, no SVG. */
  ogImage: string;
  products: ProductPick[];
};

/** Fotos reales del catálogo (media.artesellos.cl). Si un modelo se retira, quitarlo aquí. */
export const PRODUCTS = {
  trodat4912: {
    slug: "trodat-4912",
    name: "Trodat 4912",
    image: "https://media.artesellos.cl/Trodat4912/Modelo-4912-Dentista.jpg",
    note: "Automático para datos de empresa o profesional",
  },
  trodat4915: {
    slug: "trodat-4915",
    name: "Trodat 4915",
    image:
      "https://ueannxyewstuptivnzjf.supabase.co/storage/v1/object/public/product-images/1779554293651-8x8b9ivqke.jpg",
    note: "Formato mayor para más líneas o logo",
  },
  printy3911: {
    slug: "trodat-printy-3911",
    name: "Trodat Printy 3911",
    image: "https://media.artesellos.cl/printy-trodat-3911-placa-de-38x14-mm.webp",
    note: "Compacto, ideal para nombre y RUT",
  },
  trodat9511: {
    slug: "trodat-9511",
    name: "Trodat 9511",
    image: "https://media.artesellos.cl/Trodat%209511/trodat-9511-base.png",
    note: "Metálico, para uso intensivo",
  },
  automatik913: {
    slug: "automatik-913",
    name: "Automatik 913",
    image: "https://media.artesellos.cl/automatik-913.png",
    note: "Automático de uso diario",
  },
  traxx9045: {
    slug: "traxx-9045",
    name: "Traxx 9045",
    image: "https://media.artesellos.cl/modelos/Traxx%209045-redondo.jpg",
    note: "Redondo, ideal para logos",
  },
  shiny829: {
    slug: "shiny-829-fechador",
    name: "Shiny 829 Fechador",
    image: "https://media.artesellos.cl/Shiny-829/shiny-829-fechador.png",
    note: "Fecha ajustable para recepción de documentos",
  },
  shinyS723: {
    slug: "shiny-s-723",
    name: "Shiny S-723",
    image: "https://media.artesellos.cl/modelos/s-723-colores.png",
    note: "Bolsillo, disponible en varios colores",
  },
} satisfies Record<string, ProductPick>;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-hacer-un-timbre-de-empresa",
    href: "/blog/como-hacer-un-timbre-de-empresa",
    title: "Cómo hacer un timbre de empresa paso a paso",
    excerpt:
      "Requisitos de diseño, datos que incluir y cómo preparar archivos para un timbre corporativo profesional.",
    category: "Guía práctica",
    readMinutes: 6,
    datePublished: "2026-03-22",
    dateModified: "2026-11-27",
    cover: {
      title: "Ilustración de un timbre de empresa con razón social y RUT",
      lines: ["TU EMPRESA SpA", "RUT 76.123.456-7", "Santiago · Chile"],
      shape: "rect",
      tone: "indigo",
    },
    ogImage: PRODUCTS.trodat4912.image,
    products: [PRODUCTS.trodat4912, PRODUCTS.trodat4915, PRODUCTS.printy3911],
  },
  {
    slug: "cuanto-cuesta-un-timbre-en-chile",
    href: "/blog/cuanto-cuesta-un-timbre-en-chile",
    title: "Cuánto cuesta un timbre en Chile: guía de referencia",
    excerpt: "Factores que influyen en el precio, formatos y consejos para cotizar sin sorpresas.",
    category: "Precios",
    readMinutes: 5,
    datePublished: "2026-03-22",
    dateModified: "2026-11-27",
    cover: {
      title: "Ilustración de un sello redondo con la palabra cotización",
      lines: ["COTIZA", "SIN SORPRESAS"],
      shape: "round",
      tone: "amber",
    },
    ogImage: PRODUCTS.printy3911.image,
    products: [PRODUCTS.printy3911, PRODUCTS.automatik913, PRODUCTS.trodat9511],
  },
  {
    slug: "tipos-de-timbres",
    href: "/blog/tipos-de-timbres",
    title: "Tipos de timbres: manual, automático y más",
    excerpt:
      "Comparación práctica para elegir entre sellos de goma, montajes y usos recomendados.",
    category: "Comparativa",
    readMinutes: 6,
    datePublished: "2026-03-22",
    dateModified: "2026-11-27",
    cover: {
      title: "Ilustración de un sello de estado con la palabra recibido",
      lines: ["RECIBIDO", "CONFORME"],
      shape: "round",
      tone: "emerald",
    },
    ogImage: PRODUCTS.shiny829.image,
    products: [PRODUCTS.automatik913, PRODUCTS.shiny829, PRODUCTS.traxx9045],
  },
];

export function getPost(slug: string): BlogPost {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Post de blog no registrado: ${slug}`);
  return post;
}

export function relatedPosts(slug: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== slug);
}

export function formatDateEs(iso: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** Metadata SEO de un post: canonical, Open Graph tipo artículo y foto real para compartir. */
export function postMetadata(slug: string, meta: { title: string; description: string }) {
  const post = getPost(slug);
  return {
    title: meta.title,
    description: meta.description,
    robots: { index: true, follow: true },
    alternates: { canonical: post.href },
    openGraph: {
      type: "article" as const,
      locale: "es_CL",
      url: post.href,
      title: meta.title,
      description: meta.description,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      images: [{ url: post.ogImage, alt: post.title }],
    },
    twitter: { card: "summary_large_image" as const, title: meta.title, description: meta.description, images: [post.ogImage] },
  };
}
