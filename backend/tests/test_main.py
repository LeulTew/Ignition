from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "System Online", "latency": "12ms"}

@patch("app.main.generate_breakdown")
def test_breakdown_goal(mock_generate):
    mock_generate.return_value = {
        "steps": ["Step 1", "Step 2"],
        "complexity": 5
    }
    
    response = client.post("/breakdown", json={"goal": "Test Goal", "language": "am"})
    assert response.status_code == 200
    data = response.json()
    assert data["steps"] == ["Step 1", "Step 2"]
    assert data["complexity"] == 5
    mock_generate.assert_called_once_with("Test Goal", "am")

@patch("app.main.generate_sub_breakdown")
def test_sub_breakdown_step(mock_generate_sub):
    mock_generate_sub.return_value = {
        "substeps": ["Sub 1", "Sub 2"]
    }
    
    response = client.post("/sub-breakdown", json={"step": "Test Step", "language": "am"})
    assert response.status_code == 200
    data = response.json()
    assert data["substeps"] == ["Sub 1", "Sub 2"]
    mock_generate_sub.assert_called_once_with("Test Step", "am")
