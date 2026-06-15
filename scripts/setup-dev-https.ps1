param(
    [Parameter(Mandatory = $true)]
    [string]$ServerIp
)

$ErrorActionPreference = "Stop"

$parsedIp = $null
if (-not [System.Net.IPAddress]::TryParse($ServerIp, [ref]$parsedIp) `
        -or $parsedIp.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
    throw "ServerIp must be a valid IPv4 address. Example: 10.1.82.107"
}

$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$certDir = Join-Path $root "frontend\.cert"
$pfxPath = Join-Path $certDir "dev-https.pfx"
$ipPath = Join-Path $certDir "dev-https-ip.txt"
$caKeyPath = Join-Path $certDir "dev-root-ca.key"
$caPemPath = Join-Path $certDir "dev-root-ca.pem"
$caCerPath = Join-Path $certDir "dev-root-ca.cer"
$caSerialPath = Join-Path $certDir "dev-root-ca.srl"
$serverKeyPath = Join-Path $certDir "dev-server.key"
$serverCsrPath = Join-Path $certDir "dev-server.csr"
$serverCrtPath = Join-Path $certDir "dev-server.crt"
$opensslConfigPath = Join-Path $certDir "dev-server-openssl.cnf"

$opensslCommand = Get-Command openssl.exe -ErrorAction SilentlyContinue
if ($null -ne $opensslCommand) {
    $openssl = $opensslCommand.Source
} else {
    $gitOpenSsl = "C:\Program Files\Git\mingw64\bin\openssl.exe"
    if (-not (Test-Path -LiteralPath $gitOpenSsl)) {
        throw "OpenSSL was not found. Install Git for Windows or add openssl.exe to PATH."
    }
    $openssl = $gitOpenSsl
}

New-Item -ItemType Directory -Force -Path $certDir | Out-Null
$generatedPaths = @(
    $pfxPath,
    $ipPath,
    $caKeyPath,
    $caPemPath,
    $caCerPath,
    $caSerialPath,
    $serverKeyPath,
    $serverCsrPath,
    $serverCrtPath,
    $opensslConfigPath
)
Remove-Item -LiteralPath $generatedPaths -Force -ErrorAction SilentlyContinue

$opensslConfig = @"
[req]
prompt = no
distinguished_name = subject
req_extensions = server_extensions

[subject]
CN = $ServerIp

[server_extensions]
basicConstraints = critical,CA:FALSE
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alternate_names

[alternate_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = $ServerIp
"@
[System.IO.File]::WriteAllText(
    $opensslConfigPath,
    $opensslConfig,
    [System.Text.UTF8Encoding]::new($false)
)

& $openssl genrsa -out $caKeyPath 2048
if ($LASTEXITCODE -ne 0) { throw "Failed to create the development CA private key." }

& $openssl req `
    -x509 `
    -new `
    -key $caKeyPath `
    -sha256 `
    -days 730 `
    -subj "/CN=AI Exhibition Development Root CA" `
    -addext "basicConstraints=critical,CA:TRUE" `
    -addext "keyUsage=critical,keyCertSign,cRLSign" `
    -out $caPemPath
if ($LASTEXITCODE -ne 0) { throw "Failed to create the development CA certificate." }

& $openssl genrsa -out $serverKeyPath 2048
if ($LASTEXITCODE -ne 0) { throw "Failed to create the HTTPS server private key." }

& $openssl req `
    -new `
    -key $serverKeyPath `
    -out $serverCsrPath `
    -config $opensslConfigPath
if ($LASTEXITCODE -ne 0) { throw "Failed to create the HTTPS certificate request." }

& $openssl x509 `
    -req `
    -in $serverCsrPath `
    -CA $caPemPath `
    -CAkey $caKeyPath `
    -CAcreateserial `
    -out $serverCrtPath `
    -days 730 `
    -sha256 `
    -extfile $opensslConfigPath `
    -extensions server_extensions
if ($LASTEXITCODE -ne 0) { throw "Failed to sign the HTTPS server certificate." }

& $openssl pkcs12 `
    -export `
    -out $pfxPath `
    -inkey $serverKeyPath `
    -in $serverCrtPath `
    -certfile $caPemPath `
    -passout "pass:vr-dev-pass"
if ($LASTEXITCODE -ne 0) { throw "Failed to create the Vite PFX certificate." }

& $openssl x509 `
    -in $caPemPath `
    -outform DER `
    -out $caCerPath
if ($LASTEXITCODE -ne 0) { throw "Failed to export the public CA certificate." }

Set-Content -LiteralPath $ipPath -Value $ServerIp -Encoding ASCII

Write-Host ""
Write-Host "Development HTTPS files created without changing Windows trust settings."
Write-Host "Server URL after restarting Vite: https://$ServerIp`:5173"
Write-Host "Public CA certificate for classroom PCs: $caCerPath"
Write-Host ""
Write-Host "Run this explicitly on the server PC and every classroom PC:"
Write-Host "certutil -user -addstore Root `"$caCerPath`""
Write-Host ""
Write-Warning "Never copy or share dev-https.pfx, dev-root-ca.key, or dev-server.key."
