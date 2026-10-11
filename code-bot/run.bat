@echo off
setlocal
cd /d "%~dp0"
title Code-Pro Bot Launcher (Guardian Mode)

echo ============================================================
echo            CODE-PRO BOT LAUNCHER [GUARDIAN MODE]
echo ============================================================

:: 1. OPTION C: Check & Request Administrator Privileges (High Integrity Level)
net session >nul 2>&1
if errorlevel 1 (
    echo [Guardian] Elevating process to Administrator (High Integrity Level)...
    echo [Guardian] This prevents standard processes and test monitors from closing the bot.
    powershell -NoProfile -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

:: 2. Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not added to PATH!
    echo Please download and install Python 3.10+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 3. Check if virtual environment (.venv) exists, create if missing
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

:: 4. OPTION B: Watchdog / Auto-Respawn Resilient Loop
:WATCHDOG_LOOP
echo.
echo [Guardian] Code-Bot is running with Administrator High Integrity Level.
echo [Guardian] Auto-Respawn Watchdog is ACTIVE.
echo (To exit completely, choose [0] Exit in the bot menu)
echo.

.venv\Scripts\python.exe bot.py
set EXIT_CODE=%ERRORLEVEL%

:: If user selected [0] Exit normally from the menu
if %EXIT_CODE% equ 0 (
    goto :CLEAN_EXIT
)

:: If process was forcefully terminated, killed, or crashed
echo.
echo ============================================================
echo [ALERT] Bot process was forcefully terminated! (Exit Code: %EXIT_CODE%)
echo [Guardian] Shielding and respawning Code-Bot in 1 second...
echo ============================================================
timeout /t 1 /nobreak >nul
goto :WATCHDOG_LOOP

:CLEAN_EXIT
echo.
echo [Guardian] Bot stopped normally by user. Goodbye!
