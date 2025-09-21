'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '@/types/product';

interface FavoritesState {
  items: Product[];
  itemIds: Set<string>;
}

interface FavoritesContextType {
  favorites: FavoritesState;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

type FavoritesAction =
  | { type: 'ADD_TO_FAVORITES'; product: Product }
  | { type: 'REMOVE_FROM_FAVORITES'; productId: string }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; favorites: Product[] };

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'ADD_TO_FAVORITES': {
      if (state.itemIds.has(action.product.id)) {
        return state; // Ya está en favoritos
      }
      const newItems = [...state.items, action.product];
      const newItemIds = new Set([...state.itemIds, action.product.id]);
      return {
        items: newItems,
        itemIds: newItemIds,
      };
    }

    case 'REMOVE_FROM_FAVORITES': {
      const newItems = state.items.filter(item => item.id !== action.productId);
      const newItemIds = new Set(state.itemIds);
      newItemIds.delete(action.productId);
      return {
        items: newItems,
        itemIds: newItemIds,
      };
    }

    case 'CLEAR_FAVORITES':
      return {
        items: [],
        itemIds: new Set(),
      };

    case 'LOAD_FAVORITES':
      return {
        items: action.favorites,
        itemIds: new Set(action.favorites.map(item => item.id)),
      };

    default:
      return state;
  }
}

const initialState: FavoritesState = {
  items: [],
  itemIds: new Set(),
};

const STORAGE_KEY = 'artesellos_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, initialState);

  // Cargar favoritos del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedFavorites = JSON.parse(stored);
        dispatch({ type: 'LOAD_FAVORITES', favorites: parsedFavorites });
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.items));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites.items]);

  const addToFavorites = (product: Product) => {
    dispatch({ type: 'ADD_TO_FAVORITES', product });
  };

  const removeFromFavorites = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_FAVORITES', productId });
  };

  const isFavorite = (productId: string) => {
    return favorites.itemIds.has(productId);
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      clearFavorites,
      toggleFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
