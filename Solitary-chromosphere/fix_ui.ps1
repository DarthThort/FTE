$file = "c:/Users/lmarchante.BIORECICLAJE.000/.gemini/antigravity/playground/solitary-chromosphere/js/ui/UIManager.js"
$content = Get-Content $file -Raw

# Fix all the broken replacements
$content = $content -replace ", `"warning`"\);", ");"
$content = $content -replace "`", `"warning`"\)", "')"  
$content = $content -replace '", "warning"\)', '")'

$content | Set-Content $file
Write-Host "Fixed UIManager.js"
