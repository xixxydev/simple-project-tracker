from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "description", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        # DRF trims whitespace from text fields, so "   " counts as blank.
        extra_kwargs = {
            "title": {"error_messages": {"blank": "Title must not be empty."}},
            "status": {
                "error_messages": {
                    "invalid_choice": "Status must be one of: Todo, In Progress, Done."
                }
            },
        }
