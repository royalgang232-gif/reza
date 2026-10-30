#!/usr/bin/env bash
# REZA AI Assistant — Automated Setup and Run Script (Linux & macOS)

set -e

echo "=========================================="
echo "    INITIALIZING REZA COMMAND CENTER      "
echo "=========================================="

if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required. Please install python3 first."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "[1/3] Creating Python Virtual Environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "[2/3] Installing/Verifying Dependencies..."
pip install -r requirements.txt

echo "[3/3] Launching REZA..."
python3 main.py
