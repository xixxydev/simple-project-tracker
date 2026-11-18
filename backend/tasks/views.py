from rest_framework import viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """CRUD for tasks: GET/POST /api/tasks, GET/PUT/PATCH/DELETE /api/tasks/<id>."""

    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def update(self, request, *args, **kwargs):
        # Allow PUT with only the fields being changed (e.g. just "status"),
        # so the frontend's status toggle doesn't have to resend the whole task.
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)
