from django.db import models


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "Todo", "Todo"
        IN_PROGRESS = "In Progress", "In Progress"
        DONE = "Done", "Done"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return self.title
