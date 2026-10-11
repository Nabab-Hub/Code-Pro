@echo off
setlocal
cd /d "%~dp0"
title Code-Pro Bot Launcher

echo ============================================================
echo            CODE-PRO BOT AUTOMATED LAUNCHER
echo ============================================================

:: 1. Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not added to PATH!
    echo Please download and install Python 3.10+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Check if virtual environment (.venv) exists
if not exist ".venv\Scripts\python.exe" (
    echo [Setup] First-time setup detected.
    echo [Setup] Creating virtual environment (.venv)...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo [Setup] Virtual environment created successfully.
    echo.
    echo [Setup] Installing required packages from requirements.txt...
    echo (This may take a minute on the first run, please wait...)
    echo.
    .venv\Scripts\python.exe -m pip install --upgrade pip >nul 2>&1
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [Setup] All dependencies installed successfully!
    echo ============================================================
    echo.
)

:: 3. Launch Bot using the virtual environment
echo [Code-Bot] Launching bot...
echo.
.venv\Scripts\python.exe bot.py

if errorlevel 1 (
    echo.
    echo [Notice] Bot exited.
    pause
)
