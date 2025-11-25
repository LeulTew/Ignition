from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services import generate_breakdown
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Smart Goal Breaker API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GoalRequest(BaseModel):
    goal: str

@app.get("/")
def read_root():
    return {"status": "System Online", "latency": "12ms"}

@app.post("/breakdown")
def breakdown_goal(request: GoalRequest):
    try:
        result = generate_breakdown(request.goal)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
