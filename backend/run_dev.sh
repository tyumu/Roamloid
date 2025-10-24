#!/bin/bash
set -euo pipefail

echo "[run_dev] starting..."

# Run from WSL: create venv if missing, install requirements, then run backend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d ".venv" ]; then
	echo "[run_dev] creating virtualenv .venv"
	python3 -m venv .venv
else
	echo "[run_dev] found existing .venv"
fi

echo "[run_dev] activating virtualenv"
. .venv/bin/activate

echo "[run_dev] ensuring pip and requirements"
pip install --upgrade pip >/dev/null
if [ -f requirements.txt ]; then
	pip install -r requirements.txt >/dev/null
fi

echo "[run_dev] starting backend run.py"
.venv/bin/python run.py

status=$?
echo "[run_dev] backend exited with code $status"
exit $status
