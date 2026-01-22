from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel, Field
import trimesh
import numpy as np

app = FastAPI()

class BoxRequest(BaseModel):
    size_mm: float = Field(default=20.0, ge=5.0, le=100.0)
    thickness_mm: float = Field(default=3.0, ge=1.0, le=20.0)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/generate")
def generate(req: BoxRequest):
    box = trimesh.creation.box(extents=(req.size_mm, req.size_mm, req.thickness_mm))
    stl_bytes = trimesh.exchange.stl.export_stl(box)

    return Response(
        content=stl_bytes,
        media_type="application/sla",
        headers={"Content-Disposition": 'attachment; filename="test.stl"'},
    )
