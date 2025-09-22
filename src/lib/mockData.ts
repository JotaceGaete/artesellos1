import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Timbre Personalizado - Amor Eterno",
    slug: "timbre-personalizado-amor-eterno",
    description: "Hermoso timbre personalizado con diseño de corazones entrelazados y mensaje de amor eterno. Perfecto para regalos románticos y aniversarios.",
    short_description: "Timbre romántico con diseño de corazones para ocasiones especiales.",
    price: "25000",
    regular_price: "25000",
    sale_price: "",
    on_sale: false,
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=800&fit=crop&q=80",
        name: "Timbre Amor Eterno - Negro",
        alt: "Timbre personalizado con corazones en tinta negra",
        color: "#000000"
      },
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=800&fit=crop&q=80&sat=2&hue=0",
        name: "Timbre Amor Eterno - Rojo",
        alt: "Timbre personalizado con corazones en tinta roja",
        color: "#FF0000"
      },
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=800&fit=crop&q=80&sat=2&hue=240",
        name: "Timbre Amor Eterno - Azul",
        alt: "Timbre personalizado con corazones en tinta azul",
        color: "#0000FF"
      },
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=800&fit=crop&q=80&sat=2&hue=120",
        name: "Timbre Amor Eterno - Verde",
        alt: "Timbre personalizado con corazones en tinta verde",
        color: "#008000"
      },
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=800&fit=crop&q=80&sat=2&hue=30",
        name: "Timbre Amor Eterno - Naranja",
        alt: "Timbre personalizado con corazones en tinta naranja",
        color: "#FFA500"
      }
    ],
    categories: [
      { id: 1, name: "Románticos", slug: "romanticos" }
    ],
    attributes: [
      {
        id: 1,
        name: "Color",
        options: ["Rojo", "Rosa", "Dorado"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 15,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10",
      height: "2"
    },
    tags: [
      { id: 1, name: "Regalo", slug: "regalo" },
      { id: 2, name: "Aniversario", slug: "aniversario" }
    ],
    featured: true,
    date_created: "2024-01-15T10:00:00Z",
    date_modified: "2024-01-15T10:00:00Z",
    // Información específica del timbre
    stamp_info: {
      type: "automatic",
      default_dimensions: {
        width: 38,
        height: 14,
        unit: "mm"
      },
      material: "Goma de alta calidad",
      max_text_lines: 3,
      recommended_uses: ["Documentos oficiales", "Correspondencia personal"]
    },
    // Opciones de personalización
    customization_options: {
      allow_custom_dimensions: true,
      dimension_limits: {
        min_width: 20,
        max_width: 80,
        min_height: 10,
        max_height: 50,
        unit: "mm"
      },
      text_customization: {
        max_lines: 3,
        max_chars_per_line: 20,
        supported_fonts: ["Arial", "Times New Roman", "Helvetica"],
        allow_multiline: true
      },
      color_options: {
        available_colors: ["#000000", "#FF0000", "#0000FF", "#008000", "#FFA500"],
        default_color: "#000000"
      },
      price_multipliers: {
        dimension_multiplier: 20, // $20 por mm² adicional
        color_multiplier: 2000, // $2.000 por color personalizado
        text_multiplier: 3000 // $3.000 por línea de texto adicional
      }
    }
  },
  {
    id: 2,
    name: "Timbre Personalizado - Navidad",
    slug: "timbre-personalizado-navidad",
    description: "Hermoso timbre navideño con diseños festivos. Perfecto para tarjetas navideñas y regalos de temporada.",
    short_description: "Timbre navideño para tarjetas y regalos festivos.",
    price: "26000",
    regular_price: "30000",
    sale_price: "26000",
    on_sale: true,
    images: [
      {
        id: 21,
        src: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop&q=80",
        name: "Timbre Navidad - Negro",
        alt: "Timbre navideño con diseño de árbol en tinta negra",
        color: "#000000"
      },
      {
        id: 22,
        src: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop&q=80&sat=2&hue=0",
        name: "Timbre Navidad - Rojo",
        alt: "Timbre navideño con diseño de árbol en tinta roja",
        color: "#FF0000"
      },
      {
        id: 23,
        src: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop&q=80&sat=2&hue=120",
        name: "Timbre Navidad - Verde",
        alt: "Timbre navideño con diseño de árbol en tinta verde",
        color: "#008000"
      },
      {
        id: 24,
        src: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop&q=80&sat=2&hue=240",
        name: "Timbre Navidad - Azul",
        alt: "Timbre navideño con diseño de árbol en tinta azul",
        color: "#0000FF"
      }
    ],
    categories: [
      { id: 6, name: "Festivos", slug: "festivos" }
    ],
    attributes: [
      {
        id: 21,
        name: "Diseño",
        options: ["Árbol", "Estrella", "Renos"],
        visible: true,
        variation: false
      }
    ],
    stock_status: 'instock' as const,
    stock_quantity: 20,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10", 
      height: "2"
    },
    tags: [
      { id: 21, name: "Navidad", slug: "navidad" },
      { id: 22, name: "Festivo", slug: "festivo" },
      { id: 23, name: "Árbol", slug: "arbol" }
    ],
    featured: true,
    date_created: "2024-11-01T00:00:00.000Z",
    date_modified: "2024-11-01T00:00:00.000Z",
    // Información específica del timbre
    stamp_info: {
      type: "automatic",
      default_dimensions: {
        width: 25,
        height: 25,
        unit: "mm"
      },
      material: "Goma de alta calidad",
      max_text_lines: 2,
      recommended_uses: ["Tarjetas navideñas", "Envolturas de regalo", "Correspondencia festiva"]
    },
    // Opciones de personalización
    customization_options: {
      allow_custom_dimensions: true,
      dimension_limits: {
        min_width: 15,
        max_width: 40,
        min_height: 15,
        max_height: 40,
        unit: "mm"
      },
      text_customization: {
        max_lines: 2,
        max_chars_per_line: 15,
        supported_fonts: ["Arial", "Georgia", "Festive"],
        allow_multiline: true
      },
      color_options: {
        available_colors: ["#000000", "#FF0000", "#008000", "#0000FF"],
        default_color: "#FF0000"
      },
      price_multipliers: {
        dimension_multiplier: 30,
        color_multiplier: 2000,
        text_multiplier: 3500
      }
    }
  },
  {
    id: 3,
    name: "Timbre Personalizado - Cumpleaños Feliz",
    slug: "timbre-personalizado-cumpleanos-feliz",
    description: "Timbre personalizado perfecto para celebrar cumpleaños. Incluye diseño de pastel, velas y mensaje de felicitación personalizado.",
    short_description: "Timbre festivo para celebrar cumpleaños con estilo.",
    price: "22000",
    regular_price: "25000",
    sale_price: "22000",
    on_sale: true,
    images: [
      {
        id: 2,
        src: "https://picsum.photos/400/400?random=2",
        name: "Timbre Cumpleaños - Principal",
        alt: "Timbre personalizado para cumpleaños"
      },
      {
        id: 3,
        src: "https://picsum.photos/400/400?random=12",
        name: "Timbre Cumpleaños - Detalle",
        alt: "Vista detallada del timbre de cumpleaños"
      }
    ],
    categories: [
      { id: 2, name: "Celebraciones", slug: "celebraciones" }
    ],
    attributes: [
      {
        id: 2,
        name: "Estilo",
        options: ["Pastel", "Velas", "Globos"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 8,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10",
      height: "2"
    },
    tags: [
      { id: 3, name: "Cumpleaños", slug: "cumpleanos" },
      { id: 4, name: "Fiesta", slug: "fiesta" }
    ],
    featured: false,
    date_created: "2024-01-10T14:30:00Z",
    date_modified: "2024-01-10T14:30:00Z",
    // Información específica del timbre
    stamp_info: {
      type: "self-inking",
      default_dimensions: {
        width: 45,
        height: 20,
        unit: "mm"
      },
      material: "Plástico ABS con almohadilla de tinta",
      max_text_lines: 2,
      recommended_uses: ["Oficinas", "Escuelas", "Eventos"]
    },
    // Opciones de personalización
    customization_options: {
      allow_custom_dimensions: true,
      dimension_limits: {
        min_width: 30,
        max_width: 70,
        min_height: 15,
        max_height: 40,
        unit: "mm"
      },
      text_customization: {
        max_lines: 2,
        max_chars_per_line: 15,
        supported_fonts: ["Arial", "Helvetica"],
        allow_multiline: true
      },
      color_options: {
        available_colors: ["#000000", "#FF0000", "#0000FF", "#008000"],
        default_color: "#000000"
      },
      price_multipliers: {
        dimension_multiplier: 15,
        color_multiplier: 1500,
        text_multiplier: 2500
      }
    }
  },
  {
    id: 8,
    name: "Timbre Personalizado - Nuevo Bebé",
    slug: "timbre-personalizado-nuevo-bebe",
    description: "Tierno timbre personalizado para celebrar la llegada de un nuevo miembro a la familia. Diseño con patitos, ositos y elementos infantiles.",
    short_description: "Timbre adorable para anunciar el nacimiento de un bebé.",
    price: "28000",
    regular_price: "28000",
    sale_price: "",
    on_sale: false,
    images: [
      {
        id: 8,
        src: "https://picsum.photos/400/400?random=3",
        name: "Timbre Bebé - Principal",
        alt: "Timbre personalizado para bebé"
      },
      {
        id: 4,
        src: "https://picsum.photos/400/400?random=13",
        name: "Timbre Bebé - Detalle",
        alt: "Vista detallada del timbre de bebé"
      }
    ],
    categories: [
      { id: 3, name: "Infantiles", slug: "infantiles" }
    ],
    attributes: [
      {
        id: 8,
        name: "Tema",
        options: ["Patos", "Ositos", "Estrellas"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 12,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10",
      height: "2"
    },
    tags: [
      { id: 5, name: "Bebé", slug: "bebe" },
      { id: 6, name: "Familia", slug: "familia" }
    ],
    featured: true,
    date_created: "2024-01-12T09:15:00Z",
    date_modified: "2024-01-12T09:15:00Z"
  },
  {
    id: 4,
    name: "Timbre Personalizado - Matrimonio",
    slug: "timbre-personalizado-matrimonio",
    description: "Elegante timbre personalizado para invitaciones de boda. Diseño con anillos, flores y elementos románticos para el día más especial.",
    short_description: "Timbre elegante para invitaciones matrimoniales.",
    price: "35000",
    regular_price: "35000",
    sale_price: "",
    on_sale: false,
    images: [
      {
        id: 4,
        src: "https://picsum.photos/400/400?random=4",
        name: "Timbre Matrimonio",
        alt: "Timbre personalizado para matrimonio"
      }
    ],
    categories: [
      { id: 4, name: "Bodas", slug: "bodas" }
    ],
    attributes: [
      {
        id: 4,
        name: "Estilo",
        options: ["Clásico", "Moderno", "Rústico"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 6,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10",
      height: "2"
    },
    tags: [
      { id: 7, name: "Boda", slug: "boda" },
      { id: 8, name: "Elegante", slug: "elegante" }
    ],
    featured: false,
    date_created: "2024-01-08T16:45:00Z",
    date_modified: "2024-01-08T16:45:00Z"
  },
  {
    id: 5,
    name: "Timbre Personalizado - Graduación",
    slug: "timbre-personalizado-graduacion",
    description: "Timbre personalizado para celebrar logros académicos. Incluye birrete, libro y elementos de graduación para diplomas y certificados.",
    short_description: "Timbre académico para celebrar graduaciones y logros.",
    price: "24000",
    regular_price: "24000",
    sale_price: "",
    on_sale: false,
    images: [
      {
        id: 5,
        src: "https://picsum.photos/400/400?random=5",
        name: "Timbre Graduación",
        alt: "Timbre personalizado para graduación"
      }
    ],
    categories: [
      { id: 5, name: "Académicos", slug: "academicos" }
    ],
    attributes: [
      {
        id: 5,
        name: "Tipo",
        options: ["Universitario", "Secundaria", "Posgrado"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 10,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10",
      height: "2"
    },
    tags: [
      { id: 9, name: "Graduación", slug: "graduacion" },
      { id: 10, name: "Éxito", slug: "exito" }
    ],
    featured: false,
    date_created: "2024-01-05T11:20:00Z",
    date_modified: "2024-01-05T11:20:00Z"
  },
  {
    id: 6,
    name: "Timbre Personalizado - Navidad Festiva",
    slug: "timbre-personalizado-navidad-festiva",
    description: "Timbre festivo para tarjetas navideñas y regalos. Diseño con árbol de navidad, regalos y elementos tradicionales de la temporada.",
    short_description: "Timbre navideño para tarjetas y regalos festivos.",
    price: "26000",
    regular_price: "30000",
    sale_price: "26000",
    on_sale: true,
    images: [
      {
        id: 6,
        src: "https://picsum.photos/400/400?random=6",
        name: "Timbre Navidad",
        alt: "Timbre personalizado navideño"
      }
    ],
    categories: [
      { id: 6, name: "Festivos", slug: "festivos" }
    ],
    attributes: [
      {
        id: 6,
        name: "Elementos",
        options: ["Árbol", "Regalos", "Estrellas"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 20,
    weight: "0.05",
    dimensions: {
      length: "10",
      width: "10",
      height: "2"
    },
    tags: [
      { id: 11, name: "Navidad", slug: "navidad" },
      { id: 12, name: "Festivo", slug: "festivo" }
    ],
    featured: true,
    date_created: "2024-01-03T13:10:00Z",
    date_modified: "2024-01-03T13:10:00Z"
  },
  {
    id: 7,
    name: "Shiny 842 - Automático - Medidas 38x14",
    slug: "shiny-842-automatico-medidas-38x14",
    description: "Timbre automático Shiny 842 con medidas estándar de 38mm de ancho por 14mm de alto. Perfecto para uso profesional y personal. Incluye almohadilla de tinta reemplazable.",
    short_description: "Timbre automático profesional con medidas 38x14mm",
    price: "32000",
    regular_price: "32000",
    sale_price: "",
    on_sale: false,
    images: [
      {
        id: 7,
        src: "https://picsum.photos/400/400?random=7",
        name: "Shiny 842 Automático - Principal",
        alt: "Timbre automático Shiny 842 medidas 38x14"
      },
      {
        id: 8,
        src: "https://picsum.photos/400/400?random=17",
        name: "Shiny 842 Automático - Detalle",
        alt: "Vista detallada del mecanismo Shiny 842"
      }
    ],
    categories: [
      { id: 7, name: "Profesionales", slug: "profesionales" }
    ],
    attributes: [
      {
        id: 7,
        name: "Tipo de tinta",
        options: ["Negra", "Azul", "Roja"],
        visible: true,
        variation: false
      }
    ],
    stock_status: "instock",
    stock_quantity: 25,
    weight: "0.08",
    dimensions: {
      length: "12",
      width: "12",
      height: "3"
    },
    tags: [
      { id: 13, name: "Profesional", slug: "profesional" },
      { id: 14, name: "Automático", slug: "automatico" }
    ],
    featured: true,
    date_created: "2024-01-20T10:00:00Z",
    date_modified: "2024-01-20T10:00:00Z",
    // Información específica del timbre
    stamp_info: {
      type: "automatic",
      default_dimensions: {
        width: 38,
        height: 14,
        unit: "mm"
      },
      material: "Aleación de aluminio con sello de goma",
      max_text_lines: 2,
      recommended_uses: ["Documentos legales", "Facturas", "Correspondencia empresarial"]
    },
    // Opciones de personalización
    customization_options: {
      allow_custom_dimensions: true,
      dimension_limits: {
        min_width: 30,
        max_width: 50,
        min_height: 10,
        max_height: 20,
        unit: "mm"
      },
      text_customization: {
        max_lines: 2,
        max_chars_per_line: 18,
        supported_fonts: ["Arial", "Times New Roman", "Courier"],
        allow_multiline: true
      },
      color_options: {
        available_colors: ["#000000", "#000080", "#800000", "#008000"],
        default_color: "#000000"
      },
      price_multipliers: {
        dimension_multiplier: 25,
        color_multiplier: 2500,
        text_multiplier: 4000
      }
    }
  }
];

export const mockCategories = [
  { id: 1, name: "Románticos", slug: "romanticos", count: 1 },
  { id: 2, name: "Celebraciones", slug: "celebraciones", count: 1 },
  { id: 3, name: "Infantiles", slug: "infantiles", count: 1 },
  { id: 4, name: "Bodas", slug: "bodas", count: 1 },
  { id: 5, name: "Académicos", slug: "academicos", count: 1 },
  { id: 6, name: "Festivos", slug: "festivos", count: 1 },
  { id: 7, name: "Profesionales", slug: "profesionales", count: 1 }
];
