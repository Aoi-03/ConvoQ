import pytest
from backend.services.parser import WhatsAppParser

def test_parse_android_dash_format():
    chat_text = """12/05/2023, 14:30 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
12/05/2023, 14:31 - Rahul: Hey guys, are we meeting today for the project discussion?
12/05/2023, 14:32 - Sneha: Yes! Let's meet at 5 PM at the library.
Here is the presentation link:
https://docs.google.com/presentation/d/123
12/05/2023, 14:33 - Shrimant: Count me in. I'm recording a voice note.
12/05/2023, 14:34 - Shrimant: PTT-20230512-WA0001.opus (file attached)
12/05/2023, 14:35 - Rahul: <Media omitted>
"""
    parsed = WhatsAppParser.parse_chat_text(chat_text, "College Project")
    assert parsed.name == "College Project"
    assert parsed.chat_type == "group"
    assert set(parsed.participants) == {"Rahul", "Sneha", "Shrimant"}
    assert parsed.total_messages == 6
    assert parsed.total_media == 2
    assert parsed.participant_stats["Shrimant"]["audio"] == 1
    assert parsed.participant_stats["Rahul"]["images"] == 1 or parsed.participant_stats["Rahul"]["audio"] == 0

def test_parse_ios_bracket_format():
    chat_text = """[10/06/2023, 10:15:30 AM] Shrimant: Hey, did you submit the assignment?
[10/06/2023, 10:16:00 AM] Suman: Yes, submitted last night.
Check this screenshot.
[10/06/2023, 10:16:15 AM] Suman: IMG-20230610-WA0023.jpg (file attached)
[10/06/2023, 10:17:00 AM] Shrimant: Perfect thanks!
"""
    parsed = WhatsAppParser.parse_chat_text(chat_text, "Shrimant")
    assert parsed.chat_type == "one_to_one"
    assert len(parsed.participants) == 2
    assert "Shrimant" in parsed.participants
    assert "Suman" in parsed.participants
    assert parsed.total_media == 1

def test_multiline_continuation():
    chat_text = """[10/06/2023, 10:15:00] Alice: Line 1
Line 2
Line 3
[10/06/2023, 10:16:00] Bob: Got it.
"""
    parsed = WhatsAppParser.parse_chat_text(chat_text, "Test")
    assert parsed.messages[0].content == "Line 1\nLine 2\nLine 3"
    assert parsed.messages[1].content == "Got it."
