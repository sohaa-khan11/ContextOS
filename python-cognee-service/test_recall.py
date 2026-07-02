import pytest
from fastapi.testclient import TestClient
from main import app
import cognee_client

client = TestClient(app)

@pytest.fixture
def mock_external(monkeypatch):
    class MockRecallQuery:
        async def __call__(self, proj, query):
            return {
                "answer": f"Mock answer for {query}",
                "path": [{"source": "A", "edge": "B", "target": "C"}]
            }

    class MockFailRecallQuery:
        async def __call__(self, proj, query):
            raise Exception("Cognee timeout or failure")

    monkeypatch.setattr(cognee_client, "recall_query", MockRecallQuery())
    return monkeypatch

def test_successful_recall(mock_external):
    response = client.post("/memory/recall", json={
        "project_id": "test_proj",
        "question": "Why did we choose FastAPI?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "Mock answer for Why did we choose FastAPI?" in data["answer"]
    assert len(data["path"]) == 1
    assert data["metadata"]["project_id"] == "test_proj"

def test_empty_query(mock_external):
    response = client.post("/memory/recall", json={
        "project_id": "test_proj",
        "question": ""
    })
    assert response.status_code == 400
    assert "Empty query" in response.json()["detail"]

def test_invalid_project(mock_external):
    response = client.post("/memory/recall", json={
        "project_id": "",
        "question": "Query"
    })
    assert response.status_code == 400
    assert "Invalid project ID" in response.json()["detail"]

def test_cognee_failure(mock_external, monkeypatch):
    class MockFailRecallQuery:
        async def __call__(self, proj, query):
            raise Exception("Cognee error")
            
    monkeypatch.setattr(cognee_client, "recall_query", MockFailRecallQuery())
    response = client.post("/memory/recall", json={
        "project_id": "test_proj",
        "question": "Query"
    })
    assert response.status_code == 500
    assert "Cognee recall failed" in response.json()["detail"]

def test_no_results(mock_external, monkeypatch):
    class MockEmptyRecallQuery:
        async def __call__(self, proj, query):
            return {"answer": None, "path": []}
            
    monkeypatch.setattr(cognee_client, "recall_query", MockEmptyRecallQuery())
    response = client.post("/memory/recall", json={
        "project_id": "test_proj",
        "question": "Query"
    })
    assert response.status_code == 404
    assert "No matching memories" in response.json()["detail"]
