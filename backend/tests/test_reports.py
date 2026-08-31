import time
import pytest


def _project(client):
    r = client.post("/api/projects", json={"name": "Report Project"})
    assert r.status_code == 201
    return r.json()


class TestReports:
    def test_generate_returns_pending_or_completed(self, client):
        """POST /reports/generate returns 201 with a report record immediately."""
        p = _project(client)
        r = client.post("/api/reports/generate", json={"project_id": p["id"]})
        assert r.status_code == 201
        body = r.json()
        assert body["project_id"] == p["id"]
        assert body["status"] in ("pending", "processing", "completed")
        assert body["id"] is not None

    def test_report_is_retrievable(self, client):
        """GET /reports/{id} returns the report row that was created."""
        p = _project(client)
        r = client.post("/api/reports/generate", json={"project_id": p["id"]})
        report_id = r.json()["id"]
        poll = client.get(f"/api/reports/{report_id}")
        assert poll.status_code == 200
        assert poll.json()["id"] == report_id
        assert poll.json()["project_id"] == p["id"]

    @pytest.mark.integration
    def test_report_completes(self, client):
        """
        Integration test: background worker completes the report.
        NOTE: FastAPI BackgroundTasks that open their own SessionLocal bypass
        the test DB override — this test only passes when the test DB path
        matches what report_worker.py uses (i.e. the same file-based test.db).
        Skip in CI; run manually with:  pytest -m integration
        """
        p = _project(client)
        r = client.post("/api/reports/generate", json={"project_id": p["id"]})
        report_id = r.json()["id"]
        deadline = time.time() + 30
        status = r.json()["status"]
        while status not in ("completed", "failed") and time.time() < deadline:
            time.sleep(0.3)
            status = client.get(f"/api/reports/{report_id}").json()["status"]
        assert status == "completed", f"Final status: {status}"

    @pytest.mark.integration
    def test_completed_report_has_data(self, client):
        """Integration: completed report_data contains required keys."""
        p = _project(client)
        r = client.post("/api/reports/generate", json={"project_id": p["id"]})
        report_id = r.json()["id"]
        deadline = time.time() + 30
        data = None
        while time.time() < deadline:
            time.sleep(0.3)
            poll = client.get(f"/api/reports/{report_id}").json()
            if poll["status"] == "completed":
                data = poll.get("report_data")
                break
        assert data is not None, "report_data None after 30s"
        for key in ("project", "summary", "velocity", "burndown", "sprints"):
            assert key in data, f"Missing key: {key}"

    def test_get_report_404(self, client):
        assert client.get("/api/reports/99999").status_code == 404

    def test_list_project_reports(self, client):
        p = _project(client)
        client.post("/api/reports/generate", json={"project_id": p["id"]})
        r = client.get(f"/api/reports/project/{p['id']}")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1
