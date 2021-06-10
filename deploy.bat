@echo off
rd/s/q dist
mkdir dist
xcopy ".\static" ".\dist\static" /s /e /k  /i /y >nul 2>nul
echo F|xcopy ".\index.html" ".\dist\index.html" /-Y >nul 2>nul
tsc
