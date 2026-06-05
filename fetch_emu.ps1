$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
try {
  $html = $wc.DownloadString('https://emulatorgamer.com/games/initial-d-ps/play')
  Write-Output "Page length: $($html.Length)"
  
  $idx = $html.IndexOf('EJS_')
  if ($idx -ge 0) {
    Write-Output "EJS_ found at index $idx"
    $start = [Math]::Max(0, $idx - 300)
    $len = [Math]::Min(5000, $html.Length - $start)
    Write-Output "=== CONTEXT ==="
    Write-Output $html.Substring($start, $len)
  } else {
    Write-Output "No EJS_ found in page source"
    if ($html -match 'iframe') {
      Write-Output "iframe found in source"
    }
    if ($html -match 'src="([^"]+)"') {
      Write-Output "First src: $($matches[1])"
    }
  }
} catch {
  Write-Output "Error: $($_.Exception.Message)"
}
