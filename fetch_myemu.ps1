$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0')
try {
  $html = $wc.DownloadString('https://myemulatoronline.net/psx/initial-d/')
  Write-Output "Length: $($html.Length)"
  if ($html.Length -gt 7000) {
    $section = $html.Substring(7000, [Math]::Min(5000, $html.Length-7000))
    Write-Output $section
  }
} catch {
  Write-Output "Error: $($_.Exception.Message)"
}
