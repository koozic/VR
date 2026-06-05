$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
try {
  $html = $wc.DownloadString('https://myemulatoronline.net/psx/initial-d/')
  Write-Output "Page length: $($html.Length)"
  
  $idx = $html.IndexOf('EJS_')
  if ($idx -ge 0) {
    Write-Output "EJS_ found at index $idx"
    $start = [Math]::Max(0, $idx - 500)
    $len = [Math]::Min(8000, $html.Length - $start)
    Write-Output $html.Substring($start, $len)
  } else {
    Write-Output "No EJS_ found"
    # Check for script tags that might contain emulatorJS
    $idx2 = $html.IndexOf('emulatorjs.org')
    if ($idx2 -ge 0) { Write-Output "emulatorjs.org found at $idx2" }
    $idx3 = $html.IndexOf('cdn.emulatorjs')
    if ($idx3 -ge 0) { Write-Output "cdn.emulatorjs found at $idx3" }
    $idx4 = $html.IndexOf('loader.js')
    if ($idx4 -ge 0) { Write-Output "loader.js found at $idx4" }
  }
} catch {
  Write-Output "Error: $($_.Exception.Message)"
}
