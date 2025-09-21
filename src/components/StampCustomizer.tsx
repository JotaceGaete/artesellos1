'use client';

import React, { useState, useEffect } from 'react';
import { Product, CustomizedProduct } from '@/types/product';
import {
  calculateCustomizedPrice,
  validateCustomDimensions,
  validateCustomText,
  formatDimensions,
  calculateArea,
  formatPrice
} from '@/lib/pricingUtils';

interface StampCustomizerProps {
  product: Product;
  onCustomizationChange: (customizedProduct: CustomizedProduct | null) => void;
  initialColor?: string;
}

export default function StampCustomizer({ product, onCustomizationChange, initialColor }: StampCustomizerProps) {
  const [customizations, setCustomizations] = useState({
    dimensions: {
      width: product.stamp_info?.default_dimensions.width || 38,
      height: product.stamp_info?.default_dimensions.height || 14,
      unit: product.stamp_info?.default_dimensions.unit || 'mm'
    },
    text_lines: [''],
    selected_color: initialColor || product.customization_options?.color_options.default_color || '#000000',
    font: 'Arial'
  });

  const [calculatedPrice, setCalculatedPrice] = useState(parseFloat(product.price));
  const [customizationFee, setCustomizationFee] = useState(0);
  const [inkSurcharge, setInkSurcharge] = useState(0);

  // Sincronizar color cuando cambie desde la UI principal
  useEffect(() => {
    if (initialColor && initialColor !== customizations.selected_color) {
      setCustomizations(prev => ({
        ...prev,
        selected_color: initialColor
      }));
    }
  }, [initialColor]);

  // Calcular precio basado solo en recargo de tinta (sin costo de personalización)
  useEffect(() => {
    // Base del producto (sin cargos por personalización)
    const base = parseFloat(product.price);
    const surcharge = customizations.selected_color && customizations.selected_color !== '#000000' ? 2000 : 0;

    setCustomizationFee(0);
    setCalculatedPrice(base + surcharge);
    setInkSurcharge(surcharge);

    // Notificar cambios al componente padre
    const customizedProduct: CustomizedProduct = {
      base_product: product,
      customizations,
      calculated_price: base + surcharge,
      customization_fee: 0
    };

    onCustomizationChange(customizedProduct);
  }, [customizations, product, onCustomizationChange]);

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (!product.customization_options) return;

    const limits = product.customization_options.dimension_limits;
    const clampedValue = Math.max(limits[`min_${dimension}`], Math.min(limits[`max_${dimension}`], value));

    setCustomizations(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: clampedValue
      }
    }));
  };

  const handleTextLineChange = (index: number, value: string) => {
    if (!product.customization_options?.text_customization.allow_multiline) return;

    const maxChars = product.customization_options.text_customization.max_chars_per_line;
    if (value.length > maxChars) return;

    setCustomizations(prev => {
      const newLines = [...prev.text_lines];
      newLines[index] = value;
      return {
        ...prev,
        text_lines: newLines
      };
    });
  };

  const addTextLine = () => {
    if (!product.customization_options?.text_customization.allow_multiline) return;
    if (customizations.text_lines.length >= product.customization_options.text_customization.max_lines) return;

    setCustomizations(prev => ({
      ...prev,
      text_lines: [...prev.text_lines, '']
    }));
  };

  const removeTextLine = (index: number) => {
    if (customizations.text_lines.length <= 1) return;

    setCustomizations(prev => ({
      ...prev,
      text_lines: prev.text_lines.filter((_, i) => i !== index)
    }));
  };

  if (!product.customization_options || !product.stamp_info) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        ✏️ Personalizar Timbre
      </h3>

      {/* Dimensiones */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Dimensiones</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Ancho ({customizations.dimensions.unit})
            </label>
            <input
              type="number"
              value={customizations.dimensions.width}
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
              min={product.customization_options.dimension_limits.min_width}
              max={product.customization_options.dimension_limits.max_width}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Alto ({customizations.dimensions.unit})
            </label>
            <input
              type="number"
              value={customizations.dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
              min={product.customization_options.dimension_limits.min_height}
              max={product.customization_options.dimension_limits.max_height}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Área: {calculateArea(customizations.dimensions).toFixed(1)} {customizations.dimensions.unit}²
        </p>
      </div>

      {/* Texto */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Texto</h4>
        {customizations.text_lines.map((line, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={line}
              onChange={(e) => handleTextLineChange(index, e.target.value)}
              placeholder={`Línea ${index + 1}`}
              maxLength={product.customization_options.text_customization.max_chars_per_line}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {customizations.text_lines.length > 1 && (
              <button
                onClick={() => removeTextLine(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {customizations.text_lines.length < product.customization_options.text_customization.max_lines && (
          <button
            onClick={addTextLine}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            + Agregar línea de texto
          </button>
        )}
      </div>

      {/* Color */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Color de tinta</h4>
        <div className="flex flex-wrap gap-2">
          {product.customization_options.color_options.available_colors.map((color) => (
            <button
              key={color}
              onClick={() => setCustomizations(prev => ({ ...prev, selected_color: color }))}
              className={`w-8 h-8 rounded-full border-2 ${
                customizations.selected_color === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Vista previa */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Vista previa</h4>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 mx-auto"
          style={{
            width: `${Math.min(customizations.dimensions.width * 2, 200)}px`,
            height: `${Math.min(customizations.dimensions.height * 2, 150)}px`,
            aspectRatio: `${customizations.dimensions.width} / ${customizations.dimensions.height}`
          }}
        >
          <div className="w-full h-full flex flex-col justify-center items-center">
            {customizations.text_lines.filter(line => line.trim()).map((line, index) => (
              <div
                key={index}
                className="text-center font-semibold"
                style={{
                  color: customizations.selected_color,
                  fontSize: `${Math.max(8, Math.min(16, customizations.dimensions.height / customizations.text_lines.length))}px`,
                  fontFamily: customizations.font
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de precios */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen de precio</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Precio base:</span>
            <span>{formatPrice(parseFloat(product.price))}</span>
          </div>
          {/* Sin costo de personalización */}
          {inkSurcharge > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Recargo tinta:</span>
              <span>+{formatPrice(inkSurcharge)}</span>
            </div>
          )}
          <div className="border-t pt-1 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatPrice(calculatedPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
