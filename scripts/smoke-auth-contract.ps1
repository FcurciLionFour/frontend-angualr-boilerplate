param(
  [string]$BaseUrl = $(if ($env:API_BASE_URL) { $env:API_BASE_URL } else { 'http://localhost:3000' }),
  [string]$Email = $env:SMOKE_AUTH_EMAIL,
  [string]$Password = $env:SMOKE_AUTH_PASSWORD
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-Value {
  param(
    [bool]$Condition,
    [string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

Write-Host "[INFO] Base URL: $BaseUrl"

Assert-Value -Condition (-not [string]::IsNullOrWhiteSpace($Email)) -Message "Missing email. Set SMOKE_AUTH_EMAIL or pass -Email."
Assert-Value -Condition (-not [string]::IsNullOrWhiteSpace($Password)) -Message "Missing password. Set SMOKE_AUTH_PASSWORD or pass -Password."

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$baseUri = [System.Uri]$BaseUrl

Write-Host "[STEP] GET /health"
$health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/health" -WebSession $session -TimeoutSec 20
Assert-Value -Condition ($health.status -eq 'ok') -Message "Health check failed. Expected status='ok'."
Write-Host "[OK] /health"

Write-Host "[STEP] GET /auth/csrf"
$csrfInit = Invoke-WebRequest -Method Get -Uri "$BaseUrl/auth/csrf" -WebSession $session -TimeoutSec 20
Assert-Value -Condition ($csrfInit.StatusCode -eq 200) -Message "CSRF init failed. Expected 200."

$csrfToken = (
  $session.Cookies.GetCookies($baseUri) |
    Where-Object { $_.Name -eq 'csrf_token' } |
    Select-Object -First 1
).Value

Assert-Value -Condition (-not [string]::IsNullOrWhiteSpace($csrfToken)) -Message "Missing csrf_token cookie after /auth/csrf."
Write-Host "[OK] /auth/csrf"

Write-Host "[STEP] POST /auth/login"
$loginBody = @{
  email = $Email
  password = $Password
} | ConvertTo-Json

$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -WebSession $session -ContentType 'application/json' -Body $loginBody -TimeoutSec 20
Assert-Value -Condition (-not [string]::IsNullOrWhiteSpace([string]$login.accessToken)) -Message "Login failed. Missing accessToken."
$accessToken = [string]$login.accessToken
Write-Host "[OK] /auth/login"

Write-Host "[STEP] GET /auth/me"
$me = Invoke-RestMethod -Method Get -Uri "$BaseUrl/auth/me" -WebSession $session -Headers @{ Authorization = "Bearer $accessToken" } -TimeoutSec 20
Assert-Value -Condition ($null -ne $me.user) -Message "Me failed. Missing user object."
Assert-Value -Condition (-not [string]::IsNullOrWhiteSpace([string]$me.user.email)) -Message "Me failed. Missing user.email."
Write-Host "[OK] /auth/me -> $($me.user.email)"

Write-Host "[STEP] POST /auth/logout"
$logoutHeaders = @{
  'x-csrf-token' = $csrfToken
}

$logout = Invoke-WebRequest -Method Post -Uri "$BaseUrl/auth/logout" -WebSession $session -Headers $logoutHeaders -ContentType 'application/json' -Body '{}' -TimeoutSec 20
Assert-Value -Condition ($logout.StatusCode -eq 204) -Message "Logout failed. Expected 204."
Write-Host "[OK] /auth/logout"

Write-Host "[DONE] Auth contract smoke test passed."
