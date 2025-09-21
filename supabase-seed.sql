-- Script de datos de ejemplo para Supabase
-- Ejecutar después del script de setup

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar categorías
INSERT INTO categories (name, slug, description) VALUES
('Románticos', 'romanticos', 'Timbres para ocasiones románticas y aniversarios'),
('Celebraciones', 'celebraciones', 'Timbres para cumpleaños y fiestas'),
('Infantiles', 'infantiles', 'Timbres para bebés y niños'),
('Bodas', 'bodas', 'Timbres elegantes para invitaciones matrimoniales'),
('Académicos', 'academicos', 'Timbres para graduaciones y logros académicos'),
('Festivos', 'festivos', 'Timbres para Navidad y otras celebraciones'),
('Personalizados', 'personalizados', 'Timbres completamente personalizados'),
('Corporativos', 'corporativos', 'Timbres para empresas y eventos corporativos')
ON CONFLICT (slug) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, slug, description, short_description, price, regular_price, sale_price, on_sale, images, categories, attributes, stock_status, stock_quantity, weight, dimensions, tags, featured) VALUES
(
  'Timbre Personalizado - Amor Eterno',
  'timbre-personalizado-amor-eterno',
  'Hermoso timbre personalizado con diseño de corazones entrelazados y mensaje de amor eterno. Perfecto para regalos románticos y aniversarios.',
  'Timbre romántico con diseño de corazones para ocasiones especiales.',
  25.00,
  25.00,
  NULL,
  FALSE,
  '[{"id": "1", "src": "https://picsum.photos/400/400?random=1", "name": "Timbre Amor Eterno", "alt": "Timbre personalizado con corazones"}]',
  '["romanticos"]',
  '[{"id": "1", "name": "Color", "options": ["Rojo", "Rosa", "Dorado"], "visible": true, "variation": false}]',
  'instock',
  15,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["regalo", "aniversario"]',
  TRUE
),
(
  'Timbre Personalizado - Cumpleaños Feliz',
  'timbre-personalizado-cumpleanos-feliz',
  'Timbre personalizado perfecto para celebrar cumpleaños. Incluye diseño de pastel, velas y mensaje de felicitación personalizado.',
  'Timbre festivo para celebrar cumpleaños con estilo.',
  22.00,
  25.00,
  22.00,
  TRUE,
  '[{"id": "2", "src": "https://picsum.photos/400/400?random=2", "name": "Timbre Cumpleaños", "alt": "Timbre personalizado para cumpleaños"}]',
  '["celebraciones"]',
  '[{"id": "2", "name": "Estilo", "options": ["Pastel", "Velas", "Globos"], "visible": true, "variation": false}]',
  'instock',
  8,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["cumpleanos", "fiesta"]',
  FALSE
),
(
  'Timbre Personalizado - Nuevo Bebé',
  'timbre-personalizado-nuevo-bebe',
  'Tierno timbre personalizado para celebrar la llegada de un nuevo miembro a la familia. Diseño con patitos, ositos y elementos infantiles.',
  'Timbre adorable para anunciar el nacimiento de un bebé.',
  28.00,
  28.00,
  NULL,
  FALSE,
  '[{"id": "3", "src": "https://picsum.photos/400/400?random=3", "name": "Timbre Bebé", "alt": "Timbre personalizado para bebé"}]',
  '["infantiles"]',
  '[{"id": "3", "name": "Tema", "options": ["Patos", "Ositos", "Estrellas"], "visible": true, "variation": false}]',
  'instock',
  12,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["bebe", "familia"]',
  TRUE
),
(
  'Timbre Personalizado - Matrimonio',
  'timbre-personalizado-matrimonio',
  'Elegante timbre personalizado para invitaciones de boda. Diseño con anillos, flores y elementos románticos para el día más especial.',
  'Timbre elegante para invitaciones matrimoniales.',
  35.00,
  35.00,
  NULL,
  FALSE,
  '[{"id": "4", "src": "https://picsum.photos/400/400?random=4", "name": "Timbre Matrimonio", "alt": "Timbre personalizado para matrimonio"}]',
  '["bodas"]',
  '[{"id": "4", "name": "Estilo", "options": ["Clásico", "Moderno", "Rústico"], "visible": true, "variation": false}]',
  'instock',
  6,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["boda", "elegante"]',
  FALSE
),
(
  'Timbre Personalizado - Graduación',
  'timbre-personalizado-graduacion',
  'Timbre personalizado para celebrar logros académicos. Incluye birrete, libro y elementos de graduación para diplomas y certificados.',
  'Timbre académico para celebrar graduaciones y logros.',
  24.00,
  24.00,
  NULL,
  FALSE,
  '[{"id": "5", "src": "https://picsum.photos/400/400?random=5", "name": "Timbre Graduación", "alt": "Timbre personalizado para graduación"}]',
  '["academicos"]',
  '[{"id": "5", "name": "Tipo", "options": ["Universitario", "Secundaria", "Posgrado"], "visible": true, "variation": false}]',
  'instock',
  10,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["graduacion", "exito"]',
  FALSE
),
(
  'Timbre Personalizado - Navidad',
  'timbre-personalizado-navidad',
  'Timbre festivo para tarjetas navideñas y regalos. Diseño con árbol de navidad, regalos y elementos tradicionales de la temporada.',
  'Timbre navideño para tarjetas y regalos festivos.',
  26.00,
  30.00,
  26.00,
  TRUE,
  '[{"id": "6", "src": "https://picsum.photos/400/400?random=6", "name": "Timbre Navidad", "alt": "Timbre personalizado navideño"}]',
  '["festivos"]',
  '[{"id": "6", "name": "Elementos", "options": ["Árbol", "Regalos", "Estrellas"], "visible": true, "variation": false}]',
  'instock',
  20,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["navidad", "festivo"]',
  TRUE
),
(
  'Timbre Corporativo Personalizado',
  'timbre-corporativo-personalizado',
  'Timbre profesional para empresas. Incluye logotipo, nombre de la compañía y elementos corporativos personalizados.',
  'Timbre profesional para uso corporativo y empresarial.',
  45.00,
  45.00,
  NULL,
  FALSE,
  '[{"id": "7", "src": "https://picsum.photos/400/400?random=7", "name": "Timbre Corporativo", "alt": "Timbre corporativo personalizado"}]',
  '["corporativos"]',
  '[{"id": "7", "name": "Tipo", "options": ["Con Logo", "Solo Texto", "Completo"], "visible": true, "variation": false}]',
  'instock',
  25,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["empresa", "corporativo", "profesional"]',
  TRUE
),
(
  'Timbre Personalizado - Bautizo',
  'timbre-personalizado-bautizo',
  'Timbre elegante para celebraciones de bautizo. Diseño con elementos religiosos y mensajes de bendición.',
  'Timbre especial para celebraciones religiosas y bautizos.',
  30.00,
  30.00,
  NULL,
  FALSE,
  '[{"id": "8", "src": "https://picsum.photos/400/400?random=8", "name": "Timbre Bautizo", "alt": "Timbre personalizado para bautizo"}]',
  '["celebraciones"]',
  '[{"id": "8", "name": "Estilo", "options": ["Tradicional", "Moderno", "Floral"], "visible": true, "variation": false}]',
  'instock',
  8,
  0.05,
  '{"length": "10", "width": "10", "height": "2"}',
  '["bautizo", "religioso", "ceremonia"]',
  FALSE
);

-- Insertar algunos mensajes de contacto de ejemplo
INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES
(
  'María García',
  'maria.garcia@email.com',
  '+52 55 1234 5678',
  'Consulta sobre timbres personalizados',
  'Hola, me gustaría saber más información sobre los timbres personalizados para eventos corporativos. ¿Tienen opciones para logos grandes?',
  'read'
),
(
  'Carlos Rodríguez',
  'carlos.rodriguez@email.com',
  '+52 33 9876 5432',
  'Cotización para evento',
  'Necesito 100 timbres personalizados para un evento de aniversario de empresa. ¿Me pueden enviar una cotización?',
  'unread'
);

-- Insertar algunas solicitudes de cotización
INSERT INTO quote_requests (customer_email, customer_name, customer_phone, company, quantity, description, status) VALUES
(
  'empresa@corporativo.com',
  'Ana López',
  '+52 55 5555 1234',
  'Empresa XYZ',
  200,
  'Timbres personalizados con logo de la empresa para correspondencia oficial. Necesitamos alta calidad y entrega urgente.',
  'pending'
),
(
  'fiesta@eventos.com',
  'Roberto Sánchez',
  '+52 33 4444 5678',
  'Eventos & Fiestas',
  50,
  'Timbres para invitaciones de boda. Diseño elegante con iniciales doradas.',
  'responded'
);

-- Insertar algunos diseños personalizados
INSERT INTO custom_designs (customer_email, customer_name, design_data, status, price_quote) VALUES
(
  'cliente@email.com',
  'Laura Martínez',
  '{
    "text": "Feliz Aniversario",
    "font": "elegant",
    "color": "#FF6B6B",
    "shape": "heart",
    "size": "medium",
    "icons": ["heart", "star"],
    "custom_image": null
  }',
  'approved',
  35.00
);

-- Insertar algunos registros de comercios
INSERT INTO wholesale_registrations (company_name, contact_name, email, phone, business_type, address, expected_volume, status) VALUES
(
  'Papelería Central',
  'Miguel Torres',
  'contacto@papeleria-central.com',
  '+52 55 6789 0123',
  'Papelería',
  '{
    "first_name": "Miguel",
    "last_name": "Torres",
    "company": "Papelería Central",
    "address_1": "Av. Reforma 123",
    "address_2": "Col. Centro",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postcode": "06000",
    "country": "MX"
  }',
  'medium',
  'approved'
);
