"""
REZA Voice Interaction Subsystem
Handles Speech-to-Text (STT) and Text-to-Speech (TTS)
Supports: English, Hindi, Nepali
"""

import pyttsx3
import speech_recognition as sr
import threading
import time

class VoiceEngine:
    def __init__(self, lang="en", on_speech_recognized=None, status_callback=None):
        self.lang = lang
        self.on_speech_recognized = on_speech_recognized
        self.status_callback = status_callback
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True

        try:
            self.tts = pyttsx3.init()
            self.tts.setProperty('rate', 175)
            self.tts.setProperty('volume', 0.95)
        except Exception as e:
            print(f"[VOICE] TTS init warning: {e}")
            self.tts = None

        self.is_speaking = False

    def set_language(self, lang: str):
        self.lang = lang

    def speak(self, text: str):
        if not self.tts:
            print(f"[REZA TTS]: {text}")
            return

        def _run_tts():
            try:
                self.is_speaking = True
                if self.status_callback:
                    self.status_callback("SPEAKING")
                self.tts.say(text)
                self.tts.runAndWait()
            except Exception as e:
                print(f"[VOICE] TTS error: {e}")
            finally:
                self.is_speaking = False
                if self.status_callback:
                    self.status_callback("IDLE")

        threading.Thread(target=_run_tts, daemon=True).start()

    def stop(self):
        if self.tts and self.is_speaking:
            try:
                self.tts.stop()
            except Exception:
                pass
        self.is_speaking = False

    def listen_once(self):
        lang_code = "en-US"
        if self.lang == "hi":
            lang_code = "hi-IN"
        elif self.lang == "ne":
            lang_code = "ne-NP"

        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.6)
                if self.status_callback:
                    self.status_callback(f"LISTENING ({lang_code})")
                audio = self.recognizer.listen(source, timeout=6, phrase_time_limit=10)

                if self.status_callback:
                    self.status_callback("ANALYZING AUDIO...")

                text = self.recognizer.recognize_google(audio, language=lang_code)
                if self.on_speech_recognized:
                    self.on_speech_recognized(text)
        except sr.WaitTimeoutError:
            if self.status_callback:
                self.status_callback("MIC TIMEOUT (NO SPEECH)")
            if self.on_speech_recognized:
                self.on_speech_recognized("")
        except sr.UnknownValueError:
            if self.status_callback:
                self.status_callback("SPEECH UNRECOGNIZED")
            if self.on_speech_recognized:
                self.on_speech_recognized("")
        except Exception as e:
            print(f"[VOICE] Recognition error: {e}")
            if self.status_callback:
                self.status_callback("MIC ERROR")
            if self.on_speech_recognized:
                self.on_speech_recognized("")
