def _project(client, name="Test Project", status="active"):
    r = client.post("/api/projects", json={"name": name, "status": status})
    assert r.status_code == 201, r.text
    return r.json()

def _story(client, project_id, title="Test Story", priority="medium", story_points=3):
    r = client.post("/api/stories", json={"title": title, "project_id": project_id,
                                          "priority": priority, "story_points": story_points})
    assert r.status_code == 201, r.text
    return r.json()

def _task(client, story_id, title="Test Task", priority="medium", status="todo"):
    r = client.post("/api/tasks", json={"title": title, "story_id": story_id,
                                        "priority": priority, "status": status})
    assert r.status_code == 201, r.text
    return r.json()


class TestHierarchyCreation:
    def test_create_project(self, client):
        p = _project(client)
        assert p["id"] is not None
        assert p["name"] == "Test Project"
        assert p["status"] == "active"

    def test_create_story_under_project(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        assert s["project_id"] == p["id"]
        assert s["status"] == "backlog"
        assert s["story_points"] == 3

    def test_create_task_under_story(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        assert t["story_id"] == s["id"]
        assert t["status"] == "todo"
        assert t["priority"] == "medium"

    def test_full_hierarchy_links(self, client):
        p = _project(client, name="Hierarchy Project")
        s = _story(client, p["id"], title="Auth Story")
        t = _task(client, s["id"], title="Write login handler")

        rp = client.get(f"/api/projects/{p['id']}")
        assert rp.status_code == 200
        assert rp.json()["story_count"] == 1

        rs = client.get(f"/api/stories/{s['id']}")
        assert rs.status_code == 200
        assert rs.json()["project_id"] == p["id"]

        rt = client.get(f"/api/tasks/{t['id']}")
        assert rt.status_code == 200
        assert rt.json()["story_id"] == s["id"]

    def test_task_list_filtered_by_story(self, client):
        p = _project(client)
        s1 = _story(client, p["id"], title="Story 1")
        s2 = _story(client, p["id"], title="Story 2")
        _task(client, s1["id"], title="Task A")
        _task(client, s1["id"], title="Task B")
        _task(client, s2["id"], title="Task C")
        r = client.get(f"/api/tasks?story_id={s1['id']}")
        assert r.status_code == 200
        tasks = r.json()
        assert len(tasks) == 2
        assert all(t["story_id"] == s1["id"] for t in tasks)


class TestUpdateOperations:
    def test_update_project(self, client):
        p = _project(client)
        r = client.put(f"/api/projects/{p['id']}", json={"name": "Renamed", "status": "on_hold"})
        assert r.status_code == 200
        assert r.json()["name"] == "Renamed"
        assert r.json()["status"] == "on_hold"

    def test_update_story(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        r = client.put(f"/api/stories/{s['id']}", json={"title": "Updated Story", "status": "in_progress"})
        assert r.status_code == 200
        assert r.json()["title"] == "Updated Story"
        assert r.json()["status"] == "in_progress"

    def test_update_task(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        r = client.put(f"/api/tasks/{t['id']}", json={"title": "Updated Task", "priority": "high"})
        assert r.status_code == 200
        assert r.json()["title"] == "Updated Task"
        assert r.json()["priority"] == "high"

    def test_patch_task_status(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        r = client.patch(f"/api/tasks/{t['id']}/status", json={"status": "in_review"})
        assert r.status_code == 200
        assert r.json()["status"] == "in_review"

    def test_toggle_block(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        assert t["is_blocked"] is False
        r = client.patch(f"/api/tasks/{t['id']}/toggle-block")
        assert r.status_code == 200
        assert r.json()["is_blocked"] is True
        r2 = client.patch(f"/api/tasks/{t['id']}/toggle-block")
        assert r2.json()["is_blocked"] is False


class TestDeleteOperations:
    def test_delete_task(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        assert client.delete(f"/api/tasks/{t['id']}").status_code == 204
        assert client.get(f"/api/tasks/{t['id']}").status_code == 404

    def test_delete_story_cascades_tasks(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        assert client.delete(f"/api/stories/{s['id']}").status_code == 204
        assert client.get(f"/api/tasks/{t['id']}").status_code == 404

    def test_delete_project_cascades(self, client):
        p = _project(client)
        s = _story(client, p["id"])
        t = _task(client, s["id"])
        assert client.delete(f"/api/projects/{p['id']}").status_code == 204
        assert client.get(f"/api/projects/{p['id']}").status_code == 404
        assert client.get(f"/api/stories/{s['id']}").status_code == 404
        assert client.get(f"/api/tasks/{t['id']}").status_code == 404
