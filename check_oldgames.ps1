$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
try {
  $html = $wc.DownloadString('https://oldgames.app/games/ps1/initial-d-ps1-9240')
  Write-Output "Page length: $($html.Length)"
  
  # Save to file for analysis
  $html | Out-File -FilePath "oldgames_page.html" -Encoding UTF8
  
  # Check for common patterns
  $patterns = @(
    'EJS_gameUrl',
    'EJS_pathToData',
    'romUrl',
    'gameUrl',
    'iframe',
    'emulator'
  )
  foreach ($p in $patterns) {
    if ($html -match $p) {
      Write-Output "Found pattern: $p"
    }
  }
  
  # Show first 5000 chars
  Write-Output "=== FIRST 5000 CHARS ==="
  Write-Output $html.Substring(0, [Math]::Min(5000, $html.Length))
} catch {
  Write-Output "Error: $($_.Exception.Message)"
}
