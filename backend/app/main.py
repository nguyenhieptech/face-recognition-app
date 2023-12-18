import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import app.config as config
from app.routers import images

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files: https://fastapi.tiangolo.com/tutorial/static-files/
app.mount(
    path="/api/app/data",
    app=StaticFiles(directory=config.DB_PATH),
    name="uploaded_images",
)


@app.get("/")
def root():
    """
    Greeting!
    """
    if os.path.exists(config.DB_PATH):
        return {"message": "Welcome to Face Recognition API."}
    else:
        return {
            "message": f"Error when trying to connect {config.DB_PATH}, there is no database available."
        }


app.include_router(router=images.router, prefix="/api", tags=["images"])
