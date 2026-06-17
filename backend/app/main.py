from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import workorders

settings = get_settings()

app = FastAPI(
    title="Work Order API",
    description="FastAPI middleware that proxies DataSpace data. Credentials stay server-side.",
    version="1.0.0",
)

# CORS — only allow the React dev server (and any production domain you add to .env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(workorders.router, prefix="/api/workorders", tags=["Work Orders"])


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ds_environment}
