from django.urls import re_path

from .views import TaskViewSet

task_list = TaskViewSet.as_view({"get": "list", "post": "create"})
task_detail = TaskViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

# Trailing slash is optional: /tasks and /tasks/ both work.
urlpatterns = [
    re_path(r"^tasks/?$", task_list, name="task-list"),
    re_path(r"^tasks/(?P<pk>\d+)/?$", task_detail, name="task-detail"),
]
