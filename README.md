# Face Recognition App

Table of contents
-----------------

- [Web](#web)
- [API](#api)
- [Docker](#docker)

## Web

Techstack: React

```bash
# Open a terminal inside web folder
cd web

# Install dependencies, use node 20.11.0 or later
pnpm install

# Run project locally in development
pnpm dev
```

## API

Techstack: FastAPI

1. Install Python v3.11.4: <https://www.python.org/downloads/>

2. Install Miniconda using installer or command line: <https://docs.anaconda.com/free/miniconda/#quick-command-line-install>

Suggestion: Installation tutorials could be helpful

```bash
# Open a terminal inside backend folder
cd api

# Create a new conda environment named face-recognition-api, use python 3.11.x version for stability
conda create -n face-recognition-api python=3.11.4

# Activate face-recognition-api environment (IMPORTANT, don't use "base" environment)
conda activate face-recognition-api

# Install dependencies
pip install -r requirements.txt

# Run the project
sh scripts/run.sh # uvicorn app.main:app --host 0.0.0.0 --port 80 --reload

```

Open the server in <http://0.0.0.0/>.

<http://0.0.0.0/docs> to see Swagger UI.

<http://0.0.0.0/redoc> to the Redoc.

## Docker
TODO
