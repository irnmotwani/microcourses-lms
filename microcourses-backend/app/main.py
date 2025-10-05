from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import Base, engine
from app.routes import (
    user_routes,
    auth_routes,
    admin_routes,
    creator_routes,
    lesson_routes,
    course_routes,
    progress_routes,
    student_routes,
    certificate_routes,
)
import os

# ✅ Create database tables
Base.metadata.create_all(bind=engine)

# ✅ Initialize FastAPI app
app = FastAPI(
    title="MicroCourses LMS",
    description="Learning Management System Backend using FastAPI and MVC structure 🚀",
    version="1.0.0",
)

# ✅ Dynamic CORS — works for both local + production
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://microcourses-lms.netlify.app")

origins = [
    FRONTEND_URL,             # Production frontend
    "http://localhost:5173",  # Local frontend
    "http://127.0.0.1:5173",  # Local fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # Allow all HTTP methods
    allow_headers=["*"],   # Allow all headers
)

# ✅ Include all routers
app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(creator_routes.router)
app.include_router(course_routes.router)
app.include_router(lesson_routes.router)
app.include_router(student_routes.router)
app.include_router(progress_routes.router)
app.include_router(certificate_routes.router)

# ✅ Root endpoint (for Render health check)
@app.get("/")
def home():
    return {"message": "Welcome to MicroCourses LMS API 🚀", "status": "running"}

