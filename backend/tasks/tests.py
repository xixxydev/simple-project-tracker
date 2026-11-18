from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task


class TaskApiTests(APITestCase):
    def create_task(self, **overrides):
        data = {"title": "Write docs", "description": "README", "status": "Todo"}
        data.update(overrides)
        return Task.objects.create(**data)

    # GET /tasks
    def test_list_tasks(self):
        self.create_task(title="First")
        self.create_task(title="Second")

        response = self.client.get("/api/tasks")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([t["title"] for t in response.data], ["Second", "First"])

    def test_list_works_with_trailing_slash(self):
        self.assertEqual(self.client.get("/api/tasks/").status_code, status.HTTP_200_OK)

    # POST /tasks
    def test_create_task(self):
        payload = {"title": "New task", "description": "Details", "status": "In Progress"}

        response = self.client.post("/api/tasks", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New task")
        self.assertEqual(response.data["status"], "In Progress")
        self.assertIn("id", response.data)
        self.assertEqual(Task.objects.count(), 1)

    def test_create_defaults_status_to_todo(self):
        response = self.client.post("/api/tasks", {"title": "No status"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "Todo")

    def test_create_rejects_missing_title(self):
        response = self.client.post("/api/tasks", {"description": "x"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_create_rejects_blank_title(self):
        for title in ["", "   "]:
            response = self.client.post("/api/tasks", {"title": title}, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, title)
            self.assertIn("title", response.data)

    def test_create_rejects_invalid_status(self):
        response = self.client.post("/api/tasks", {"title": "x", "status": "Blocked"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["status"][0]), "Status must be one of: Todo, In Progress, Done."
        )

    def test_create_trims_title(self):
        response = self.client.post("/api/tasks", {"title": "  Trim me  "}, format="json")

        self.assertEqual(response.data["title"], "Trim me")

    # PUT /tasks/<id>
    def test_update_all_fields(self):
        task = self.create_task()
        payload = {"title": "Updated", "description": "New desc", "status": "Done"}

        response = self.client.put(f"/api/tasks/{task.id}", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(
            (task.title, task.description, task.status), ("Updated", "New desc", "Done")
        )

    def test_update_status_only(self):
        task = self.create_task(title="Keep me")

        response = self.client.put(f"/api/tasks/{task.id}", {"status": "Done"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual((task.title, task.status), ("Keep me", "Done"))

    def test_update_rejects_invalid_data(self):
        task = self.create_task()

        bad_status = self.client.put(f"/api/tasks/{task.id}", {"status": "Nope"}, format="json")
        blank_title = self.client.put(f"/api/tasks/{task.id}", {"title": " "}, format="json")

        self.assertEqual(bad_status.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(blank_title.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_missing_task_returns_404(self):
        response = self.client.put("/api/tasks/9999", {"status": "Done"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DELETE /tasks/<id>
    def test_delete_task(self):
        task = self.create_task()

        response = self.client.delete(f"/api/tasks/{task.id}")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_delete_missing_task_returns_404(self):
        self.assertEqual(self.client.delete("/api/tasks/9999").status_code, status.HTTP_404_NOT_FOUND)
