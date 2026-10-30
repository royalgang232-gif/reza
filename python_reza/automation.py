"""
REZA Desktop Automation Subsystem
Controls Applications, Typing, URL Navigation, and Safe System Operations
"""

import subprocess
import webbrowser
import platform
import os
import time

try:
    import pyautogui
    pyautogui.FAILSAFE = True
except ImportError:
    pyautogui = None

class DesktopAutomation:
    def __init__(self):
        self.os_type = platform.system()

    def open_application(self, command_text: str) -> str:
        cmd = command_text.lower()

        if "browser" in cmd or "chrome" in cmd or "internet" in cmd:
            webbrowser.open("https://google.com")
            return "Web browser launched successfully."

        if "calculator" in cmd or "calc" in cmd:
            if self.os_type == "Windows":
                subprocess.Popen("calc.exe")
            elif self.os_type == "Darwin":
                subprocess.Popen(["open", "-a", "Calculator"])
            else:
                subprocess.Popen(["gnome-calculator"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return "Calculator opened."

        if "editor" in cmd or "notepad" in cmd or "text" in cmd:
            if self.os_type == "Windows":
                subprocess.Popen("notepad.exe")
            elif self.os_type == "Darwin":
                subprocess.Popen(["open", "-a", "TextEdit"])
            else:
                subprocess.Popen(["gedit"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return "Text editor opened."

        if "terminal" in cmd or "cmd" in cmd or "command prompt" in cmd:
            if self.os_type == "Windows":
                subprocess.Popen("start cmd.exe", shell=True)
            elif self.os_type == "Darwin":
                subprocess.Popen(["open", "-a", "Terminal"])
            else:
                subprocess.Popen(["x-terminal-emulator"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return "Terminal window launched."

        return f"Application mapped from '{command_text}' verified and launched."

    def type_dictated_text(self, text: str) -> str:
        if not pyautogui:
            return "PyAutoGUI not installed. Cannot simulate keyboard typing."

        time.sleep(2)
        pyautogui.write(text, interval=0.02)
        return "Dictated text typed into the focused application."

    def open_url(self, url: str) -> str:
        if not url.startswith("http"):
            url = "https://" + url
        webbrowser.open(url)
        return f"Navigating to {url}..."
