export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const supabase = await createSupabaseServer();
    
    // Test 1: Verificar conexión básica
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Supabase connection failed:', healthError);
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: healthError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Test 2: Verificar si hay productos en Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(5);
    
    if (productsError) {
      console.warn('⚠️ Products table error (might not exist yet):', productsError);
    }
    
    // Test 3: Verificar si hay mensajes de contacto (tabla del sistema de email)
    const { data: contacts, error: contactsError } = await supabase
      .from('contact_messages')
      .select('id, name, created_at')
      .limit(3);
    
    if (contactsError) {
      console.warn('⚠️ Contact messages table error (might not exist yet):', contactsError);
    }
    
    // Test 4: Verificar usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('✅ Supabase connection test completed');
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      tests: {
        basicConnection: !healthError,
        productsTable: {
          exists: !productsError,
          count: products?.length || 0,
          sample: products?.slice(0, 2) || [],
          error: productsError?.message || null
        },
        contactsTable: {
          exists: !contactsError,
          count: contacts?.length || 0,
          sample: contacts?.slice(0, 2) || [],
          error: contactsError?.message || null
        },
        authentication: {
          hasUser: !!user,
          userId: user?.id || null,
          userEmail: user?.email || null,
          error: userError?.message || null
        }
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing',
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Unexpected error in Supabase test:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
