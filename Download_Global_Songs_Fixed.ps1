$apiKey = "chksz_9QwJ5iffI2Kcjmr4_wV1L5qP0fJpIVUajkVmXalX1No"
$baseDir = "F:\yinpin\yinyu"
$globalDir = Join-Path $baseDir "多语种经典"
$jsonPath = "H:\VCP\VCPzhangduan\VCPChat\AppData\songlist.json"
$customPath = "H:\VCP\VCPzhangduan\VCPChat\AppData\custom_playlists.json"
$ffmpeg = "H:\VCP\VCPzhangduan\VCPChat\bin\ffmpeg.exe"

if (-not (Test-Path $globalDir)) {
    New-Item -Path $globalDir -ItemType Directory -Force | Out-Null
    Write-Host "Created new folder: $globalDir" -ForegroundColor Cyan
}

$songs = @(
    "Lemon Kenshi Yonezu", "First Love Hikaru Utada", "Yuki no Hana Mika Nakashima", 
    "Kiseki GReeeeN", "Secret Base ZONE", "Wherever you are ONE OK ROCK", 
    "Pretender Official HIGE DANdism", "Yoru ni Kakeru YOASOBI", "Uchiage Hanabi DAOKO", "Sukiyaki Kyu Sakamoto",
    
    "La Vie En Rose Edith Piaf", "Les Champs-Elysees Joe Dassin", "Je m'appelle Helene Helene", 
    "Derniere Danse Indila", "Papaoutai Stromae", "Je veux ZAZ", 
    "Le Festin Camille", "Ne me quitte pas Jacques Brel", "Quelqu'un m'a dit Carla Bruni", "Sympathique Pink Martini",
    
    "Despacito Luis Fonsi", "Besame Mucho Consuelo Velazquez", "Bailando Enrique Iglesias", 
    "La Bamba Ritchie Valens", "Danza Kuduro Don Omar", "Waka Waka Shakira", 
    "Vivir Mi Vida Marc Anthony", "La Tortura Shakira", "Corazon Espinado Santana", "Historia de un Amor Luis Miguel"
)

$songlist = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$added = 0
$newTracks = @()

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Aemeath's Global Classic Songs Downloader Started! " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

foreach ($s in $songs) {
    Write-Host "`n>>> Searching: $s" -ForegroundColor Yellow
    $searchUrl = "https://music.163.com/api/search/get/web?csrf_token=hlpretag=&hlposttag=&s=$([uri]::EscapeDataString($s))&type=1&offset=0&total=true&limit=1"
    $searchRes = try { Invoke-RestMethod -Uri $searchUrl -Method Post -Headers @{"Referer"="https://music.163.com/"} } catch { $null }
    
    if (-not $searchRes -or -not $searchRes.result.songs) {
        Write-Host "Search failed, skipping." -ForegroundColor Red
        continue
    }
    
    $id = $searchRes.result.songs[0].id
    $title = $searchRes.result.songs[0].name
    $artist = $searchRes.result.songs[0].artists[0].name
    Write-Host "Target found: $title - $artist (ID: $id)"
    
    $safeTitle = $title -replace '[<>:"/\\|?*]', '_'
    $safeArtist = $artist -replace '[<>:"/\\|?*]', '_'
    
    $alreadyExists = $false
    foreach ($item in $songlist) {
        if ($item.title -eq $title -and $item.artist -match $safeArtist) { $alreadyExists = $true; break }
    }
    if ($alreadyExists) { Write-Host "Already in playlist, skipping."; continue }

    $apiUrl = "https://api.chksz.com/api/163_music?id=$id&level=lossless&apikey=$apiKey"
    $apiRes = try { Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 15 } catch { $null }
    
    if ($apiRes -and $apiRes.code -eq 200 -and $apiRes.data.url) {
        $dlUrl = $apiRes.data.url
        $tempPath = Join-Path $globalDir "temp_$id.flac"
        $finalPath = Join-Path $globalDir "$safeArtist - $safeTitle.mp3"
        $lrcPath = Join-Path $globalDir "$safeArtist - $safeTitle.lrc"
        
        Write-Host "Downloading audio stream..."
        try { Invoke-WebRequest -Uri $dlUrl -OutFile $tempPath } catch { Write-Host "Download failed" -ForegroundColor Red; continue }
        
        if (Test-Path $ffmpeg) {
            Write-Host "Converting to 320k MP3 (Please wait)..."
            Start-Process -FilePath $ffmpeg -ArgumentList "-y -i `"$tempPath`" -b:a 320k `"$finalPath`"" -Wait -NoNewWindow
            Remove-Item $tempPath -Force
        } else {
            Rename-Item -Path $tempPath -NewName "$safeArtist - $safeTitle.mp3"
        }
        
        Write-Host "Fetching bilingual lyrics..."
        $lrcUrl = "https://music.163.com/api/song/lyric?id=$id&lv=1&kv=1&tv=-1"
        $lrcRes = try { Invoke-RestMethod -Uri $lrcUrl -Method Get } catch { $null }
        if ($lrcRes -and $lrcRes.lrc.lyric) {
            $lyricText = $lrcRes.lrc.lyric
            if ($lrcRes.tlyric.lyric -and $lrcRes.tlyric.lyric.Length -gt 10) { $lyricText += "`n" + $lrcRes.tlyric.lyric }
            [System.IO.File]::WriteAllText($lrcPath, $lyricText, [System.Text.Encoding]::UTF8)
        }
        
        $safeUrlPath = "F:/yinpin/yinyu/多语种经典/$safeArtist - $safeTitle.mp3"
        $newEntry = @{
            title = $title
            artist = $artist
            album = "Global Classics"
            path = $safeUrlPath
            albumArt = $null
            bitrate = 320000
        }
        $songlist += $newEntry
        $newTracks += $safeUrlPath
        $added++
        Write-Host "[$added/30] $title process completed!" -ForegroundColor Green
    }
}

if ($added -gt 0) {
    $newJson = $songlist | ConvertTo-Json -Depth 5
    $newJson = $newJson.Replace('\/', '/').Replace('\\', '/')
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($jsonPath, $newJson, $utf8NoBom)
    
    if (Test-Path $customPath) {
        $customList = Get-Content $customPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $globalPlaylist = $null
        foreach ($pl in $customList) {
            if ($pl.name -eq "多语种经典") { $globalPlaylist = $pl; break }
        }
        if (-not $globalPlaylist) {
            $globalPlaylist = @{ id = [string](Get-Date -UFormat %s).Replace('.',''); name = "多语种经典"; tracks = @() }
            $customList += $globalPlaylist
        }
        foreach ($t in $newTracks) { $globalPlaylist.tracks += $t }
        
        $newCustomJson = $customList | ConvertTo-Json -Depth 5
        $newCustomJson = $newCustomJson.Replace('\/', '/').Replace('\\', '/')
        [System.IO.File]::WriteAllText($customPath, $newCustomJson, $utf8NoBom)
    }

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "Batch process completed! Successfully added $added songs." -ForegroundColor Green
    Write-Host "Please press F5 in VCPChat web page to load the new playlist!" -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Cyan
} else {
    Write-Host "`nNo new songs were added." -ForegroundColor Yellow
}
Write-Host "`nPress any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null