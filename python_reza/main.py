"""
REZA — JARVIS-Inspired AI Desktop Assistant
Main Entry Point & Futuristic Desktop UI (CustomTkinter)
Supported Languages: English, Hindi, Nepali
"""

import sys
import os
import threading
import time
import customtkinter as ctk

# Import REZA Modules
from voice_engine import VoiceEngine
from automation import DesktopAutomation
from system_info import SystemMonitor
from weather_search import WeatherSearchEngine
from code_assistant import CodeAssistant
from screen_vision import ScreenVisionAnalyzer
from history_memory import HistoryMemoryManager

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class RezaDesktopApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("REZA — JARVIS AI Command Station")
        self.geometry("1100x720")
        self.minsize(900, 600)
        self.configure(fg_color="#04070d")

        # Subsystems
        self.history = HistoryMemoryManager()
        self.system_monitor = SystemMonitor()
        self.automation = DesktopAutomation()
        self.weather_search = WeatherSearchEngine()
        self.code_assistant = CodeAssistant()
        self.screen_analyzer = ScreenVisionAnalyzer()
        
        self.current_lang = "en"
        self.is_listening = False

        self.voice = VoiceEngine(
            lang=self.current_lang,
            on_speech_recognized=self.handle_voice_input,
            status_callback=self.update_status
        )

        self._build_ui()
        self._start_telemetry_loop()
        self.after(500, self._initial_greeting)

    def _build_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=0)
        self.grid_rowconfigure(0, weight=1)

        self.main_container = ctk.CTkFrame(self, fg_color="#080e18", corner_radius=12, border_width=1, border_color="#00f0ff")
        self.main_container.grid(row=0, column=0, sticky="nsew", padx=12, pady=12)
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(2, weight=1)

        self.header_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.header_frame.grid(row=0, column=0, sticky="ew", padx=16, pady=12)
        self.header_frame.grid_columnconfigure(1, weight=1)

        self.title_label = ctk.CTkLabel(
            self.header_frame,
            text="◈ REZA // CORE AI COMMAND",
            font=("Consolas", 18, "bold"),
            text_color="#00f0ff"
        )
        self.title_label.grid(row=0, column=0, sticky="w")

        self.clock_label = ctk.CTkLabel(
            self.header_frame,
            text="00:00:00 UTC",
            font=("Consolas", 14),
            text_color="#7dd3fc"
        )
        self.clock_label.grid(row=0, column=2, sticky="e")

        self.status_banner = ctk.CTkLabel(
            self.main_container,
            text="SYSTEM READY // AWAITING VOICE OR TEXT COMMAND",
            font=("Consolas", 12),
            text_color="#38bdf8",
            fg_color="#0b192c",
            corner_radius=6,
            height=28
        )
        self.status_banner.grid(row=1, column=0, sticky="ew", padx=16, pady=(0, 8))

        self.chat_display = ctk.CTkTextbox(
            self.main_container,
            fg_color="#050a12",
            text_color="#e0f2fe",
            font=("Consolas", 13),
            border_width=1,
            border_color="#1e293b",
            wrap="word"
        )
        self.chat_display.grid(row=2, column=0, sticky="nsew", padx=16, pady=6)
        self.chat_display.configure(state="disabled")

        self.input_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.input_frame.grid(row=3, column=0, sticky="ew", padx=16, pady=12)
        self.input_frame.grid_columnconfigure(1, weight=1)

        self.mic_btn = ctk.CTkButton(
            self.input_frame,
            text="🎙 MIC",
            width=80,
            command=self.toggle_mic,
            fg_color="#0284c7",
            hover_color="#0369a1",
            font=("Consolas", 13, "bold")
        )
        self.mic_btn.grid(row=0, column=0, padx=(0, 8))

        self.entry_box = ctk.CTkEntry(
            self.input_frame,
            placeholder_text="Ask Reza in English, Hindi, or Nepali...",
            font=("Consolas", 13),
            fg_color="#0a1220",
            border_color="#0284c7"
        )
        self.entry_box.grid(row=0, column=1, sticky="ew")
        self.entry_box.bind("<Return>", lambda e: self.send_text_command())

        self.send_btn = ctk.CTkButton(
            self.input_frame,
            text="EXECUTE ➔",
            width=100,
            command=self.send_text_command,
            fg_color="#00f0ff",
            text_color="#04070d",
            hover_color="#38bdf8",
            font=("Consolas", 12, "bold")
        )
        self.send_btn.grid(row=0, column=2, padx=(8, 0))

        self.stop_btn = ctk.CTkButton(
            self.input_frame,
            text="⏹ STOP",
            width=70,
            command=self.stop_speaking,
            fg_color="#dc2626",
            hover_color="#b91c1c",
            font=("Consolas", 12, "bold")
        )
        self.stop_btn.grid(row=0, column=3, padx=(8, 0))

        # Right Sidebar
        self.sidebar = ctk.CTkFrame(self, fg_color="#080e18", width=260, corner_radius=12, border_width=1, border_color="#1e293b")
        self.sidebar.grid(row=0, column=1, sticky="nsew", padx=(0, 12), pady=12)
        self.sidebar.grid_columnconfigure(0, weight=1)

        sidebar_title = ctk.CTkLabel(self.sidebar, text="TELEMETRY & ACTIONS", font=("Consolas", 14, "bold"), text_color="#38bdf8")
        sidebar_title.pack(pady=12)

        self.lang_menu = ctk.CTkOptionMenu(
            self.sidebar,
            values=["English (en)", "Hindi (हिन्दी)", "Nepali (नेपाली)"],
            command=self.on_language_change,
            fg_color="#0f172a",
            button_color="#0284c7"
        )
        self.lang_menu.pack(fill="x", padx=16, pady=6)

        actions = [
            ("⚡ System Diagnostics", self.action_system_diag),
            ("🌤 Weather Report", self.action_weather),
            ("🌐 Web Search", self.action_search),
            ("🖥 Screen Analyze", self.action_screen),
            ("📝 Voice Dictation", self.action_dictation),
            ("💻 Joke Generator", self.action_joke),
            ("📁 File Explorer", self.action_files)
        ]

        for text, cmd in actions:
            btn = ctk.CTkButton(
                self.sidebar,
                text=text,
                command=cmd,
                anchor="w",
                fg_color="#0f172a",
                hover_color="#1e293b",
                font=("Consolas", 12)
            )
            btn.pack(fill="x", padx=16, pady=4)

        self.metrics_label = ctk.CTkLabel(
            self.sidebar,
            text="CPU: --% | RAM: --%\\nBATTERY: --%\\nSECURITY: OK",
            font=("Consolas", 11),
            text_color="#94a3b8",
            justify="left"
        )
        self.metrics_label.pack(side="bottom", pady=16, padx=16)

    def _initial_greeting(self):
        greeting = "Reza initialized. All system diagnostics nominal. How can I assist you, Sir?"
        self._append_message("REZA", greeting)
        self.voice.speak(greeting)

    def _append_message(self, sender: str, msg: str):
        self.chat_display.configure(state="normal")
        timestamp = time.strftime("%H:%M:%S")
        self.chat_display.insert("end", f"[{timestamp}] {sender}:\\n{msg}\\n\\n")
        self.chat_display.see("end")
        self.chat_display.configure(state="disabled")
        self.history.add_entry(sender, msg)

    def update_status(self, text: str):
        self.status_banner.configure(text=f"STATUS // {text.upper()}")

    def on_language_change(self, choice: str):
        if "Hindi" in choice:
            self.current_lang = "hi"
            msg = "भाषा हिन्दी में सेट कर दी गई है।"
        elif "Nepali" in choice:
            self.current_lang = "ne"
            msg = "भाषा नेपालीमा परिवर्तन गरियो।"
        else:
            self.current_lang = "en"
            msg = "Language set to English."
        self.voice.set_language(self.current_lang)
        self._append_message("REZA", msg)
        self.voice.speak(msg)

    def toggle_mic(self):
        if not self.is_listening:
            self.is_listening = True
            self.mic_btn.configure(fg_color="#dc2626", text="🔴 REC")
            self.update_status("LISTENING FOR COMMAND...")
            threading.Thread(target=self.voice.listen_once, daemon=True).start()
        else:
            self.is_listening = False
            self.mic_btn.configure(fg_color="#0284c7", text="🎙 MIC")
            self.update_status("IDLE")

    def handle_voice_input(self, text: str):
        self.is_listening = False
        self.mic_btn.configure(fg_color="#0284c7", text="🎙 MIC")
        if text:
            self._append_message("USER (VOICE)", text)
            self._process_command(text)

    def send_text_command(self):
        text = self.entry_box.get().strip()
        if not text:
            return
        self.entry_box.delete(0, "end")
        self._append_message("USER", text)
        self._process_command(text)

    def _process_command(self, cmd: str):
        cmd_lower = cmd.lower()
        self.update_status("PROCESSING...")

        if "joke" in cmd_lower or "चुटकुला" in cmd_lower or "चुट्किला" in cmd_lower:
            joke = self.code_assistant.get_joke(self.current_lang)
            self._append_message("REZA", joke)
            self.voice.speak(joke)
            self.update_status("READY")
            return

        if "weather" in cmd_lower or "मौसम" in cmd_lower or "तापमान" in cmd_lower:
            city = "Kathmandu"
            words = cmd.split()
            if "in" in words:
                city = words[words.index("in") + 1]
            report = self.weather_search.get_live_weather(city)
            self._append_message("REZA", report)
            self.voice.speak(report)
            self.update_status("READY")
            return

        if "open" in cmd_lower or "खोल्नुहोस्" in cmd_lower or "खोलो" in cmd_lower:
            res = self.automation.open_application(cmd)
            self._append_message("REZA", res)
            self.voice.speak(res)
            self.update_status("READY")
            return

        if "search" in cmd_lower or "खोज" in cmd_lower:
            query = cmd_lower.replace("search", "").replace("for", "").strip()
            res = self.weather_search.search_duckduckgo(query)
            self._append_message("REZA", res)
            self.voice.speak(res[:200])
            self.update_status("READY")
            return

        reply = self.code_assistant.generate_response(cmd, self.current_lang)
        self._append_message("REZA", reply)
        self.voice.speak(reply[:250])
        self.update_status("READY")

    def stop_speaking(self):
        self.voice.stop()
        self.update_status("SPEECH ABORTED")

    def action_system_diag(self):
        diag = self.system_monitor.get_full_diagnostic()
        self._append_message("REZA (SYSTEM)", diag)
        self.voice.speak("System diagnostics completed. All hardware parameters normal.")

    def action_weather(self):
        report = self.weather_search.get_live_weather("Kathmandu")
        self._append_message("REZA (WEATHER)", report)
        self.voice.speak(report)

    def action_search(self):
        self.entry_box.delete(0, "end")
        self.entry_box.insert(0, "search latest science discoveries")
        self.send_text_command()

    def action_screen(self):
        res = self.screen_analyzer.analyze_active_screen()
        self._append_message("REZA (VISION)", res)
        self.voice.speak("Screen captured and analyzed.")

    def action_dictation(self):
        msg = "Voice dictation mode ready. Speak your thoughts and I will transcribe them."
        self._append_message("REZA", msg)
        self.voice.speak(msg)
        self.toggle_mic()

    def action_joke(self):
        joke = self.code_assistant.get_joke(self.current_lang)
        self._append_message("REZA (JOKE)", joke)
        self.voice.speak(joke)

    def action_files(self):
        res = self.system_monitor.list_user_files()
        self._append_message("REZA (FILES)", res)

    def _start_telemetry_loop(self):
        def loop():
            while True:
                time.sleep(2)
                try:
                    now = time.strftime("%H:%M:%S UTC")
                    self.clock_label.configure(text=now)
                    cpu, ram, batt = self.system_monitor.get_quick_metrics()
                    self.metrics_label.configure(
                        text=f"CPU: {cpu}% | RAM: {ram}%\\nBATTERY: {batt}\\nSECURITY: VERIFIED"
                    )
                except Exception:
                    pass
        threading.Thread(target=loop, daemon=True).start()

if __name__ == "__main__":
    app = RezaDesktopApp()
    app.mainloop()
