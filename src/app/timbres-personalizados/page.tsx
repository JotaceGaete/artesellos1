import type { Metadata } from "next";
import Link from "next/link";
import StampCover from "@/components/seo/StampCover";
import CtaBanner from "@/components/seo/CtaBanner";
import ProductPicks from "@/components/seo/ProductPicks";
import { PRODUCTS } from "@/lib/blog";
import SeoProse from "@/components/seo/SeoProse";

export const metadata: Metadata = {
  title: "Timbres personalizados de goma en Chile",
  description:
    "Timbres personalizados de goma con diseño a medida, asesoría y despacho en Chile. Ideal para marcas, oficinas y emprendimientos.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/timbres-personalizados" },
};

export default function TimbresPersonalizadosPage() {
  return (
    <SeoProse>
      <h1 className="!mb-6 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
        Timbres personalizados de goma: diseño, calidad y versatilidad
      </h1>
      <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">
        Fabricación de sellos de caucho a medida para que tu marca se vea igual de bien en el papel
        que en pantalla.
      </p>
      <figure className="not-prose my-10 overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-indigo-900/5">
        <StampCover
          title="Ilustración de un timbre personalizado con logo"
          lines={["TU LOGO", "HECHO A MANO"]}
          shape="round"
          tone="rose"
        />
      </figure>

      <h2>Qué son los timbres personalizados y cuándo convienen</h2>
      <p>
        Los <strong>timbres personalizados</strong> son sellos de goma grabados según tu arte
        final: logo, texto jurídico, íconos o combinaciones. A diferencia de productos genéricos, el
        grabado se ajusta a tu línea gráfica, grosor de trazo y nivel de detalle que necesitas en
        facturas, sobres, etiquetas o tarjetas de agradecimiento. En Chile, pymes y profesionales
        independientes los usan para estandarizar documentos sin depender siempre de impresoras
        costosas o plazos de imprenta para volúmenes pequeños.
      </p>
      <p>
        Un buen timbre de goma entrega miles de impresiones nítidas si se cuida la profundidad del
        grabado y el contraste del diseño. Por eso, antes de producir, revisamos que los textos
        pequeños sean legibles y que no existan trazos imposibles de reproducir en caucho. Si vienes
        desde un archivo vectorial, el proceso es más directo; si partes de una imagen, podemos
        vectorizar o simplificar para que el resultado sea homogéneo en cada uso.
      </p>
      <p>
        También importa el contexto: un emprendimiento de cosmética puede priorizar un sello
        redondo para packaging, mientras que una oficina contable requiere bloques rectangulares con
        varias líneas de datos. En ambos casos, la personalización permite alinear color de tinta,
        tamaño del mango y tipo de entintado con la rutina real de tu equipo.
      </p>

      <h2>Materiales, tamaños y buenas prácticas de uso</h2>
      <p>
        Los <Link href="/">timbres de goma</Link> tradicionales montados en madera o soporte
        económico son excelentes para trabajos manuales y mesones de atención. Si necesitas
        productividad y alineación constante, conviene evaluar opciones automáticas; en Artesellos
        puedes revisar <Link href="/timbres-automaticos">timbres automáticos</Link> para entender
        diferencias de ergonomía y reposición de tinta.
      </p>
      <p>
        El tamaño del sello debe equilibrar legibilidad y espacio disponible en tus documentos. Un
        formato demasiado compacto puede perder detalle en RUT o razón social; uno muy grande no
        siempre cabe en recuadros preimpresos. Te recomendamos medir el área útil donde estamparás y,
        si corresponde, dejar márgenes para sellos secundarios como &quot;Pagado&quot; o
        &quot;Recibido&quot;.
      </p>
      <p>
        Para marcas que venden en ferias o envían cajas por courier, un timbre personalizado refuerza
        la identidad en cada entrega. Puedes combinarlo con stickers impresos o cintas, pero el sello
        aporta un toque artesanal y controlable: cambias de tinta, ajustas presión y sigues operando
        sin recargar planillas de impresión. Además, al ser un objeto físico duradero, se convierte
        en una herramienta de trabajo cotidiano para todo el staff.
      </p>

      <h2>Cómo cotizar y qué información enviar</h2>
      <p>
        Para avanzar rápido, envíanos el texto exacto, el tamaño aproximado en centímetros y, si
        existe, tu manual de marca. Si necesitas un <Link href="/timbre-rut">timbre RUT</Link> o un
        bloque corporativo más completo, indica también el grosor de línea preferido y si requieres
        íconos o marcas de agua visuales. Con eso prepararemos una propuesta clara de grabado y
        plazos de entrega, con alternativas de despacho dentro de Chile.
      </p>
      <p>
        Nuestro foco es que el timbre se vea profesional en la primera prueba y se mantenga estable
        en el tiempo. Por eso documentamos el diseño aprobado y te orientamos en el cuidado del
        caucho, almacenamiento y recarga de tinta. Explora además el{" "}
        <Link href="/blog/tipos-de-timbres">blog sobre tipos de timbres</Link> para comparar formatos
        antes de decidir.
      </p>

      <ProductPicks products={[PRODUCTS.traxx9045, PRODUCTS.shinyS723, PRODUCTS.automatik913]} />

      <CtaBanner
        title="¿Listo para tu timbre a medida?"
        message="Hola, quiero cotizar timbres personalizados de goma."
      />
    </SeoProse>
  );
}
