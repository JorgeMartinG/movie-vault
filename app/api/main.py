import aiofiles
import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import List
from ffmpeg import get_video_info


app = FastAPI()

origins = ["http://10.48.103.186", "http://localhost"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "OPTIONS", "DELETE"],
    allow_headers=["*"],
    allow_credentials=True,
)

UPLOAD_DIR = Path("../uploads").resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/api/uploads/")
async def create_upload_file(file_uploads: List[UploadFile] = File(...)) -> list:
    
    uploaded_files = []

    for file in file_uploads:
        save_to = UPLOAD_DIR / file.filename

        try:

            async with aiofiles.open(save_to, "wb") as f:
                while contents := await file.read(4 * 1024 * 1024):
                    await f.write(contents)

            uploaded_files.append(file.filename)

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error saving file {file.filename}: {e}"
            )

        finally:
            await file.close()

    return [file.filename for file in file_uploads]

@app.get("/api/files/")
async def list_upload_file() -> dict:

    try:
        files = []
        for filename in os.listdir(UPLOAD_DIR):
            file_path = UPLOAD_DIR / filename

            if file_path.is_file():

                file_info = {
                    "filename": filename,
                    "size": file_path.stat().st_size,
                    "last_modified": datetime.fromtimestamp(
                        file_path.stat().st_mtime
                    ).isoformat(),
                }
            
            if filename.lower().endswith(('.mp4', '.mkv', '.ts')):
                video_info = get_video_info(file_path)
                file_info.update(video_info)

            files.append(file_info)

        if not files:
            return {"message": "No files found"}

        return {"files": files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {e}")


@app.delete("/api/files/{filename}")
async def delete_file(filename: str) -> None:

    file_path = UPLOAD_DIR / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"File {filename} not found")

    try:
        os.remove(file_path)
        return {"message": f"File {filename} deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting file {filename}: {e}"
        )

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        log_level="debug",
        timeout_keep_alive=60,
        reload=False,
    )