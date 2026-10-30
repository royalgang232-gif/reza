"""
REZA Conversation History & Memory
Stores command interactions securely in SQLite with privacy safeguards
"""

import sqlite3
import time
import os

class HistoryMemoryManager:
    def __init__(self, db_path="reza_history.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                sender TEXT,
                message TEXT
            )
        """)
        conn.commit()
        conn.close()

    def add_entry(self, sender: str, message: str):
        safe_msg = message
        for sensitive in ["password", "token", "secret", "api_key"]:
            if sensitive in safe_msg.lower():
                safe_msg = "[FILTERED SENSITIVE CREDENTIAL]"

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("INSERT INTO conversation_log (timestamp, sender, message) VALUES (?, ?, ?)", (now, sender, safe_msg))
        conn.commit()
        conn.close()

    def get_recent(self, limit=20):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT timestamp, sender, message FROM conversation_log ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return rows

    def clear_history(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM conversation_log")
        conn.commit()
        conn.close()
