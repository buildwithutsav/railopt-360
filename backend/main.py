from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import OptimizationRequest, OptimizationResponse
from optimizer import optimize_block


app = FastAPI(
    title="RAILOPT 360 Optimization API",
    description=(
        "Constraint-aware railway maintenance "
        "block optimization prototype."
    ),
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://railopt-360-lastminute.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {
        "system": "RAILOPT 360",
        "service": "Optimization API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "optimizer": "OR-Tools CP-SAT",
    }


@app.post(
    "/optimize",
    response_model=OptimizationResponse,
)
def optimize(request: OptimizationRequest):
    return optimize_block(request)