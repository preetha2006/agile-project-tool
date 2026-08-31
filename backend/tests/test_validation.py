def _setup(client):
    p = client.post("/api/projects", json={"name": "Val Project"}).json()
    s = client.post("/api/stories", json={"title": "Val Story", "project_id": p["id"]}).json()
    t = client.post("/api/tasks", json={"title": "Val Task", "story_id": s["id"]}).json()
    return p, s, t


class TestValidationRejection:
    def test_invalid_project_status(self, client):
        assert client.post("/api/projects", json={"name": "Bad", "status": "nonsense"}).status_code == 422

    def test_invalid_story_priority(self, client):
        assert client.post("/api/stories", json={"title": "Bad", "project_id": 999, "priority": "URGENT"}).status_code == 422

    def test_invalid_story_status(self, client):
        assert client.post("/api/stories", json={"title": "Bad", "project_id": 999, "status": "garbage"}).status_code == 422

    def test_invalid_task_priority(self, client):
        assert client.post("/api/tasks", json={"title": "Bad", "story_id": 999, "priority": "asap"}).status_code == 422

    def test_invalid_task_status(self, client):
        assert client.post("/api/tasks", json={"title": "Bad", "story_id": 999, "status": "flying"}).status_code == 422

    def test_invalid_task_status_patch(self, client):
        p, s, t = _setup(client)
        assert client.patch(f"/api/tasks/{t['id']}/status", json={"status": "flying"}).status_code == 422

    def test_invalid_sprint_status(self, client):
        p, _, _ = _setup(client)
        assert client.post("/api/sprints", json={"name": "Bad Sprint", "project_id": p["id"], "status": "running"}).status_code == 422

    def test_invalid_story_points(self, client):
        p, _, _ = _setup(client)
        assert client.post("/api/stories", json={"title": "Bad", "project_id": p["id"], "story_points": 4}).status_code == 422

    def test_valid_story_points(self, client):
        p, _, _ = _setup(client)
        for pts in [1, 2, 3, 5, 8]:
            r = client.post("/api/stories", json={"title": f"Story {pts}pts", "project_id": p["id"], "story_points": pts})
            assert r.status_code == 201, f"Expected 201 for story_points={pts}, got {r.status_code}: {r.text}"

    def test_422_has_useful_detail(self, client):
        r = client.post("/api/stories", json={"title": "Bad", "project_id": 999, "priority": "nonsense"})
        assert r.status_code == 422
        body = r.json()
        assert "detail" in body
        assert isinstance(body["detail"], list)
        assert len(body["detail"]) > 0
        err = body["detail"][0]
        assert "loc" in err and "msg" in err
