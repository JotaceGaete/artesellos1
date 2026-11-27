import Link from "next/link";
import StampCover from "@/components/seo/StampCover";
import type { BlogPost } from "@/lib/blog";

export default function BlogCard({ post, featured = false, headingLevel = "h2" }: { post: BlogPost; featured?: boolean; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article
      className={`group relative flex h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? "flex-col lg:flex-row" : "flex-col"
      }`}
    >
      <div className={`overflow-hidden ${featured ? "lg:w-3/5" : ""}`}>
        <StampCover {...post.cover} className="transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "lg:justify-center lg:p-10" : ""}`}>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{post.category}</span>
          <span className="text-slate-400">{post.readMinutes} min de lectura</span>
        </div>
        <H className={`mt-4 font-extrabold tracking-tight text-slate-900 ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          <Link href={post.href} className="after:absolute after:inset-0 group-hover:text-indigo-700">
            {post.title}
          </Link>
        </H>
        <p className="mt-3 flex-1 text-slate-600">{post.excerpt}</p>
        <span className="mt-5 text-sm font-bold text-indigo-600">Leer artículo →</span>
      </div>
    </article>
  );
}
