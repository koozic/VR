$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'Mozilla/5.0')
try {
  $html = $wc.DownloadString('https://oldgames.app/games/ps1/initial-d-ps1-9240')
  Write-Output "Page loaded. Length: " + $html.Length
  $index = $html.IndexOf('iframe')
  if ($index -ge 0) {
    Write-Output "iframe found at index $index"
    $start = [Math]::Max(0, $index - 200)
    $len = [Math]::Min(500, $html.Length - $start)
    Write-Output $html.Substring($start, $len)
  } else {
    Write-Output 'No iframe found in raw source'
  }
  $playIdx = $html.IndexOf('/play/')
  if ($playIdx -ge 0) {
    Write-Output "play path found at $playIdx"
    $start = [Math]::Max(0, $playIdx - 100)
    $len = [Math]::Min(300, $html.Length - $start)
    Write-Output $html.Substring($start, $len)
  } else {
    Write-Output 'No /play/ path found'
  }
  $embedIdx = $html.IndexOf('/embed')
  if ($embedIdx -ge 0) {
    Write-Output "embed path at $embedIdx"
    Write-Output $html.Substring($embedIdx, [Math]::Min(100, $html.Length - $embedIdx))
  }
} catch {
  Write-Output "Error: " + $_.Exception.Message
}
