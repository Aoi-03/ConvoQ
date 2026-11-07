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

def test_zip_upload_and_extraction():
    import io
    import zipfile
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)
    proj_res = client.post("/api/projects", json={"name": "Zip Test", "description": "Testing WhatsApp ZIP"})
    assert proj_res.status_code == 200
    proj_id = proj_res.json()["id"]

    # Create mock WhatsApp zip in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as z:
        chat_content = """[12/01/24, 8:00:00 PM] Alice: Hey Bob, check this voice note!
[12/01/24, 8:00:15 PM] Alice: PTT-20241201-WA0001.opus (file attached)
[12/01/24, 8:01:00 PM] Bob: Got your audio, loved it.
"""
        z.writestr("_chat.txt", chat_content.encode("utf-8"))
        z.writestr("PTT-20241201-WA0001.opus", b"fake_opus_audio_bytes")
        z.writestr("photo.jpg", b"fake_jpg_image_bytes")

    zip_buffer.seek(0)
    upload_res = client.post(
        f"/api/projects/{proj_id}/chats/upload",
        files={"file": ("WhatsApp_Chat_Alice.zip", zip_buffer, "application/zip")},
        data={"chat_name": "Alice 1:1"}
    )
    assert upload_res.status_code == 200
    data = upload_res.json()
    assert data["success"] is True
    assert data["is_zip"] is True
    assert "Alice" in data["participants"]
    assert "Bob" in data["participants"]
    assert data["total_messages"] == 3
