class TestComments:
    def _setup(self, client):
        p = client.post("/api/projects", json={"name": "Comment Project"}).json()
        s = client.post("/api/stories", json={"title": "S1", "project_id": p["id"]}).json()
        t = client.post("/api/tasks", json={"title": "T1", "story_id": s["id"]}).json()
        return t

    def test_list_comments_empty(self, client):
        t = self._setup(client)
        r = client.get(f"/api/tasks/{t['id']}/comments")
        assert r.status_code == 200
        assert r.json() == []

    def test_add_and_list_comment(self, client):
        t = self._setup(client)
        r = client.post(f"/api/tasks/{t['id']}/comments", json={"author": "Alice", "body": "Great task!"})
        assert r.status_code == 201
        c = r.json()
        assert c["author"] == "Alice"
        assert c["body"] == "Great task!"
        assert c["task_id"] == t["id"]
        comments = client.get(f"/api/tasks/{t['id']}/comments").json()
        assert len(comments) == 1

    def test_multiple_comments_ordered(self, client):
        t = self._setup(client)
        for i in range(3):
            client.post(f"/api/tasks/{t['id']}/comments", json={"author": "Bob", "body": f"Comment {i}"})
        comments = client.get(f"/api/tasks/{t['id']}/comments").json()
        assert len(comments) == 3
        assert [c["body"] for c in comments] == ["Comment 0", "Comment 1", "Comment 2"]
