from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import Base, engine
from app.routes import user_routes, auth_routes, admin_routes, creator_routes
from app.routes import lesson_routes
from app.routes import course_routes
from app.routes import progress_routes
from app.routes import student_routes
from app.routes import admin_routes
from app.routes import certificate_routes






# ✅ Create database tables
Base.metadata.create_all(bind=engine)

# ✅ Initialize FastAPI app
app = FastAPI(
    title="MicroCourses LMS",
    description="Learning Management System Backend using FastAPI and MVC structure 🚀",
    version="1.0.0",
)

# ✅ Allow frontend (React) to access backend (CORS)
origins = [
    "http://localhost:5173",  # your Vite frontend
    "http://127.0.0.1:5173",  # fallback just in case
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE etc.
    allow_headers=["*"],  # Allow all headers
)

# ✅ Include routes
app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(creator_routes.router)
app.include_router(course_routes.router)
app.include_router(lesson_routes.router)
app.include_router(student_routes.router)
# after app = FastAPI(...)
app.include_router(progress_routes.router)
app.include_router(certificate_routes.router)


# ✅ Root endpoint
@app.get("/")
def home():
    return {"message": "Welcome to MicroCourses LMS API 🚀"}
