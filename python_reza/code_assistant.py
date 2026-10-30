"""
REZA Coding Assistant & Multilingual Joke Engine
Supports Python, JavaScript, and humor in English, Hindi, and Nepali
"""

import random

class CodeAssistant:
    def __init__(self):
        self.nepali_jokes = [
            "शिक्षक: 'सूर्य र चन्द्रमामा कुन बढी उपयोगी छ?'\\nविद्यार्थी: 'चन्द्रमा सर! किनभने चन्द्रमाले राती उज्यालो दिन्छ जब अँध्यारो हुन्छ, सूर्य त दिनमा मात्र आउँछ जब पहिल्यै घाम लागेको हुन्छ!' 😄",
            "डाक्टर: 'तपाईंलाई कस्तो बिरामी भएको छ?'\\nबिरामी: 'डाक्टर साब, मलाई सपनामा फुटबल खेलिरहेको मात्र देखिन्छ!'\\nडाक्टर: 'त्यसो भए आज राती औषधि खानुस् अनि आराम गर्नुस्।'\\nबिरामी: 'आज होइन डाक्टर साब, आज त फाइनल खेल छ!' ⚽😂",
            "कम्प्युटर इन्जिनियर बिहेमा जाँदा के भन्छ?\\n'बधाई छ साथी! तिम्रो जीवन अब नयाँ भर्सन १.० मा अपडेट भयो, अब बगहरू सहन सिक्नुपर्छ!' 💻💍"
        ]

        self.hindi_jokes = [
            "टीचर: 'संजू, बताओ न्यूटन का चौथा नियम क्या है?'\\nसंजू: 'सर, जब परीक्षा का पेपर बहुत कठिन हो, तो गुरुत्वाकर्षण के कारण आंखों से अपने आप आंसू टपकने लगते हैं!' 📜😭",
            "ग्राहक: 'भाईसाहब, इस कंप्यूटर की गारंटी क्या है?'\\nदुकानदार: 'जब तक यह चालू है, तब तक पूरी गारंटी है, बंद होते ही हमारा कोई लेना-देना नहीं!' 💻😆",
            "सॉफ्टवेयर इंजीनियर मंदिर क्यों गया?\\nभगवान से प्रार्थना करने: 'हे प्रभु! मेरे कोड में कोई बग न आए, और आए तो क्लाइंट को कभी दिखे न!' 🙏✨"
        ]

        self.english_jokes = [
            "Why do programmers always prefer dark mode?\\nBecause light attracts bugs! 🐛💡",
            "There are only 10 types of people in the world:\\nThose who understand binary, and those who don't! 🤖",
            "Why did the developer go broke?\\nBecause he used up all his cache! 💰💾"
        ]

    def get_joke(self, lang="en") -> str:
        if lang == "ne":
            return random.choice(self.nepali_jokes)
        elif lang == "hi":
            return random.choice(self.hindi_jokes)
        return random.choice(self.english_jokes)

    def generate_response(self, prompt: str, lang="en") -> str:
        p_lower = prompt.lower()
        if "joke generator" in p_lower:
            return (
                "Here is the complete Python joke generator script:\\n\\n"
                "```python\\n"
                "import random\\n\\n"
                "def tell_joke():\\n"
                "    jokes = ['Why do programmers prefer dark mode? Because light attracts bugs!']\\n"
                "    return random.choice(jokes)\\n\\n"
                "print(tell_joke())\\n"
                "```"
            )
        return f"Instruction acknowledged: '{prompt}'. REZA core assistant stands ready to assist with full execution."
