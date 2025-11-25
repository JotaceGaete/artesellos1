'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number | null;
  stock_status: string;
  categories?: string[];
}

interface ProductSearchProps {
  products: Product[];
  onFilteredProductsChange: (filteredProducts: Product[]) => void;
}

export default function ProductSearch({ products, onFilteredProductsChange }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return products.filter((product) => {
      // Búsqueda por nombre
      if (product.name?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Búsqueda por slug
      if (product.slug?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Búsqueda por precio (número)
      const priceStr = product.price?.toString() || '';
      if (priceStr.includes(query)) {
        return true;
      }
      
      // Búsqueda por stock (número)
      const stockStr = product.stock_quantity?.toString() || '';
      if (stockStr.includes(query)) {
        return true;
      }
      
      // Búsqueda por categorías
      if (product.categories && Array.isArray(product.categories)) {
        const categoriesStr = product.categories.join(' ').toLowerCase();
        if (categoriesStr.includes(query)) {
          return true;
        }
      }
      
      return false;
    });
  }, [products, searchQuery]);

  // Notificar cambios en productos filtrados
  useEffect(() => {
    onFilteredProductsChange(filteredProducts);
  }, [filteredProducts, onFilteredProductsChange]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, slug, precio, stock o categoría..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {searchQuery && (
        <div className="text-sm text-gray-600">
          Mostrando {filteredProducts.length} de {products.length} productos
          {filteredProducts.length !== products.length && (
            <span className="ml-2 text-gray-400">
              (filtrado por: "{searchQuery}")
            </span>
          )}
        </div>
      )}
    </div>
  );
}

