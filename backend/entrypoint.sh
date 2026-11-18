#!/bin/sh
set -e

# Create/update database tables automatically on startup.
python manage.py migrate --noinput

exec "$@"
