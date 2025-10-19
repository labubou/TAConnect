#!/bin/bash
set -euo pipefail

DB_HOST="${DATABASE_HOST:-db}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-ta_connect_db}"
DB_USER="${DATABASE_USER:-ta_connect_user}"
DB_PASS="${DATABASE_PASSWORD:-ta_connect_password}"

export PGPASSWORD="$DB_PASS"

echo "Waiting for Postgres at $DB_HOST:$DB_PORT (db=$DB_NAME, user=$DB_USER)..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  sleep 1
done
echo "Database is ready!"

echo "Checking for migration conflicts..."
# Check if there's an inconsistent migration history
if python manage.py migrate --check 2>&1 | grep -q "InconsistentMigrationHistory"; then
  echo "⚠️  Migration conflict detected. Clearing migration history..."
  
  # Clear the django_migrations table
  python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('DROP SCHEMA public CASCADE;')
cursor.execute('CREATE SCHEMA public;')
cursor.execute('GRANT ALL ON SCHEMA public TO postgres;')
cursor.execute('GRANT ALL ON SCHEMA public TO public;')
print('Database schema reset')
"
fi

echo "Running database migrations..."
# Create migrations for accounts app first (custom user model)
python manage.py makemigrations accounts
# Then create migrations for other apps
python manage.py makemigrations
# Apply all migrations
python manage.py migrate

echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        user_type='instructor'
    )
    print('✓ Superuser created: admin/admin123')
else:
    print('✓ Superuser already exists')
"

echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000