#!/usr/bin/env bash
set -euo pipefail

# Run from WSL: create venv if missing, install requirements, then run backend
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Creating virtualenv .venv..."
  python3 -m venv .venv
fi

echo "Activating venv and installing requirements..."
. .venv/bin/activate
pip install --upgrade pip
# install requirements (fast-fail if missing file)
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

echo "Starting backend..."
exec .venv/bin/python run.py
