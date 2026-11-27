import Link from "next/link";
import WhatsAppButton from "@/components/seo/WhatsAppButton";

type Props = {
  title: string;
  text?: string;
  message: string;
};

export default function CtaBanner({ title, text, message }: Props) {
  return (
    <aside className="not-prose relative my-14 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-8 text-white shadow-lg sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[14px] border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full border-[10px] border-white/10" />
      <p className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</p>
      <p className="relative mt-2 max-w-xl text-indigo-100">
        {text ?? "Te ayudamos a elegir formato y diseño. Respuesta rápida por WhatsApp, despacho a todo Chile."}
      </p>
      <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <WhatsAppButton message={message}>Cotizar por WhatsApp</WhatsAppButton>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center rounded-md border-2 border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          Ver catálogo
        </Link>
      </div>
    </aside>
  );
}
