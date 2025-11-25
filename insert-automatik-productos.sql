-- =====================================================
-- SCRIPT PARA AGREGAR PRODUCTOS AUTOMATIK
-- =====================================================
-- Insertar productos de la marca Automatik en la tabla stock_timbres
-- Ejecutar en Supabase SQL Editor

-- Productos de la marca Automatik
INSERT INTO stock_timbres (marca, modelo, medidas, color, precio, stock, imagen_url, descripcion, categoria) VALUES
(
  'Automatik',
  '413',
  '58x22mm',
  'Negro',
  28000,
  15,
  'https://media.artesellos.cl/timbres/automatik-413.jpg',
  'Timbre automático Automatik 413 con medidas 58x22mm. Ideal para uso profesional intensivo. Incluye almohadilla reemplazable.',
  'AUTOMATICOS'
),
(
  'Automatik',
  '520',
  '70x30mm',
  'Negro',
  35000,
  10,
  'https://media.artesellos.cl/timbres/automatik-520.jpg',
  'Timbre automático Automatik 520 de tamaño grande (70x30mm). Perfecto para empresas y documentos oficiales.',
  'AUTOMATICOS'
),
(
  'Automatik',
  '310',
  '47x18mm',
  'Negro',
  24000,
  20,
  'https://media.artesellos.cl/timbres/automatik-310.jpg',
  'Timbre automático compacto Automatik 310 (47x18mm). Ideal para uso personal y profesional.',
  'AUTOMATICOS'
),
(
  'Automatik',
  '413',
  '58x22mm',
  'Azul',
  28000,
  12,
  'https://media.artesellos.cl/timbres/automatik-413-azul.jpg',
  'Timbre automático Automatik 413 en color azul con medidas 58x22mm. Versión colorida para diferenciar documentos.',
  'AUTOMATICOS'
),
(
  'Automatik',
  '520',
  '70x30mm',
  'Rojo',
  35000,
  8,
  'https://media.artesellos.cl/timbres/automatik-520-rojo.jpg',
  'Timbre automático Automatik 520 en color rojo (70x30mm). Llamativo y profesional.',
  'AUTOMATICOS'
)
ON CONFLICT DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT marca, modelo, medidas, color, precio, stock 
FROM stock_timbres 
WHERE marca = 'Automatik'
ORDER BY modelo, color;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT 'Productos Automatik insertados exitosamente.' as mensaje;
SELECT COUNT(*) as total_productos_automatik FROM stock_timbres WHERE marca = 'Automatik';

