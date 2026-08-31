class TestNotFound:
    def test_get_project_404(self, client):
        r = client.get("/api/projects/99999")
        assert r.status_code == 404
        assert "detail" in r.json()

    def test_get_story_404(self, client):
        r = client.get("/api/stories/99999")
        assert r.status_code == 404
        assert "detail" in r.json()

    def test_get_task_404(self, client):
        r = client.get("/api/tasks/99999")
        assert r.status_code == 404
        assert "detail" in r.json()

    def test_update_project_404(self, client):
        assert client.put("/api/projects/99999", json={"name": "Ghost"}).status_code == 404

    def test_update_story_404(self, client):
        assert client.put("/api/stories/99999", json={"title": "Ghost"}).status_code == 404

    def test_update_task_404(self, client):
        assert client.put("/api/tasks/99999", json={"title": "Ghost"}).status_code == 404

    def test_delete_project_404(self, client):
        assert client.delete("/api/projects/99999").status_code == 404

    def test_delete_story_404(self, client):
        assert client.delete("/api/stories/99999").status_code == 404

    def test_delete_task_404(self, client):
        assert client.delete("/api/tasks/99999").status_code == 404

    def test_comments_on_missing_task_404(self, client):
        assert client.get("/api/tasks/99999/comments").status_code == 404
