$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0')
try {
  $html = $wc.DownloadString('https://oldgames.app/games/ps1/initial-d-ps1-9240')
  $lines = $html -split "`n"
  foreach ($l in $lines) {
    if ($l -match 'src=' -or $l -match 'iframe' -or $l -match 'EJS' -or $l -match 'rom' -or $l -match 'embed' -or $l -match 'play') {
      Write-Output $l.Trim()
    }
  }
} catch {
  Write-Output "Error: $($_.Exception.Message)"
}
