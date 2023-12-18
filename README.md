# Face Recognition App

Table of contents
-----------------

- [Frontend](#frontend)
- [Backend](#backend)
- [Docker](#docker)

## Frontend

Techstack: React

```bash
# Open a terminal inside frontend folder
cd frontend

# Install dependencies, use node 18.17.0 or later
yarn install

# Run project locally in development
yarn dev
```


## Backend

Techstack: FastAPI

1. Install Python v3.11.4: <https://www.python.org/downloads/>

2. Install Miniconda using installer or command line: <https://docs.conda.io/projects/miniconda/en/latest/index.html#quick-command-line-install>

Suggestion: Installation tutorials could be helpful


```bash
# Open a terminal inside backend folder
cd backend

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
