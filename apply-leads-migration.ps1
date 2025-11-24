Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "║     🎯 MIGRACIÓN: TABLA DE LEADS                    ║" -ForegroundColor Cyan
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Leer el archivo SQL
$sqlFile = "supabase/migrations/create_leads_table.sql"

if (!(Test-Path $sqlFile)) {
    Write-Host "❌ Error: No se encontró el archivo $sqlFile" -ForegroundColor Red
    exit 1
}

$sql = Get-Content -Path $sqlFile -Raw

Write-Host "📋 SQL QUE SE APLICARÁ:" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host $sql -ForegroundColor White
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "  1. El SQL ha sido copiado a tu portapapeles" -ForegroundColor White
Write-Host "  2. Ve a tu Supabase Dashboard" -ForegroundColor White
Write-Host "  3. Navega a: SQL Editor" -ForegroundColor White
Write-Host "  4. Pega el SQL (Ctrl+V)" -ForegroundColor White
Write-Host "  5. Haz clic en 'Run'" -ForegroundColor White
Write-Host ""

Write-Host "🔗 LINK DIRECTO:" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/_/sql" -ForegroundColor Cyan
Write-Host ""

# Copiar al portapapeles
try {
    Set-Clipboard -Value $sql
    Write-Host "✅ SQL copiado al portapapeles exitosamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se pudo copiar al portapapeles automáticamente" -ForegroundColor Yellow
    Write-Host "   Copia manualmente el SQL de arriba" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 DESPUÉS DE EJECUTAR EN SUPABASE:" -ForegroundColor Yellow
Write-Host "  • Verifica que la tabla 'leads' exista" -ForegroundColor White
Write-Host "  • Prueba el endpoint: POST /api/lead" -ForegroundColor White
Write-Host "  • Abre el chat y prueba el formulario de email" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para continuar"

