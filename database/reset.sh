#!/usr/bin/env bash
set -euo pipefail

mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
  < database/schema.sql
mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
  < database/seed.sql
mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
  < database/indexes.sql
mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
  < database/views.sql
mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
  < database/procedures.sql
mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
  < database/triggers.sql
for migration in database/migrations/*.sql; do
  mysql --protocol=tcp -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" \
    < "$migration"
done
