import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { findRelevantContext } from '@/lib/vectorSearch';
import { createSupabaseAdmin } from '@/lib/supabaseServer';

// Cliente Supabase (para búsqueda de productos)
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
    
    // System Prompt base - Solo se usa cuando NO hay contexto RAG
    const baseSystemPrompt = `Eres un asistente de ventas de Artesellos. Si no tienes información específica en el contexto proporcionado, responde: "Lamento, no tengo esa información específica en nuestra base de datos, por favor contáctanos por WhatsApp para obtener ayuda."`;

    const lastMessage = messages[messages.length - 1]?.content || '';
    console.log('📨 Mensaje recibido:', lastMessage);

    // RAG: Buscar contexto relevante en la base de conocimiento
    let ragContext = '';
    let hasRAGContext = false;
    try {
      // Usar umbral muy bajo (0.3) para capturar información relacionada
      const relevantContexts = await findRelevantContext(lastMessage, 0.3, 10);
      if (relevantContexts.length > 0) {
        hasRAGContext = true;
        ragContext = relevantContexts.join('\n\n---\n\n');
        console.log('✅ Contexto RAG recuperado:', relevantContexts.length, 'fragmentos');
      } else {
        console.log('ℹ️ Búsqueda vectorial no encontró resultados, intentando búsqueda por palabras clave...');
        
        // FALLBACK: Búsqueda por palabras clave si la búsqueda vectorial falla
        console.log('🔄 Iniciando búsqueda por palabras clave como fallback...');
        const supabase = createSupabaseAdmin();
        const normalizedQuery = lastMessage.toLowerCase();
        
        // Extraer palabras clave importantes (eliminar palabras comunes)
        // NOTA: No eliminar "mi" y "tu" ya que pueden ser relevantes para búsquedas personales
        const stopWords = ['que', 'cual', 'donde', 'cuando', 'como', 'por', 'para', 'con', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'es', 'son', 'está', 'están', 'tiene', 'tienen', 'su', 'sus', 'nuestro', 'nuestra', 'tienes'];
        const keywords = normalizedQuery
          .split(/\s+/)
          .filter(word => word.length > 1 && !stopWords.includes(word.toLowerCase()))
          .map(word => word.replace(/[.,!?;:]/g, '').toLowerCase()); // Limpiar puntuación y normalizar
        
        console.log('🔍 Palabras clave extraídas:', keywords);
        console.log('📝 Consulta normalizada:', normalizedQuery);
        
        if (keywords.length > 0) {
          // Buscar fragmentos que contengan alguna de las palabras clave
          // IMPORTANTE: Supabase puede tener problemas con .or() con múltiples condiciones
          // Intentar búsqueda alternativa si falla
          let keywordResults: any[] | null = null;
          let keywordError: any = null;
          
          try {
            const keywordConditions = keywords.map(keyword => `content.ilike.%${keyword}%`).join(',');
            console.log('🔍 Condiciones de búsqueda:', keywordConditions);
            
            const { data, error } = await (supabase as any)
              .from('knowledge_base')
              .select('content')
              .or(keywordConditions)
              .limit(10);
            
            keywordResults = data;
            keywordError = error;
          } catch (err: any) {
            console.error('❌ Error en consulta .or():', err);
            keywordError = err;
          }
          
          // Si .or() falla o no encuentra resultados, intentar búsqueda alternativa
          if ((keywordError || !keywordResults || keywordResults.length === 0) && keywords.length > 0) {
            console.log('🔄 .or() falló o sin resultados, intentando búsqueda alternativa por cada palabra...');
            try {
              // Buscar con cada palabra clave por separado y combinar resultados
              const allResults: any[] = [];
              for (const keyword of keywords) {
                const { data, error } = await (supabase as any)
                  .from('knowledge_base')
                  .select('content')
                  .ilike('content', `%${keyword}%`)
                  .limit(20);
                
                if (!error && data) {
                  allResults.push(...data);
                  console.log(`  ✅ Encontrados ${data.length} fragmentos con "${keyword}"`);
                }
              }
              
              // Eliminar duplicados basándose en el contenido
              keywordResults = Array.from(
                new Map(allResults.map((item: any) => [item.content, item])).values()
              );
              keywordError = null;
              console.log('✅ Búsqueda alternativa exitosa:', keywordResults.length, 'resultados únicos');
            } catch (altErr: any) {
              console.error('❌ Error en búsqueda alternativa:', altErr);
              if (!keywordError) keywordError = altErr;
            }
          }
          
          console.log('📊 Resultados de búsqueda por palabras clave:', {
            encontrados: keywordResults?.length || 0,
            error: keywordError?.message || null,
          });
          
          if (keywordError) {
            console.error('❌ Error en búsqueda por palabras clave:', keywordError);
          }
          
          if (!keywordError && keywordResults && keywordResults.length > 0) {
            // Eliminar duplicados basándose en el contenido
            const uniqueResults = Array.from(
              new Map(keywordResults.map((item: any) => [item.content, item])).values()
            );
            
            hasRAGContext = true;
            ragContext = uniqueResults.map((item: any) => item.content).join('\n\n---\n\n');
            console.log('✅ Contexto recuperado por palabras clave:', uniqueResults.length, 'fragmentos únicos (de', keywordResults.length, 'totales)');
            console.log('📝 Fragmentos encontrados:', uniqueResults.map((r: any, i: number) => `${i + 1}. ${r.content.substring(0, 100)}...`));
            console.log('📄 Contexto completo que se enviará (primeros 500 chars):', ragContext.substring(0, 500) + (ragContext.length > 500 ? '...' : ''));
          } else {
            console.log('ℹ️ Búsqueda por palabras clave no encontró resultados');
            console.log('📊 Resultados recibidos:', keywordResults?.length || 0);
            console.log('📊 Tipo de resultados:', Array.isArray(keywordResults) ? 'Array' : typeof keywordResults);
            if (keywordError) {
              console.error('❌ Error detallado:', keywordError);
              console.error('❌ Código de error:', keywordError.code);
              console.error('❌ Mensaje:', keywordError.message);
            }
            
            // Si no hay resultados pero hay palabras clave, intentar búsqueda más amplia
            if (keywords.length > 0 && (!keywordResults || keywordResults.length === 0)) {
              console.log('🔄 Intentando búsqueda más amplia (cualquier palabra)...');
              // Buscar fragmentos que contengan CUALQUIERA de las palabras (más permisivo)
              const { data: broadResults, error: broadError } = await (supabase as any)
                .from('knowledge_base')
                .select('content')
                .limit(50); // Obtener más resultados para filtrar
              
              if (!broadError && broadResults && broadResults.length > 0) {
                // Filtrar manualmente los que contengan alguna palabra clave
                const filtered = broadResults.filter((item: any) => 
                  keywords.some(keyword => 
                    item.content.toLowerCase().includes(keyword.toLowerCase())
                  )
                );
                
                if (filtered.length > 0) {
                  hasRAGContext = true;
                  ragContext = filtered.map((item: any) => item.content).join('\n\n---\n\n');
                  console.log('✅ Contexto recuperado con búsqueda amplia:', filtered.length, 'fragmentos');
                }
              }
            }
          }
        } else {
          console.log('⚠️ No se pudieron extraer palabras clave de la consulta');
        }
        
        // Si aún no hay resultados, intentar búsqueda vectorial sin umbral
        if (!hasRAGContext) {
          console.log('🔄 Intentando búsqueda vectorial sin umbral...');
          const allContexts = await findRelevantContext(lastMessage, 0, 10);
          if (allContexts.length > 0) {
            hasRAGContext = true;
            ragContext = allContexts.join('\n\n---\n\n');
            console.log('✅ Contexto recuperado sin umbral:', allContexts.length, 'fragmentos');
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Error al recuperar contexto RAG:', error);
      // Continuar sin contexto RAG si hay error
    }

    // Log final del estado de RAG
    console.log('📊 ESTADO FINAL RAG:', {
      hasRAGContext,
      ragContextLength: ragContext.length,
      ragContextPreview: ragContext.substring(0, 300) + (ragContext.length > 300 ? '...' : ''),
      willUseRAG: hasRAGContext && ragContext.length > 0,
    });
    
    if (!hasRAGContext || ragContext.length === 0) {
      console.warn('⚠️ ADVERTENCIA: No hay contexto RAG disponible. El chatbot responderá con mensaje de fallback.');
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
        // Si no encontramos productos, usar OpenAI con RAG
        let enhancedSystemPrompt = '';
        
        if (hasRAGContext && ragContext) {
          console.log('📝 Construyendo System Prompt con contexto RAG (ruta sin productos)');
          console.log('📊 Longitud del contexto:', ragContext.length, 'caracteres');
          console.log('📄 Preview del contexto:', ragContext.substring(0, 200) + '...');
          // System Prompt restrictivo usando SOLO contexto RAG
          enhancedSystemPrompt = `Eres un asistente de ventas de Artesellos, experto en sus políticas de productos, envíos, y pagos. Tu única fuente de verdad es la sección de 'CONTEXTO PROPORCIONADO' que se encuentra a continuación.

- **INSTRUCCIONES IMPORTANTES:**
  1. Responde la pregunta del usuario usando SOLO la información del 'CONTEXTO PROPORCIONADO'.
  2. Puedes hacer conexiones semánticas: si el contexto menciona "mi caballo" y el usuario pregunta sobre "tu caballo", son la misma cosa. Si menciona "colores de tinta" y el usuario pregunta "qué tintas tienen", es lo mismo.
  3. Adapta el lenguaje del contexto a la pregunta del usuario de forma natural.
  4. Si la información en el contexto es relevante para la pregunta (aunque use palabras ligeramente diferentes), úsala para responder.
  5. Solo si la pregunta NO tiene NADA que ver con el contexto proporcionado, responde: 'Lamento, no tengo esa información específica en nuestra base de datos, por favor contáctanos por WhatsApp para obtener ayuda.'

- **REGLA DE FORMATO:** No menciones que utilizaste una base de datos o que tienes un 'contexto'. Simplemente responde la pregunta de forma natural y amigable, como si supieras esa información de memoria.

---

CONTEXTO PROPORCIONADO:
${ragContext}

---

PREGUNTA DEL USUARIO: ${lastMessage}

Responde de forma natural usando la información del contexto:`;
          console.log('✅ System Prompt construido con contexto RAG');
        } else {
          console.log('⚠️ No hay contexto RAG disponible, usando prompt base');
          // Si no hay contexto RAG, usar prompt base restrictivo
          enhancedSystemPrompt = `${baseSystemPrompt}

PREGUNTA DEL USUARIO: ${lastMessage}`;
        }
        
        console.log('🤖 Enviando a OpenAI con System Prompt de', enhancedSystemPrompt.length, 'caracteres');
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
      let enhancedSystemPrompt = '';
      
      if (hasRAGContext && ragContext) {
        console.log('📝 Construyendo System Prompt con contexto RAG');
        console.log('📊 Longitud del contexto:', ragContext.length, 'caracteres');
        // System Prompt restrictivo usando SOLO contexto RAG
          enhancedSystemPrompt = `Eres un asistente de ventas de Artesellos, experto en sus políticas de productos, envíos, y pagos. Tu única fuente de verdad es la sección de 'CONTEXTO PROPORCIONADO' que se encuentra a continuación.

- **INSTRUCCIONES IMPORTANTES:**
  1. Responde la pregunta del usuario usando SOLO la información del 'CONTEXTO PROPORCIONADO'.
  2. Puedes hacer conexiones semánticas: si el contexto menciona "mi caballo" y el usuario pregunta sobre "tu caballo", son la misma cosa. Si menciona "colores de tinta" y el usuario pregunta "qué tintas tienen", es lo mismo.
  3. Adapta el lenguaje del contexto a la pregunta del usuario de forma natural.
  4. Si la información en el contexto es relevante para la pregunta (aunque use palabras ligeramente diferentes), úsala para responder.
  5. Solo si la pregunta NO tiene NADA que ver con el contexto proporcionado, responde: 'Lamento, no tengo esa información específica en nuestra base de datos, por favor contáctanos por WhatsApp para obtener ayuda.'

- **REGLA DE FORMATO:** No menciones que utilizaste una base de datos o que tienes un 'contexto'. Simplemente responde la pregunta de forma natural y amigable, como si supieras esa información de memoria.

---

CONTEXTO PROPORCIONADO:
${ragContext}

---

PREGUNTA DEL USUARIO: ${lastMessage}

Responde de forma natural usando la información del contexto:`;
        console.log('✅ System Prompt construido con contexto RAG');
      } else {
        // Si no hay contexto RAG, usar prompt base restrictivo
        enhancedSystemPrompt = `${baseSystemPrompt}

PREGUNTA DEL USUARIO: ${lastMessage}`;
      }
      
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
