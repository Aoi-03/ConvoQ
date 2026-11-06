import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models.database import init_db

client = TestClient(app)

def test_full_pipeline_and_agents():
    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    assert "status" in res.json()

    # 2. Create Project 'Suman'
    res = client.post("/api/projects", json={"name": "Suman", "description": "College and Personal Chats"})
    assert res.status_code == 200
    project_id = res.json()["id"]
    assert res.json()["name"] == "Suman"

    # 3. Load Sample Data (College Friends group & Shrimant 1-to-1)
    res = client.post(f"/api/projects/{project_id}/load-sample-data")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["chats"]) == 2

    # Check project details
    res = client.get(f"/api/projects/{project_id}")
    assert res.status_code == 200
    proj_detail = res.json()
    assert len(proj_detail["chats"]) == 2
    # Verify group vs one_to_one
    chat_types = {c["name"]: c["chat_type"] for c in proj_detail["chats"]}
    assert chat_types["College Friends 🎓"] == "group"
    assert chat_types["Shrimant"] == "one_to_one"
    # Verify participant count is at least 20
    assert len(proj_detail["participants"]) >= 20

    # 4. Verify Personas
    res = client.get(f"/api/projects/{project_id}/personas")
    assert res.status_code == 200
    personas = res.json()
    assert len(personas) >= 2
    persona_names = [p["name"] for p in personas]
    assert "Shrimant" in persona_names
    shrimant_persona = next(p for p in personas if p["name"] == "Shrimant")
    assert shrimant_persona["group_role"] is not None

    # 5. Deep Analyzer Query: "Who drives most conversations?"
    res = client.post("/api/agents/query", json={
        "project_id": project_id,
        "agent_type": "deep_analyzer",
        "query": "Who drives most conversations and how did the group mood change over the year?"
    })
    assert res.status_code == 200
    analyzer_res = res.json()
    assert len(analyzer_res["citations"]) > 0
    assert "Deep Conversation Analysis" in analyzer_res["answer"] or len(analyzer_res["answer"]) > 50

    # 6. Roaster Query: Roast Shrimant based on voice note habits
    res = client.post("/api/agents/query", json={
        "project_id": project_id,
        "agent_type": "roaster",
        "target_participant_name": "Shrimant",
        "roast_intensity": "savage",
        "query": "Roast Shrimant based on his voice-note habits"
    })
    assert res.status_code == 200
    roaster_res = res.json()
    assert len(roaster_res["citations"]) > 0
    assert "Shrimant" in roaster_res["answer"]
    assert "voice" in roaster_res["answer"].lower() or "audio" in roaster_res["answer"].lower()

    # 7. Reply Giver Query
    res = client.post("/api/agents/query", json={
        "project_id": project_id,
        "agent_type": "reply_giver",
        "query": "Meet at CCD in 20 mins?",
        "reply_style": "witty"
    })
    assert res.status_code == 200
    reply_res = res.json()
    assert reply_res["reply_suggestions"] is not None
    assert len(reply_res["reply_suggestions"]) >= 2

    # 8. Memory Recall Query: Goa Trip
    res = client.post("/api/agents/query", json={
        "project_id": project_id,
        "agent_type": "memory_recall",
        "query": "What did we decide about the Goa trip in June 2023?"
    })
    assert res.status_code == 200
    recall_res = res.json()
    assert len(recall_res["citations"]) > 0
