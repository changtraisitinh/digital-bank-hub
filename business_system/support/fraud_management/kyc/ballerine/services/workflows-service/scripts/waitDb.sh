# HIEPNH

set -e

# There are some times database is not ready yet!
# We'll check if database is ready and we can connect to it
# then the rest of the code run as well.

if [[ -z "${DB_HOST}" ]]; then
  DB_HOST="localhost"
  echo "set DB_HOST=localhost"
else
  DB_HOST="${DB_HOST}"
fi

if [[ -z "${DB_PORT}" ]]; then
  DB_PORT="5432"
  echo "set DB_PORT=5432"
else
  DB_PORT="${DB_PORT}"
fi

echo "Waiting for database..."
echo DB_NAME: ${DB_NAME}
echo DB_HOST: ${DB_HOST}
echo DB_PORT: ${DB_PORT}
while ! ncat -z ${DB_HOST} ${DB_PORT};
do
  sleep 1
  echo "."
done
echo "Connected to database."

echo "Extra wait for 5 second(s)"
sleep 5
echo "Go forward...."

# ... Run what you have to here