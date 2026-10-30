@echo off
echo ==========================================
echo     INITIALIZING REZA COMMAND CENTER      
echo ==========================================

python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not detected in PATH. Please install Python 3.10+ from python.org.
    pause
    exit /b
)

if not exist venv (
    echo [1/3] Creating virtual environment...
    python -m venv venv
)

echo [2/3] Activating virtual environment and installing packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/3] Launching REZA Desktop AI Assistant...
python main.py
pause
