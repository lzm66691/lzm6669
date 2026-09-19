@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "READER_PORT=8899"
if not defined READER_DIR set "READER_DIR=D:\桌面\新建文件夹"

set "PY=python"
where python >nul 2>nul || set "PY=D:\python\python.exe"

echo.
echo   论文阅读台
echo   论文目录: %READER_DIR%
echo   地址    : http://127.0.0.1:%READER_PORT%/
echo.
echo   浏览器马上自动打开；关掉这个黑窗口即停止服务。
echo.

start "" "http://127.0.0.1:%READER_PORT%/"
"%PY%" server.py
pause
