import pytest
from fastapi.testclient import TestClient
from main import app
import dedup
import groq_client
import cognee_client

client = TestClient(app)

@pytest.fixture
def mock_external(monkeypatch):
    class MockExtract:
        async def __call__(self, text):
            from memory_units import MemoryUnit
            return [MemoryUnit(type="Fact", content="Test fact")]
            
    class MockFailExtract:
        async def __call__(self, text):
            raise Exception("Groq error")

    class MockRemember:
        async def __call__(self, proj, statement):
            pass

    class MockFailRemember:
        async def __call__(self, proj, statement):
            raise Exception("Cognee error")
            
    monkeypatch.setattr(dedup, "is_duplicate", lambda p, h: False)
    monkeypatch.setattr(dedup, "store_hash", lambda p, h: None)
    monkeypatch.setattr(groq_client, "extract_memory_units", MockExtract())
    monkeypatch.setattr(cognee_client, "remember_unit", MockRemember())
    
    return monkeypatch

def test_new_capture(mock_external):
    response = client.post("/memory/remember", json={
        "project_id": "test_proj",
        "raw_text": "This is a new capture"
    })
    assert response.status_code == 200
    assert response.json()["remembered"] == 1
    assert response.json()["skipped"] == 0

def test_duplicate_capture(mock_external, monkeypatch):
    monkeypatch.setattr(dedup, "is_duplicate", lambda p, h: True)
    response = client.post("/memory/remember", json={
        "project_id": "test_proj",
        "raw_text": "Duplicate text"
    })
    assert response.status_code == 200
    assert response.json()["remembered"] == 0
    assert response.json()["skipped"] == 1
    assert response.json()["summary"] == "already exists"

def test_groq_failure(mock_external, monkeypatch):
    class MockFailExtract:
        async def __call__(self, text):
            raise Exception("Groq error")
    monkeypatch.setattr(groq_client, "extract_memory_units", MockFailExtract())
    
    response = client.post("/memory/remember", json={
        "project_id": "test_proj",
        "raw_text": "Fail text"
    })
    assert response.status_code == 500
    assert "Groq extraction failed" in response.json()["detail"]

def test_cognee_failure(mock_external, monkeypatch):
    class MockFailRemember:
        async def __call__(self, proj, statement):
            raise Exception("Cognee error")
    monkeypatch.setattr(cognee_client, "remember_unit", MockFailRemember())
    
    response = client.post("/memory/remember", json={
        "project_id": "test_proj",
        "raw_text": "Fail cognee text"
    })
    assert response.status_code == 500
    assert "Cognee ingestion failed" in response.json()["detail"]

def test_database_failure(mock_external, monkeypatch):
    def mock_db_fail(p, h):
        raise Exception("DB Error")
    monkeypatch.setattr(dedup, "is_duplicate", mock_db_fail)
    
    response = client.post("/memory/remember", json={
        "project_id": "test_proj",
        "raw_text": "Fail db text"
    })
    assert response.status_code == 500
    assert response.json()["detail"] == "Database failure"
