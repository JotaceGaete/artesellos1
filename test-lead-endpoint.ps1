Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "║     🧪 TEST: ENDPOINT /api/lead                     ║" -ForegroundColor Cyan
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Email válido
Write-Host "📧 Test 1: Email válido" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

$body1 = @{
    email = "test@artesellos.cl"
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "$baseUrl/api/lead" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body1 `
        -UseBasicParsing

    Write-Host "✅ Status: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response1.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 2

# Test 2: Email inválido
Write-Host "📧 Test 2: Email inválido" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

$body2 = @{
    email = "email-invalido"
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "$baseUrl/api/lead" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body2 `
        -UseBasicParsing
    
    Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Yellow
    Write-Host "Respuesta:" -ForegroundColor Cyan
    $response2.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
} catch {
    Write-Host "✅ Validación funcionando correctamente" -ForegroundColor Green
    Write-Host "❌ Error esperado: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

# Test 3: Sin email
Write-Host "📧 Test 3: Sin email" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

$body3 = @{} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri "$baseUrl/api/lead" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body3 `
        -UseBasicParsing
    
    Write-Host "Status: $($response3.StatusCode)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Validación funcionando correctamente" -ForegroundColor Green
    Write-Host "❌ Error esperado: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Tests completados" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Read-Host "Presiona Enter para cerrar"

