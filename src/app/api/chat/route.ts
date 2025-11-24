import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 30;

// Función para formatear resultados de productos
function formatProductResults(data: any[]) {
  let respuesta = '\n\n📦 **Encontré estos productos:**\n\n';
  
  for (const item of data) {
    respuesta += `### **${item.marca} ${item.modelo}** - ${item.color}\n\n`;
    respuesta += `- **Medidas:** ${item.ancho_mm}x${item.alto_mm}mm\n`;
    respuesta += `- **Categoría:** ${item.categoria}\n`;
    
    if (item.precio && item.precio > 0) {
      respuesta += `- **Precio:** $${item.precio.toLocaleString('es-CL')}\n`;
    }
    
    // Mostrar disponibilidad SIN cantidades específicas
    if (item.stock > 0) {
      respuesta += `- **Disponibilidad:** ✅ Stock disponible\n`;
    } else {
      respuesta += `- **Disponibilidad:** ⚠️ Sin stock\n`;
    }
    
    // Agregar imagen si existe
    if (item.imagen_url) {
      respuesta += `\n![${item.marca} ${item.modelo} ${item.color}](${item.imagen_url})\n`;
    }
    respuesta += '\n---\n\n';
  }
  
  respuesta += '\n💬 **¿Necesitas más información sobre alguno de estos modelos?**';
  return respuesta;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const systemPrompt = `Eres un asistente experto de Artesellos, especialista en timbres personalizados.
    
INFORMACIÓN DEL NEGOCIO:
- Ubicación: Centro de Santiago, Providencia, Chile
- Horarios: Lunes a Viernes 9:00-18:00, Sábados 10:00-14:00
- Contacto: WhatsApp disponible para consultas rápidas
- Email: contacto@artesellos.cl
- Envíos a todo Chile

PRODUCTOS PRINCIPALES:
- Shiny 722: Modelo de bolsillo (14x38mm), ideal para profesionales
- Trodat 4912: Timbre automático estándar
- Automáticos de diferentes tamaños
- Personalizaciones con diseños custom

IMPORTANTE: Cuando el usuario pregunte por un producto específico, DEBES usar la función consultarStock para obtener información real del inventario.

💸 REGLA DE COBRO Y PAGOS (IMPORTANTE):

Si el cliente confirma que quiere comprar una cantidad específica (ej: "quiero 3 de esos"):

1. Calcula mentalmente el total (Precio Unitario x Cantidad).

2. Genera el link de pago usando este formato EXACTO:

   https://artesellos.cl/pagar?monto=[MONTO_TOTAL]&detalle=[CANTIDAD]_x_[NOMBRE_PRODUCTO]

Ejemplo: Si quiere 2 Shiny 722 ($15.000 c/u), el total es 30000.

Responde: "¡Perfecto! El total por los 2 Shiny 722 es de **$30.000**.

Para finalizar, ingresa aquí para ver los datos de transferencia o pagar con tarjeta:
👉 [Ir a Pagar](https://artesellos.cl/pagar?monto=30000&detalle=2_x_Shiny_722)"

Tu trabajo es ayudar a los clientes con:
- Información sobre modelos de timbres (USA consultarStock)
- Características y medidas
- Procesos de personalización
- Información de envíos
- Horarios y contacto
- Generar links de pago cuando el cliente confirme la compra

Sé amable, profesional y servicial.`;

    const lastMessage = messages[messages.length - 1]?.content || '';
    console.log('📨 Mensaje recibido:', lastMessage);

    // Detectar menciones de productos para forzar búsqueda
    const productKeywords = ['shiny', 'trodat', '722', '723', '4912', '9511', 'timbre', 'sello', 'automático'];
    const shouldSearchProduct = productKeywords.some(keyword => 
      lastMessage.toLowerCase().includes(keyword)
    );

    console.log('🔍 ¿Buscar producto?', shouldSearchProduct);

    let responseContent = '';

    // Si detectamos mención de producto, buscar directamente
    if (shouldSearchProduct) {
      console.log('⚡ Búsqueda directa activada');
      
      // Extraer término de búsqueda (buscar números de modelo y marcas)
      let searchTerm = lastMessage.toLowerCase();
      
      // Intentar extraer el modelo específico (números como 722, 4912, etc)
      const modelMatch = searchTerm.match(/\b(shiny|trodat|automatik)\s*\d+\b/i);
      if (modelMatch) {
        searchTerm = modelMatch[0];
      } else {
        // Si no encontramos modelo específico, buscar por palabras clave
        const keywords = searchTerm.match(/\b(shiny|trodat|automatik|automático|timbre|sello)\b/gi);
        if (keywords && keywords.length > 0) {
          searchTerm = keywords[0];
        }
      }
      
      console.log('🔎 Término de búsqueda:', searchTerm);
      
      // Separar marca y modelo si están juntos
      const parts = searchTerm.split(/\s+/);
      let query = supabase.from('stock_timbres').select('*');
      
      // Si tenemos "shiny 722", buscar marca=shiny AND modelo=722
      if (parts.length === 2 && /^\d+$/.test(parts[1])) {
        const marca = parts[0];
        const modelo = parts[1];
        console.log('🔍 Búsqueda específica:', { marca, modelo });
        query = query.ilike('marca', `%${marca}%`).ilike('modelo', `%${modelo}%`);
      } else {
        // Búsqueda general
        query = query.or(`marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query
        .order('stock', { ascending: false })
        .limit(5);
      
      console.log('📦 Resultados BD:', { found: data?.length || 0, error: error?.message });
      
      if (!error && data && data.length > 0) {
        responseContent = formatProductResults(data);
      } else {
        // Si no encontramos, usar OpenAI como fallback
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content
            }))
          ],
        });
        responseContent = completion.choices[0].message.content || 'No encontré información sobre ese producto.';
      }
    } else {
      // Consulta normal con OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.content
          }))
        ],
      });
      responseContent = completion.choices[0].message.content || '';
    }


    // Enviar respuesta como stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        try {
          const data = JSON.stringify({ content: responseContent });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error en stream:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({ error: "Error conectando con IA", details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
