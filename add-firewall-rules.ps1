# Add Windows Firewall Rules for Backend and Frontend Ports
# Run this script as Administrator

Write-Host "Adding firewall rules for ports 8000 and 5173..." -ForegroundColor Yellow

# Add rule for backend port 8000
netsh advfirewall firewall add rule name="Moments Backend Port 8000" dir=in action=allow protocol=TCP localport=8000
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Added firewall rule for port 8000 (Backend)" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to add firewall rule for port 8000" -ForegroundColor Red
}

# Add rule for frontend port 5173
netsh advfirewall firewall add rule name="Moments Frontend Port 5173" dir=in action=allow protocol=TCP localport=5173
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Added firewall rule for port 5173 (Frontend)" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to add firewall rule for port 5173" -ForegroundColor Red
}

Write-Host "`nFirewall rules added! Now restart your backend with: --host 0.0.0.0" -ForegroundColor Cyan

