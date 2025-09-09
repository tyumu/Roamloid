param(
  [Parameter(Position=0)][string]$Task = "help"
)

function Ensure-Venv {
  if (-not (Test-Path .venv)) { python -m venv .venv }
  . .\.venv\Scripts\Activate.ps1
}

switch ($Task) {
  "install" {
    Ensure-Venv
    pip install -r requirements.txt
  }
  "dev" {
    Ensure-Venv
    python run.py
  }
  "lint" {
    Ensure-Venv
    ruff check app tests
  }
  "test" {
    Ensure-Venv
    pytest -q
  }
  "format" {
    Ensure-Venv
    ruff check --fix app tests
  }
  Default {
    Write-Host "Tasks: install | dev | lint | test | format"
  }
}
