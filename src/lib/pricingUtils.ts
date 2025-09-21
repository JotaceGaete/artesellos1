import { Product, CustomizedProduct } from '@/types/product';

/**
 * Calcula el precio personalizado de un timbre basado en las personalizaciones
 */
export function calculateCustomizedPrice(
  product: Product,
  customizations: CustomizedProduct['customizations']
): { basePrice: number; customizationFee: number; totalPrice: number } {
  if (!product.customization_options) {
    return {
      basePrice: parseFloat(product.price),
      customizationFee: 0,
      totalPrice: parseFloat(product.price)
    };
  }

  const basePrice = parseFloat(product.price);
  let customizationFee = 0;

  // Calcular costo por dimensiones personalizadas
  if (product.stamp_info) {
    const defaultArea = product.stamp_info.default_dimensions.width * product.stamp_info.default_dimensions.height;
    const customArea = customizations.dimensions.width * customizations.dimensions.height;
    const areaDifference = customArea - defaultArea;

    if (areaDifference > 0) {
      const extraAreaCost = areaDifference * product.customization_options.price_multipliers.dimension_multiplier;
      customizationFee += extraAreaCost;
    }
  }

  // Calcular costo por líneas de texto adicionales
  const textLines = customizations.text_lines.filter(line => line.trim() !== '').length;
  if (textLines > 1) {
    const extraTextCost = (textLines - 1) * product.customization_options.price_multipliers.text_multiplier;
    customizationFee += extraTextCost;
  }

  // Calcular costo por color personalizado
  if (customizations.selected_color !== product.customization_options.color_options.default_color) {
    customizationFee += product.customization_options.price_multipliers.color_multiplier;
  }

  return {
    basePrice,
    customizationFee,
    totalPrice: basePrice + customizationFee
  };
}

/**
 * Valida que las dimensiones personalizadas estén dentro de los límites permitidos
 */
export function validateCustomDimensions(
  product: Product,
  dimensions: { width: number; height: number }
): { isValid: boolean; errors: string[] } {
  if (!product.customization_options) {
    return { isValid: false, errors: ['Este producto no permite personalización'] };
  }

  const limits = product.customization_options.dimension_limits;
  const errors: string[] = [];

  if (dimensions.width < limits.min_width) {
    errors.push(`El ancho mínimo es ${limits.min_width}${limits.unit}`);
  }
  if (dimensions.width > limits.max_width) {
    errors.push(`El ancho máximo es ${limits.max_width}${limits.unit}`);
  }
  if (dimensions.height < limits.min_height) {
    errors.push(`El alto mínimo es ${limits.min_height}${limits.unit}`);
  }
  if (dimensions.height > limits.max_height) {
    errors.push(`El alto máximo es ${limits.max_height}${limits.unit}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida el texto personalizado
 */
export function validateCustomText(
  product: Product,
  textLines: string[]
): { isValid: boolean; errors: string[] } {
  if (!product.customization_options) {
    return { isValid: false, errors: ['Este producto no permite personalización'] };
  }

  const textOptions = product.customization_options.text_customization;
  const errors: string[] = [];

  // Validar número de líneas
  if (textLines.length > textOptions.max_lines) {
    errors.push(`Máximo ${textOptions.max_lines} líneas de texto permitidas`);
  }

  // Validar longitud de cada línea
  textLines.forEach((line, index) => {
    if (line.length > textOptions.max_chars_per_line) {
      errors.push(`Línea ${index + 1}: máximo ${textOptions.max_chars_per_line} caracteres`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formatea dimensiones para mostrar
 */
export function formatDimensions(dimensions: { width: number; height: number; unit: string }): string {
  return `${dimensions.width} x ${dimensions.height} ${dimensions.unit}`;
}

/**
 * Calcula el área de las dimensiones
 */
export function calculateArea(dimensions: { width: number; height: number }): number {
  return dimensions.width * dimensions.height;
}

/**
 * Obtiene el precio formateado en pesos chilenos (sin decimales)
 */
export function formatPrice(price: number): string {
  // Redondear a entero y formatear con separador de miles
  const roundedPrice = Math.round(price);
  return `$${roundedPrice.toLocaleString('es-CL')}`;
}
