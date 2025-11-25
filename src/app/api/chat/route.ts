import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { findRelevantContext } from '@/lib/vectorSearch';

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
    
    // Mostrar disponibilidad CON cantidades específicas
    if (item.stock > 0) {
      respuesta += `- **Disponibilidad online:** ✅ **${item.stock} unidades**\n`;
    } else {
      respuesta += `- **Disponibilidad online:** ⚠️ Consultar disponibilidad\n`;
    }
    
    // Agregar imagen si existe
    if (item.imagen_url) {
      respuesta += `\n![${item.marca} ${item.modelo} ${item.color}](${item.imagen_url})\n`;
    }
    respuesta += '\n---\n\n';
  }
  
  respuesta += '\n💬 **¿Necesitas más información sobre alguno de estos modelos?**\n\n';
  respuesta += '_💡 Nota: Nuestra tienda física en el centro de Santiago cuenta con mayor stock. Para cantidades mayores o productos específicos, contáctanos directamente._';
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

⚠️ IMPORTANTE SOBRE STOCK:
- Las cantidades mostradas son para COMPRA ONLINE inmediata
- SIEMPRE menciona: "Nuestra tienda física cuenta con mayor stock disponible"
- Para pedidos grandes o consultas especiales, invita a contactar directamente
- NO reveles el stock exacto total del negocio por razones de competencia

MARCAS DISPONIBLES:
- **Shiny**: Marca premium de timbres (ej: Shiny 722, Shiny 829)
- **Trodat**: Marca reconocida mundialmente (ej: Trodat 4912)
- **Automatik**: Marca especializada en timbres automáticos (¡NO confundir con "automáticos"!)

PRODUCTOS PRINCIPALES:
- Shiny 722: Modelo de bolsillo (14x38mm), ideal para profesionales
- Trodat 4912: Timbre automático estándar
- Automatik: Línea completa de timbres automáticos
- Personalizaciones con diseños custom

⚠️ IMPORTANTE: "Automatik" es el NOMBRE DE UNA MARCA, no un tipo de timbre.

IMPORTANTE: Cuando el usuario pregunte por un producto específico, DEBES usar la función consultarStock para obtener información real del inventario.

💸 REGLA DE COBRO Y PAGOS (CRÍTICO - VALIDAR STOCK):

⚠️ ANTES DE CALCULAR CUALQUIER TOTAL, DEBES VERIFICAR EL STOCK DISPONIBLE.

Si el cliente confirma que quiere comprar una cantidad específica (ej: "quiero 100 de esos"):

**PASO 1: VALIDAR STOCK**
- Verifica cuántas unidades hay disponibles
- Si la cantidad solicitada > stock disponible:
  ❌ NO GENERES EL LINK DE PAGO
  ✅ Informa: "Lo siento, actualmente tenemos solo [X] unidades disponibles del [PRODUCTO]."
  ✅ Ofrece: "¿Te gustaría comprar las [X] unidades disponibles o prefieres consultar por otros modelos?"

**PASO 2: SI HAY STOCK SUFICIENTE**
1. Calcula el total (Precio Unitario x Cantidad).
2. Genera el link de pago con este formato EXACTO:
   https://artesellos.cl/pagar?monto=[MONTO_TOTAL]&detalle=[CANTIDAD]_x_[NOMBRE_PRODUCTO]

Ejemplo con stock suficiente:
Usuario: "Quiero 2 Shiny 722"
Stock disponible: 15 unidades
Precio: $15.000 c/u
Respuesta: "¡Perfecto! Tenemos stock disponible. El total por los 2 Shiny 722 es de **$30.000**.

Para finalizar, ingresa aquí para ver los datos de transferencia o pagar con tarjeta:
👉 [Ir a Pagar](https://artesellos.cl/pagar?monto=30000&detalle=2_x_Shiny_722)"

Ejemplo con stock insuficiente:
Usuario: "Quiero 100 Trodat 4912"
Stock disponible: 8 unidades
Respuesta: "Lo siento, actualmente tenemos solo **8 unidades** disponibles del Trodat 4912. ¿Te gustaría comprar las 8 unidades disponibles ($[PRECIO_TOTAL]) o prefieres consultar por otros modelos similares?"

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

    // RAG: Buscar contexto relevante en la base de conocimiento
    let ragContext = '';
    try {
      const relevantContexts = await findRelevantContext(lastMessage, 0.7, 5);
      if (relevantContexts.length > 0) {
        ragContext = '\n\n📚 CONTEXTO RELEVANTE DE LA BASE DE CONOCIMIENTO:\n\n' + 
                     relevantContexts.join('\n\n---\n\n') + 
                     '\n\n⚠️ IMPORTANTE: Responde la siguiente pregunta basándote SOLO en el contexto proporcionado arriba y en la información del sistema.';
        console.log('✅ Contexto RAG recuperado:', relevantContexts.length, 'fragmentos');
      } else {
        console.log('ℹ️ No se encontró contexto relevante en la base de conocimiento');
      }
    } catch (error) {
      console.error('⚠️ Error al recuperar contexto RAG:', error);
      // Continuar sin contexto RAG si hay error
    }

    // Normalizar variantes de marcas (corregir errores comunes)
    const normalizeBrand = (text: string): string => {
      let normalized = text.toLowerCase();
      // Corregir "automatk" o "automátik" → "automatik"
      normalized = normalized.replace(/\bautomatk\b/gi, 'automatik');
      normalized = normalized.replace(/\bautomátik\b/gi, 'automatik');
      normalized = normalized.replace(/\bautomatick\b/gi, 'automatik');
      return normalized;
    };

    // Detectar solicitudes de compra con cantidad
    const purchasePattern = /\b(?:quiero|necesito|comprar|llevo|dame)\s+(\d+)/i;
    const purchaseMatch = lastMessage.match(purchasePattern);
    const isPurchaseRequest = purchaseMatch !== null;
    const requestedQuantity = purchaseMatch ? parseInt(purchaseMatch[1]) : 0;
    
    console.log('🛒 ¿Solicitud de compra?', isPurchaseRequest, 'Cantidad:', requestedQuantity);

    // Detectar menciones de productos para forzar búsqueda
    const productKeywords = ['shiny', 'trodat', 'automatik', '722', '723', '4912', '9511', 'timbre', 'sello', 'automático'];
    const normalizedMessage = normalizeBrand(lastMessage);
    const shouldSearchProduct = productKeywords.some(keyword => 
      normalizedMessage.includes(keyword)
    ) || isPurchaseRequest;

    console.log('🔍 ¿Buscar producto?', shouldSearchProduct);

    let responseContent = '';
    let stockInfo = ''; // Para agregar al contexto

    // Si detectamos mención de producto, buscar directamente
    if (shouldSearchProduct) {
      console.log('⚡ Búsqueda directa activada');
      
      // Extraer término de búsqueda (buscar números de modelo y marcas)
      let searchTerm = normalizedMessage;
      
      // Si es solicitud de compra, buscar producto en mensajes anteriores
      if (isPurchaseRequest) {
        // Buscar en mensajes anteriores para encontrar el producto mencionado
        const previousMessages = messages.slice(0, -1).reverse();
        for (const msg of previousMessages) {
          const content = msg.content?.toLowerCase() || '';
          const productMatch = content.match(/\b(shiny|trodat|automatik)\s*\d+\b/i);
          if (productMatch) {
            searchTerm = productMatch[0];
            console.log('📦 Producto encontrado en historial:', searchTerm);
            break;
          }
        }
      }
      
      // Intentar extraer el modelo específico (números como 722, 4912, etc)
      const modelMatch = searchTerm.match(/\b(shiny|trodat|automatik)\s*\d+\b/i);
      if (modelMatch) {
        searchTerm = modelMatch[0];
      } else {
        // Si no encontramos modelo específico, buscar por palabras clave
        // IMPORTANTE: "automatik" es una MARCA, "automático" es un TIPO
        const keywords = searchTerm.match(/\b(shiny|trodat|automatik|automático|timbre|sello)\b/gi);
        if (keywords && keywords.length > 0) {
          // Si encuentra "automatik", dar prioridad a la marca
          const automatikIndex = keywords.findIndex(k => k.toLowerCase() === 'automatik');
          searchTerm = automatikIndex >= 0 ? 'automatik' : keywords[0];
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
        // Si es una solicitud de compra, agregar validación de stock al contexto
        if (isPurchaseRequest && data.length > 0) {
          const product = data[0]; // Tomar el primer resultado
          stockInfo = `\n\n⚠️ INFORMACIÓN DE STOCK PARA VALIDAR:\n- Producto: ${product.marca} ${product.modelo}\n- Stock disponible: ${product.stock} unidades\n- Cantidad solicitada: ${requestedQuantity} unidades\n- Precio unitario: $${product.precio?.toLocaleString('es-CL') || '0'}\n`;
          
          // Validar stock y generar respuesta directa
          if (requestedQuantity > product.stock) {
            responseContent = `Para compra online tenemos **${product.stock} unidades** disponibles del ${product.marca} ${product.modelo}.\n\n`;
            responseContent += `**Precio unitario:** $${product.precio?.toLocaleString('es-CL')}\n\n`;
            if (product.stock > 0) {
              const totalDisponible = product.precio * product.stock;
              responseContent += `Opciones:\n`;
              responseContent += `1️⃣ Comprar las **${product.stock} unidades online** por $${totalDisponible.toLocaleString('es-CL')}\n`;
              responseContent += `2️⃣ **Contactar a nuestra tienda física** que cuenta con mayor stock para tu pedido de ${requestedQuantity} unidades\n`;
              responseContent += `3️⃣ Ver modelos similares disponibles\n\n`;
              responseContent += `📍 **Tienda:** Centro de Santiago, Providencia\n`;
              responseContent += `📞 **WhatsApp:** Disponible para consultas\n`;
              responseContent += `📧 **Email:** contacto@artesellos.cl`;
            } else {
              responseContent += `💡 **Consulta con nuestra tienda física** que puede tener stock disponible para tu pedido.\n\n`;
              responseContent += `📍 Centro de Santiago, Providencia\n`;
              responseContent += `📞 WhatsApp disponible\n`;
              responseContent += `📧 contacto@artesellos.cl`;
            }
          } else {
            // Stock suficiente, calcular total
            const total = product.precio * requestedQuantity;
            const detalle = `${requestedQuantity}_x_${product.marca}_${product.modelo}`.replace(/\s+/g, '_');
            responseContent = `¡Perfecto! ✅ Tenemos stock disponible para compra online.\n\n`;
            responseContent += `**Producto:** ${product.marca} ${product.modelo} - ${product.color}\n`;
            responseContent += `**Cantidad:** ${requestedQuantity} unidades\n`;
            responseContent += `**Precio unitario:** $${product.precio?.toLocaleString('es-CL')}\n`;
            responseContent += `**Total:** $${total.toLocaleString('es-CL')}\n\n`;
            responseContent += `Para finalizar tu compra, ingresa aquí para ver los datos de transferencia o pagar con tarjeta:\n`;
            responseContent += `👉 [Ir a Pagar](https://artesellos.cl/pagar?monto=${total}&detalle=${detalle})\n\n`;
            responseContent += `_💡 Para pedidos mayoristas o cantidades mayores, contáctanos directamente. Nuestra tienda física cuenta con mayor stock._`;
          }
        } else {
          // No es solicitud de compra, solo mostrar productos
          responseContent = formatProductResults(data);
        }
      } else {
        // Si no encontramos, usar OpenAI como fallback con RAG
        const enhancedSystemPrompt = ragContext 
          ? `${systemPrompt}\n\n${ragContext}\n\nPregunta del usuario: ${lastMessage}\n\nResponde basándote SOLO en el contexto proporcionado arriba.`
          : systemPrompt + stockInfo;
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: enhancedSystemPrompt },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content
            }))
          ],
        });
        responseContent = completion.choices[0].message.content || 'No encontré información sobre ese producto.';
      }
    } else {
      // Consulta normal con OpenAI y RAG
      const enhancedSystemPrompt = ragContext 
        ? `${systemPrompt}\n\n${ragContext}\n\nPregunta del usuario: ${lastMessage}\n\nResponde basándote SOLO en el contexto proporcionado arriba.`
        : systemPrompt + stockInfo;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
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
