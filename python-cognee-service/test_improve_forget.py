import pytest
from fastapi.testclient import TestClient
from main import app
import cognee_client

client = TestClient(app)

@pytest.fixture
def mock_external(monkeypatch):
    class MockImprove:
        async def __call__(self, project_id):
            if project_id == "fail_proj":
                raise Exception("Cognee improve error")
            return None

    class MockForget:
        async def __call__(self, project_id, data_id=None):
            if project_id == "fail_proj":
                raise Exception("Cognee forget error")
            return None

    monkeypatch.setattr(cognee_client, "improve_dataset", MockImprove())
    monkeypatch.setattr(cognee_client, "forget_dataset_or_node", MockForget())
    return monkeypatch

# Improve Tests
def test_successful_improve(mock_external):
    response = client.post("/memory/improve", json={"project_id": "test_proj"})
    assert response.status_code == 200
    assert response.json()["improved"] is True
    assert response.json()["metadata"]["status"] == "success"

def test_improve_missing_project(mock_external):
    response = client.post("/memory/improve", json={"project_id": ""})
    assert response.status_code == 400

def test_improve_cognee_failure(mock_external):
    response = client.post("/memory/improve", json={"project_id": "fail_proj"})
    assert response.status_code == 500

# Forget Tests
def test_forget_single_memory(mock_external):
    response = client.post("/memory/forget", json={
        "project_id": "test_proj",
        "node_id": "mem_123"
    })
    assert response.status_code == 200
    assert response.json()["forgotten"] is True
    assert response.json()["type"] == "node"
    assert response.json()["node_id"] == "mem_123"

def test_forget_wipe_project(mock_external):
    response = client.post("/memory/forget", json={
        "project_id": "test_proj",
        "wipe_project": True
    })
    assert response.status_code == 200
    assert response.json()["type"] == "dataset"

def test_forget_missing_project(mock_external):
    response = client.post("/memory/forget", json={"project_id": ""})
    assert response.status_code == 400

def test_forget_cognee_failure(mock_external):
    response = client.post("/memory/forget", json={"project_id": "fail_proj"})
    assert response.status_code == 500
