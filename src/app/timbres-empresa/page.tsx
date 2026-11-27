import type { Metadata } from "next";
import Link from "next/link";
import StampCover from "@/components/seo/StampCover";
import CtaBanner from "@/components/seo/CtaBanner";
import ProductPicks from "@/components/seo/ProductPicks";
import { PRODUCTS } from "@/lib/blog";
import SeoProse from "@/components/seo/SeoProse";

export const metadata: Metadata = {
  title: "Timbres para empresa en Chile | Sellos corporativos",
  description:
    "Timbres de goma para empresas: razón social, RUT, firmas y documentación. Fabricación en Chile con asesoría y despacho.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/timbres-empresa" },
};

export default function TimbresEmpresaPage() {
  return (
    <SeoProse>
      <h1 className="!mb-6 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
        Timbres para empresa: orden, trazabilidad y presencia de marca
      </h1>
      <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">
        Sellos corporativos para documentos, bodega y atención al cliente, fabricados con estándares
        de legibilidad y durabilidad.
      </p>
      <figure className="not-prose my-10 overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-indigo-900/5">
        <StampCover
          title="Ilustración de un timbre corporativo con datos de empresa"
          lines={["EMPRESA SpA", "RUT 76.123.456-7", "Av. Providencia 123"]}
          shape="rect"
          tone="indigo"
        />
      </figure>

      <h2>Por qué un timbre empresa sigue siendo herramienta clave</h2>
      <p>
        En la operación diaria de una compañía chilena, el <strong>timbre empresa</strong> agiliza
        flujos que aún dependen de papel: órdenes de compra internas, comprobantes físicos,
        recepción de mercadería y autorizaciones en terreno. Aunque la facturación electrónica
        creció, muchos procesos siguen requiriendo una marca visible que avale quién revisó,
        aprobó o recibió un documento. Un sello bien diseñado reduce fricción y evita firmas
        ilegibles cuando hay que moverse rápido entre bodega y oficina.
      </p>
      <p>
        El beneficio no es solo velocidad: también hay control. Al estandarizar un bloque con razón
        social, sucursal o nombre del cargo, disminuyes errores de transcripción y refuerzas
        políticas internas de documentación. Para equipos distribuidos en varias ciudades, replicar
        el mismo diseño en todos los sellos mantiene coherencia frente a clientes y auditores.
      </p>
      <p>
        Además, el timbre refuerza branding en puntos de contacto físicos: sobres, etiquetas de
        devolución, embalajes o tarjetas de garantía. Es un complemento accesible frente a otros
        activos impresos y se integra con flujos donde una impresora no está disponible o no es
        práctica.
      </p>

      <h2>Datos habituales y cumplimiento de buena lectura</h2>
      <p>
        Un <strong>timbre empresa Chile</strong> suele incluir razón social, giro resumido, dirección
        y vías de contacto. Cuando corresponde, se suma el RUT en formato legible y, en ciertos
        casos, la firma o el nombre del representante. No todos los formatos son obligatorios para
        cada trámite: depende del tipo de documento y del flujo interno; por eso conviene definir con
        tu área contable o legal qué líneas son prioritarias antes de grabar el caucho.
      </p>
      <p>
        La legibilidad es el criterio central: un texto denso en un sello pequeño puede perder
        contraste. Trabajamos con tipografías adecuadas al tamaño final y sugerimos jerarquías
        visuales para que lo más importante se lea primero. Si necesitas un enfoque específico para
        identificación tributaria, revisa la página de{" "}
        <Link href="/timbre-rut">timbre RUT</Link>, donde detallamos qué datos suelen incluirse y
        cómo combinarlos con sellos complementarios.
      </p>
      <p>
        Para negocios con varias líneas de producto, a veces conviene más de un sello: uno mínimo
        para facturas y otro para logística. Esta separación evita saturar un único diseño y permite
        cambiar tintas o formatos sin detener la operación. En Artesellos te ayudamos a dimensionar
        cada bloque según uso real y frecuencia de estampado.
      </p>

      <h2>Proceso con Artesellos y canales de cotización</h2>
      <p>
        Cotizar es simple: comparte el contenido, el tamaño aproximado y si requieres montaje
        manual o automático. Si buscas inspiración, visita{" "}
        <Link href="/sellos-para-negocios">sellos para negocios</Link> y conecta el sello con
        escenarios de retail o servicios. También puedes apoyarte en guías del blog, como{" "}
        <Link href="/blog/como-hacer-un-timbre-de-empresa">cómo hacer un timbre de empresa</Link>,
        para ordenar requisitos antes de enviar archivos.
      </p>
      <p>
        Fabricamos en Chile con foco en calidad de grabado y tiempos de entrega realistas. Si
        necesitas volumen para varias sucursales o un diseño que escale a futuras reposiciones,
        lo documentamos para que futuras compras sean consistentes. Escríbenos y coordinemos una
        propuesta alineada a tu calendario operativo.
      </p>

      <ProductPicks products={[PRODUCTS.trodat4915, PRODUCTS.trodat4912, PRODUCTS.trodat9511]} />

      <CtaBanner
        title="Cotiza sellos corporativos con asesoría"
        message="Hola, necesito timbres para mi empresa en Chile. ¿Pueden asesorarme?"
      />
    </SeoProse>
  );
}
