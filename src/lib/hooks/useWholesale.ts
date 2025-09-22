'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { UserRole, WholesaleAccount, WholesalePricing, PriceLevel } from '@/types/wholesale'

interface UseWholesaleReturn {
  user: User | null
  userRole: UserRole
  wholesaleAccount: WholesaleAccount | null
  isWholesaleUser: boolean
  isApprovedWholesale: boolean
  loading: boolean
  getProductPrice: (productId: string, retailPrice: number) => WholesalePricing
  refreshAccount: () => Promise<void>
}

export function useWholesale(): UseWholesaleReturn {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('ANON')
  const [wholesaleAccount, setWholesaleAccount] = useState<WholesaleAccount | null>(null)
  const [loading, setLoading] = useState(true)

  // Configuración de descuentos por nivel
  const LEVEL_DISCOUNTS = {
    A: 30, // -30%
    B: 25, // -25%
    C: 20  // -20%
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      } else {
        setUser(null)
        setUserRole('ANON')
        setWholesaleAccount(null)
      }
      setLoading(false)
    })

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Obtener perfil con role
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Error loading profile:', profileError)
        return
      }

      const role = profile.role || 'CLIENTE'
      setUserRole(role)

      // Si es comercio, obtener cuenta mayorista
      if (role === 'COMERCIO') {
        const { data: account, error: accountError } = await (supabase as any)
          .from('wholesale_accounts')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (accountError && accountError.code !== 'PGRST116') {
          console.error('Error loading wholesale account:', accountError)
        } else {
          setWholesaleAccount(account)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const refreshAccount = async () => {
    if (user) {
      await loadUserData(user.id)
    }
  }

  const getProductPrice = (productId: string, retailPrice: number): WholesalePricing => {
    // Si no es usuario mayorista aprobado, devolver precio retail
    if (!isApprovedWholesale) {
      return {
        retail_price: retailPrice,
        final_price: retailPrice,
        is_wholesale: false
      }
    }

    // TODO: Aquí se implementaría la lógica para obtener precios específicos
    // desde la tabla product_prices y aplicar descuentos por nivel
    
    // Por ahora, aplicar descuento según el nivel
    const level = wholesaleAccount?.nivel
    if (level && LEVEL_DISCOUNTS[level]) {
      const discountPercentage = LEVEL_DISCOUNTS[level]
      const finalPrice = retailPrice * (1 - discountPercentage / 100)
      
      return {
        retail_price: retailPrice,
        wholesale_price: finalPrice,
        discount_percentage: discountPercentage,
        level,
        final_price: finalPrice,
        is_wholesale: true
      }
    }

    // Sin nivel asignado, devolver precio retail
    return {
      retail_price: retailPrice,
      final_price: retailPrice,
      is_wholesale: false
    }
  }

  const isWholesaleUser = userRole === 'COMERCIO'
  const isApprovedWholesale = isWholesaleUser && wholesaleAccount?.status === 'approved'

  return {
    user,
    userRole,
    wholesaleAccount,
    isWholesaleUser,
    isApprovedWholesale,
    loading,
    getProductPrice,
    refreshAccount
  }
}
