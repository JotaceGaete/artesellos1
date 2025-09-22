export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contexto del negocio para el chatbot
const BUSINESS_CONTEXT = `
Eres un asistente virtual especializado en Artesellos, una empresa de timbres personalizados.

INFORMACIÓN DE LA EMPRESA:
- Artesellos es especialista en timbres personalizados de alta calidad
- Fabricamos timbres automáticos, pre-entintados y manuales
- Ofrecemos personalización completa: texto, dimensiones, colores

PRODUCTOS PRINCIPALES:
- Shiny 842: Timbre automático, medidas estándar 38x14mm
- Timbres personalizados para cualquier ocasión
- Opciones de personalización: texto, dimensiones, colores (azul, negro, rojo)

MEDIOS DE PAGO:
- Tarjetas de crédito y débito (Visa, MasterCard)
- Transferencia bancaria
- Efectivo (pago contra entrega)
- Pago seguro con Haulmer
- PayPal

ENVÍOS Y TIEMPOS:
- Envío nacional: 2-5 días hábiles
- Envío express: 24-48 horas (costo adicional)
- Envío gratuito en compras superiores a $50.000
- Retiro en tienda disponible
- Seguimiento en tiempo real

PROCESO DE PERSONALIZACIÓN:
- Selecciona el timbre base
- Personaliza texto (máximo 100 caracteres)
- Elige dimensiones (ancho: 10-80mm, alto: 10-50mm)
- Selecciona color de tinta
- Confirma diseño antes de producción

GARANTÍAS:
- Garantía de calidad por 12 meses
- Reposición gratuita por defectos de fabricación
- Satisfacción garantizada o devolución del dinero

Responde de manera amigable, profesional y con información precisa. Si no tienes información específica, sugiere contactar al equipo de ventas.
`;

export async function POST(request: NextRequest) {
  try {
    const { message, productInfo } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Crear contexto específico del producto si está disponible
    let productContext = '';
    if (productInfo) {
      productContext = `
INFORMACIÓN DEL PRODUCTO ACTUAL:
- Nombre: ${productInfo.name}
- Precio: $${productInfo.price}
- Descripción: ${productInfo.description}
- Características: ${productInfo.short_description}
${productInfo.stamp_info ? `- Medidas estándar: ${productInfo.stamp_info.width}x${productInfo.stamp_info.height}mm` : ''}
${productInfo.customization_options ? '- Personalizable: Sí' : '- Personalizable: No'}
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: BUSINESS_CONTEXT + productContext
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en chatbot API:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        fallbackMessage: 'Lo siento, no puedo responder en este momento. Por favor, contacta a nuestro equipo de ventas para obtener información detallada sobre nuestros productos y servicios.'
      },
      { status: 500 }
    );
  }
}
