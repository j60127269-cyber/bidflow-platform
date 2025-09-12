# PowerShell runner for egp_scraper.py with timestamped logs

# Move to the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Ensure logs directory exists
$LogDir = Join-Path $ScriptDir "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Timestamped log file
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "egp_scraper_$Timestamp.log"

# Optional: point to a specific Python if needed
# $Python = "C:\\Users\\user\\AppData\\Local\\Programs\\Python\\Python311\\python.exe"
$Python = "python"

# Run the scraper and tee output to log
& $Python "egp_scraper.py" *>&1 | Tee-Object -FilePath $LogFile

# Exit with last command's status code
exit $LASTEXITCODE
