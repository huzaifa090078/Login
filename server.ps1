# LOGIN Order Form - Local Development Static HTTP Server
param(
    [int]$Port = 3000
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

# MIME types mapping
$mimeTypes = @{
    ".html"         = "text/html; charset=utf-8"
    ".htm"          = "text/html; charset=utf-8"
    ".css"          = "text/css; charset=utf-8"
    ".js"           = "application/javascript; charset=utf-8"
    ".mjs"          = "application/javascript; charset=utf-8"
    ".json"         = "application/json; charset=utf-8"
    ".webmanifest"  = "application/manifest+json; charset=utf-8"
    ".png"          = "image/png"
    ".jpg"          = "image/jpeg"
    ".jpeg"         = "image/jpeg"
    ".gif"          = "image/gif"
    ".svg"          = "image/svg+xml"
    ".ico"          = "image/x-icon"
    ".txt"          = "text/plain; charset=utf-8"
}


$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"

try {
    $listener.Prefixes.Add($prefix)
    $listener.Start()
} catch {
    # If port 3000 is in use, try port 8080
    $Port = 8080
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "   LOGIN ORDER FORM - Mobile Web Server" -ForegroundColor Black -BackgroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host " Serving at: $prefix" -ForegroundColor Green
Write-Host " Serving directory: $scriptDir" -ForegroundColor Cyan
Write-Host " Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "=================================================" -ForegroundColor Yellow

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        # Resolve local file path
        $filePath = Join-Path $scriptDir $urlPath
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()

        try {
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                $contentType = "application/octet-stream"
                if ($mimeTypes.ContainsKey($ext)) {
                    $contentType = $mimeTypes[$ext]
                }

                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                
                # Disable caching for development & allow SW
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Service-Worker-Allowed", "/")

                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host "[200 OK] $urlPath ($($bytes.Length) bytes)" -ForegroundColor DarkGreen
            } else {
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
                $response.StatusCode = 404
                $response.ContentType = "text/plain"
                $response.ContentLength64 = $notFoundBytes.Length
                $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                Write-Host "[404 Not Found] $urlPath" -ForegroundColor Red
            }

            $response.OutputStream.Close()
        } catch {
            # Client disconnected early or connection reset - safe to continue listening
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
