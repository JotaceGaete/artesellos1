import type { ReactNode } from "react";

/** Tipografía de lectura compartida por blog y landings SEO. */
export const PROSE_CLASSES = [
  "text-[1.0625rem] leading-8 text-slate-700",
  "[&>p]:mb-6",
  "[&>h2]:mt-14 [&>h2]:mb-5 [&>h2]:scroll-mt-28 [&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:leading-tight [&>h2]:tracking-tight [&>h2]:text-slate-900 sm:[&>h2]:text-[1.75rem]",
  "[&>h2]:border-l-4 [&>h2]:border-indigo-500 [&>h2]:pl-4",
  "[&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900",
  "[&_strong]:font-semibold [&_strong]:text-slate-900",
  "[&>ul]:mb-6 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6 [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-6 [&>ul>li]:pl-1 [&>ol>li]:pl-1 [&_li::marker]:text-indigo-500",
  "[&_:is(p,li)>a]:font-medium [&_:is(p,li)>a]:text-indigo-700 [&_:is(p,li)>a]:underline [&_:is(p,li)>a]:decoration-indigo-300 [&_:is(p,li)>a]:decoration-2 [&_:is(p,li)>a]:underline-offset-4 hover:[&_:is(p,li)>a]:decoration-indigo-600",
].join(" ");

function SeoProse({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className={PROSE_CLASSES}>{children}</div>
    </div>
  );
}

export default SeoProse;
