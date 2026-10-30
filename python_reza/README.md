# REZA — A JARVIS-Like Python AI Assistant

REZA is a personal AI desktop assistant inspired by JARVIS from Iron Man. Built in Python with a futuristic CustomTkinter HUD, genuine desktop automation, real-time weather and web research, screen vision analysis, and multilingual voice interaction in **English**, **Hindi (हिन्दी)**, and **Nepali (नेपाली)**.

---

## 🚀 Key Features

1. **Futuristic Command Center UI**: Modern dark charcoal aesthetic (`#04070d`), cyan holographic accents, pulsing telemetry, status indicators, and clean layout.
2. **Multilingual Voice Assistant**: Speech recognition & text-to-speech for English (`en-US`), Hindi (`hi-IN`), and Nepali (`ne-NP`).
3. **Real-Time Information**: Live date & time, atmospheric conditions via free Open-Meteo API, DuckDuckGo & Wikipedia search without paid keys.
4. **Desktop Automation**: Open browsers, calculators, editors, terminals; dictation typing into active windows; step-by-step guidance.
5. **Computer Telemetry & Diagnostics**: Real-time CPU, RAM, disk partitions, battery status with `psutil`.
6. **Code Assistant & Joke Generator**: Authentic jokes in Nepali, Hindi, and English; code explanation and synthesis.
7. **Screen Understanding**: Screenshot capture and visual analysis.
8. **Security & History**: SQLite conversation log with sensitive credential filtering and confirmation prompts.

---

## 📋 Installation & Running

### Windows:
```bat
git clone <repo>
cd python_reza
setup_run.bat
```
Or manually:
```bat
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Linux / macOS:
```bash
chmod +x setup_run.sh
./setup_run.sh
```
Or manually:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

---

## 📦 Packaging as a Desktop Executable (.exe / .app)

You can package REZA into a single standalone binary using PyInstaller:

```bash
pip install pyinstaller
pyinstaller --noconfirm --onedir --windowed main.py
```
The compiled executable will be located in the `dist/main` directory.
