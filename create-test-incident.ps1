Write-Host "🚨 Creating Test Incident..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

# Create a test incident
$incidentData = @{
    title = "Langsame Antwortzeiten bei der Hauptwebsite"
    description = "Benutzer melden verlangsamte Ladezeiten auf der Hauptwebsite. Wir untersuchen das Problem."
    impact = "degraded"
    affectedServices = @("main-website", "guides-system")
} | ConvertTo-Json

Write-Host ""
Write-Host "📝 Creating incident with data:" -ForegroundColor Cyan
Write-Host $incidentData

Write-Host ""
Write-Host "🔄 Sending to API..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/incidents" -Method POST -Body $incidentData -ContentType "application/json"
    
    Write-Host ""
    Write-Host "📋 Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
    if ($response.id) {
        Write-Host ""
        Write-Host "✅ Incident created successfully!" -ForegroundColor Green
        Write-Host "🆔 Incident ID: $($response.id)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📊 Testing incident retrieval:" -ForegroundColor Cyan
        $activeIncidents = Invoke-RestMethod -Uri "http://localhost:3001/api/incidents?status=active"
        Write-Host "Active incidents count: $($activeIncidents.incidents.Count)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🔍 Active incidents:" -ForegroundColor Cyan
        $activeIncidents.incidents | ForEach-Object {
            Write-Host "- ID: $($_.id), Title: $($_.title), Status: $($_.status), Impact: $($_.impact)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "💡 To resolve this incident later, use:" -ForegroundColor Yellow
        Write-Host "   Invoke-RestMethod -Uri 'http://localhost:3001/api/incidents/$($response.id)' -Method PUT -Body '{\"status\":\"resolved\"}' -ContentType 'application/json'" -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "🧹 To delete this test incident:" -ForegroundColor Yellow
        Write-Host "   Invoke-RestMethod -Uri 'http://localhost:3001/api/incidents/$($response.id)' -Method DELETE" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ Failed to create incident" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error creating incident: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔍 Make sure the monitoring server is running on localhost:3001" -ForegroundColor Yellow
}