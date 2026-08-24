$apiKey = "chksz_9QwJ5iffI2Kcjmr4_wV1L5qP0fJpIVUajkVmXalX1No"
$musicDir = "F:\yinpin\yinyu"
$jsonPath = "H:\VCP\VCPzhangduan\VCPChat\AppData\songlist.json"
$ffmpeg = "H:\VCP\VCPzhangduan\VCPChat\bin\ffmpeg.exe"

$songs = @(
    "Blinding Lights The Weeknd", "Smooth Santana", "Uptown Funk Mark Ronson",
    "The Twist Chubby Checker", "Mack the Knife Bobby Darin", "How Do I Live LeAnn Rimes",
    "Party Rock Anthem LMFAO", "Come Together The Beatles", "Let It Be The Beatles",
    "Sweet Emotion Aerosmith", "Smoke on the Water Deep Purple", "Beast Of Burden The Rolling Stones",
    "Tumbling Dice The Rolling Stones", "Closer to the Heart Rush", "I Will Always Love You Whitney Houston",
    "Let the River Run Carly Simon", "Unchained Melody The Righteous Brothers", "Shallow Lady Gaga",
    "Circle of Life Elton John", "Goldfinger Shirley Bassey", "Skyfall Adele"
)

$songlist = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$added = 0

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   爱弥斯的星矩专属点歌台 - 21首神曲批量下载脚本启动! " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

foreach ($s in $songs) {
    Write-Host "`n>>> 正在搜索: $s" -ForegroundColor Yellow
    $searchUrl = "https://music.163.com/api/search/get/web?csrf_token=hlpretag=&hlposttag=&s=$([uri]::EscapeDataString($s))&type=1&offset=0&total=true&limit=1"
    $searchRes = try { Invoke-RestMethod -Uri $searchUrl -Method Post -Headers @{"Referer"="https://music.163.com/"} } catch { $null }
    
    if (-not $searchRes -or -not $searchRes.result.songs) {
        Write-Host "搜索失败，跳过。" -ForegroundColor Red
        continue
    }
    
    $id = $searchRes.result.songs[0].id
    $title = $searchRes.result.songs[0].name
    $artist = $searchRes.result.songs[0].artists[0].name
    Write-Host "找到目标: $title - $artist (ID: $id)"
    
    $alreadyExists = $false
    foreach ($item in $songlist) {
        if ($item.title -eq $title -and $item.artist -match $artist) { $alreadyExists = $true; break }
    }
    if ($alreadyExists) { Write-Host "已在歌单中，跳过。"; continue }

    $apiUrl = "https://api.chksz.com/api/163_music?id=$id&level=lossless&apikey=$apiKey"
    $apiRes = try { Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 15 } catch { $null }
    
    if ($apiRes -and $apiRes.code -eq 200 -and $apiRes.data.url) {
        $dlUrl = $apiRes.data.url
        $tempPath = Join-Path $musicDir "temp_$id.flac"
        $finalPath = Join-Path $musicDir "$artist - $title.mp3"
        $lrcPath = Join-Path $musicDir "$artist - $title.lrc"
        
        Write-Host "下载音频流..."
        try { Invoke-WebRequest -Uri $dlUrl -OutFile $tempPath } catch { Write-Host "下载失败" -ForegroundColor Red; continue }
        
        if (Test-Path $ffmpeg) {
            Write-Host "转码为 320k MP3 (请耐心等待)..."
            Start-Process -FilePath $ffmpeg -ArgumentList "-y -i `"$tempPath`" -b:a 320k `"$finalPath`"" -Wait -NoNewWindow
            Remove-Item $tempPath -Force
        } else {
            Rename-Item -Path $tempPath -NewName "$artist - $title.mp3"
        }
        
        Write-Host "获取双语歌词..."
        $lrcUrl = "https://music.163.com/api/song/lyric?id=$id&lv=1&kv=1&tv=-1"
        $lrcRes = try { Invoke-RestMethod -Uri $lrcUrl -Method Get } catch { $null }
        if ($lrcRes -and $lrcRes.lrc.lyric) {
            $lyricText = $lrcRes.lrc.lyric
            if ($lrcRes.tlyric.lyric -and $lrcRes.tlyric.lyric.Length -gt 10) { $lyricText += "`n" + $lrcRes.tlyric.lyric }
            [System.IO.File]::WriteAllText($lrcPath, $lyricText, [System.Text.Encoding]::UTF8)
        }
        
        $newEntry = @{
            title = $title
            artist = $artist
            album = "Classic English Songs"
            path = "F:/yinpin/yinyu/$artist - $title.mp3"
            albumArt = $null
            bitrate = 320000
        }
        $songlist += $newEntry
        $added++
        Write-Host "[$added/21] $title 处理完成！" -ForegroundColor Green
    }
}

if ($added -gt 0) {
    $newJson = $songlist | ConvertTo-Json -Depth 5
    $newJson = $newJson -replace '\\+', '/'
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($jsonPath, $newJson, $utf8NoBom)
    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "批量处理完成！成功添加 $added 首歌。" -ForegroundColor Green
    Write-Host "请阿漂刷新 VCPChat 网页 (F5) 即可加载新歌单！" -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Cyan
} else {
    Write-Host "`n没有新歌曲被添加。" -ForegroundColor Yellow
}
Write-Host "`n按任意键退出..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null