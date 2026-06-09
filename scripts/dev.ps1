param(
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "restart",
    [ValidateSet("local", "default")]
    [string]$BackendProfile = "local"
)

$ErrorActionPreference = "Stop"

$Root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$StateDir = Join-Path $Root ".dev"
$StateFile = Join-Path $StateDir "processes.json"
$LogDir = Join-Path $Root "logs"
$Ports = [ordered]@{
    frontend = 5173
    backend = 8080
    ai = 8010
}

function Get-GitValue([string[]]$Arguments) {
    $value = & git -C $Root @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Arguments -join ' ')"
    }
    return ($value | Out-String).Trim()
}

function Get-ProcessInfo([int]$ProcessId) {
    Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
}

function Get-DescendantIds([int]$ProcessId) {
    $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" -ErrorAction SilentlyContinue)
    $ids = @()
    foreach ($child in $children) {
        $ids += Get-DescendantIds ([int]$child.ProcessId)
        $ids += [int]$child.ProcessId
    }
    return $ids
}

function Test-DirectProjectProcess($ProcessInfo) {
    if ($null -eq $ProcessInfo) {
        return $false
    }

    $commandLine = [string]$ProcessInfo.CommandLine
    if ($commandLine.IndexOf($Root, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
        return $true
    }

    if ($commandLine -match "@([^\s]+\.argfile)") {
        $argFile = $Matches[1].Trim('"')
        if (Test-Path -LiteralPath $argFile) {
            $arguments = Get-Content -Raw -LiteralPath $argFile
            if ($arguments.IndexOf($Root, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                return $true
            }
        }
    }

    return $false
}

function Test-ProjectProcess($ProcessInfo) {
    $current = $ProcessInfo
    for ($depth = 0; $depth -lt 10 -and $null -ne $current; $depth++) {
        if (Test-DirectProjectProcess $current) {
            return $true
        }
        if ([int]$current.ParentProcessId -le 0) {
            break
        }
        $current = Get-ProcessInfo ([int]$current.ParentProcessId)
    }
    return $false
}

function Get-PortOwner([int]$Port) {
    $line = netstat.exe -ano -p tcp |
        Where-Object { $_ -match "^\s*TCP\s+\S+:$Port\s+\S+\s+LISTENING\s+(\d+)\s*$" } |
        Select-Object -First 1
    if ($null -eq $line -or $line -notmatch "LISTENING\s+(\d+)\s*$") {
        return $null
    }
    return (Get-ProcessInfo -ProcessId ([int]$Matches[1]))
}

function Stop-ProcessTree([int]$ProcessId) {
    $ids = @(Get-DescendantIds $ProcessId)
    foreach ($id in $ids + $ProcessId) {
        if (Get-Process -Id $id -ErrorAction SilentlyContinue) {
            Stop-Process -Id $id -Force
        }
    }
}

function Stop-ProjectServers {
    $rootIds = @()
    if (Test-Path -LiteralPath $StateFile) {
        try {
            $state = Get-Content -Raw -LiteralPath $StateFile | ConvertFrom-Json
            $rootIds += @($state.processes | ForEach-Object { [int]$_.pid })
        } catch {
            Write-Warning "Could not read $StateFile. Port ownership checks will still run."
        }
    }

    foreach ($entry in $Ports.GetEnumerator()) {
        $owner = Get-PortOwner $entry.Value
        if ($null -eq $owner) {
            continue
        }
        if (-not (Test-ProjectProcess $owner)) {
            throw "Port $($entry.Value) is owned by another project (PID $($owner.ProcessId)). Stop it manually or change the port."
        }
        $rootIds += [int]$owner.ProcessId
    }

    foreach ($id in @($rootIds | Sort-Object -Unique)) {
        $processInfo = Get-ProcessInfo $id
        if ($null -ne $processInfo -and (Test-ProjectProcess $processInfo)) {
            Write-Host "Stopping project process tree PID $id"
            Stop-ProcessTree $id
        }
    }

    Remove-Item -LiteralPath $StateFile -Force -ErrorAction SilentlyContinue

    $deadline = (Get-Date).AddSeconds(10)
    do {
        $occupied = @($Ports.Values | Where-Object { $null -ne (Get-PortOwner $_) })
        if ($occupied.Count -eq 0) {
            return
        }
        Start-Sleep -Milliseconds 250
    } while ((Get-Date) -lt $deadline)

    throw "Project ports are still occupied after stopping: $($occupied -join ', ')"
}

function Start-LoggedProcess(
    [string]$Name,
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$WorkingDirectory
) {
    $stdout = Join-Path $LogDir "$Name.out.log"
    $stderr = Join-Path $LogDir "$Name.err.log"
    $process = Start-Process `
        -FilePath $FilePath `
        -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -WindowStyle Hidden `
        -PassThru

    return [ordered]@{
        name = $Name
        pid = $process.Id
        command = "$FilePath $($Arguments -join ' ')"
        workingDirectory = $WorkingDirectory
        startedAt = (Get-Date).ToString("o")
    }
}

function Get-MavenCommand {
    $mvn = Get-Command mvn.cmd -ErrorAction SilentlyContinue
    if ($null -ne $mvn) {
        return $mvn.Source
    }

    $wrapperMaven = Get-ChildItem `
        -Path (Join-Path $env:USERPROFILE ".m2\wrapper\dists") `
        -Recurse `
        -Filter "mvn.cmd" `
        -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending |
        Select-Object -First 1

    if ($null -ne $wrapperMaven) {
        return $wrapperMaven.FullName
    }

    throw "Maven was not found. Install Maven, add mvn.cmd to PATH, or create a Maven wrapper cache under $env:USERPROFILE\.m2\wrapper\dists."
}

function Wait-ForHttp([string]$Name, [string]$Url, [int]$TimeoutSeconds = 60) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            return Invoke-RestMethod -Uri $Url -TimeoutSec 3
        } catch {
            Start-Sleep -Milliseconds 500
        }
    } while ((Get-Date) -lt $deadline)
    throw "$Name did not become healthy: $Url"
}

function Wait-ForFrontend([int]$Port, [int]$TimeoutSeconds = 60) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $urls = @(
        "https://localhost:$Port",
        "http://127.0.0.1:$Port"
    )

    do {
        foreach ($url in $urls) {
            $curlOutput = & curl.exe -k -s -o NUL -w "%{http_code}" $url 2>$null
            if ($LASTEXITCODE -eq 0 -and $curlOutput -match "^2\d\d$|^3\d\d$") {
                return $url
            }
        }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)

    throw "frontend did not become healthy on port $Port"
}

function Start-ProjectServers {
    New-Item -ItemType Directory -Force -Path $StateDir, $LogDir | Out-Null

    $commit = Get-GitValue -Arguments @("rev-parse", "--short", "HEAD")
    $branch = Get-GitValue -Arguments @("branch", "--show-current")
    $dirty = -not [string]::IsNullOrWhiteSpace((Get-GitValue -Arguments @("status", "--porcelain")))

    $env:GIT_COMMIT = $commit
    $env:GIT_BRANCH = $branch

    $npm = (Get-Command npm.cmd -ErrorAction Stop).Source
    $mvn = Get-MavenCommand
    $venvPython = Join-Path $Root "ai-server\.venv\Scripts\python.exe"
    $python = if (Test-Path -LiteralPath $venvPython) {
        $venvPython
    } else {
        (Get-Command python.exe -ErrorAction Stop).Source
    }

    $backendArguments = @("spring-boot:run")
    if ($BackendProfile -eq "local") {
        $backendArguments += "-Dspring-boot.run.profiles=local"
    }

    $processes = @(
        Start-LoggedProcess "frontend" $npm @("run", "dev") (Join-Path $Root "frontend")
        Start-LoggedProcess "backend" $mvn $backendArguments (Join-Path $Root "backend")
        Start-LoggedProcess "ai-server" $python @("-m", "app.main") (Join-Path $Root "ai-server")
    )

    [ordered]@{
        root = $Root
        commit = $commit
        branch = $branch
        dirty = $dirty
        processes = $processes
    } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $StateFile -Encoding UTF8

    try {
        $frontendUrl = Wait-ForFrontend $Ports.frontend 60
        $backendHealth = Wait-ForHttp "backend" "http://127.0.0.1:$($Ports.backend)/api/health" 90
        Wait-ForHttp "ai-server" "http://127.0.0.1:$($Ports.ai)/health" 60 | Out-Null

        if ($backendHealth.gitCommit -ne $commit -or $backendHealth.branch -ne $branch) {
            throw "Backend identity mismatch. Expected $branch@$commit, running $($backendHealth.branch)@$($backendHealth.gitCommit)."
        }

        Write-Host "Started $branch@$commit (dirty=$dirty)"
        Write-Host "Frontend: $frontendUrl"
        Write-Host "Backend seed: v$($backendHealth.seedVersion) $($backendHealth.seedChecksum)"
    } catch {
        Stop-ProjectServers
        throw
    }
}

function Show-Status {
    $commit = Get-GitValue -Arguments @("rev-parse", "--short", "HEAD")
    $branch = Get-GitValue -Arguments @("branch", "--show-current")
    Write-Host "Workspace: $branch@$commit"

    foreach ($entry in $Ports.GetEnumerator()) {
        $owner = Get-PortOwner $entry.Value
        if ($null -eq $owner) {
            Write-Host "$($entry.Key): stopped"
        } else {
            $owned = Test-ProjectProcess $owner
            Write-Host "$($entry.Key): PID $($owner.ProcessId), projectOwned=$owned"
        }
    }

    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$($Ports.backend)/api/health" -TimeoutSec 3 |
            ConvertTo-Json -Depth 5
    } catch {
        Write-Warning "Backend health endpoint is unavailable. A legacy backend may be running."
    }
}

switch ($Action) {
    "start" {
        foreach ($entry in $Ports.GetEnumerator()) {
            if ($null -ne (Get-PortOwner $entry.Value)) {
                throw "Port $($entry.Value) is already occupied. Use: .\scripts\dev.ps1 restart"
            }
        }
        Start-ProjectServers
    }
    "stop" {
        Stop-ProjectServers
    }
    "restart" {
        Stop-ProjectServers
        Start-ProjectServers
    }
    "status" {
        Show-Status
    }
}
