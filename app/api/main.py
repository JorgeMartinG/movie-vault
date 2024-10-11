import aiofiles
import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List


app = FastAPI()

origins = ["http://192.168.1.156", "http://localhost"]
# origins = ["http://192.168.0.249", "http://localhost"]

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
async def create_upload_file(file_uploads: List[UploadFile] = File(...)):
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

    return {"filenames": [file.filename for file in file_uploads]}


@app.get("/api/files")
async def list_upload_file():
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

                files.append(file_info)

        if not files:
            return {"message": "No files found"}

        return {"files": files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {e}")


@app.delete("/api/files/{filename}")
async def delete_file(filename: str):
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


# @app.put("/api/files/{filename}")
# async def rename_file(filename: str, new_filename: str):
#     file_path = UPLOAD_DIR / filename
#     new_file_path = UPLOAD_DIR / new_filename

#     if not file_path.exists() or not file_path.is_file():
#         raise HTTPException(status_code=404, detail=f"File {filename} not found")

#     if new_file_path.exists():
#         raise HTTPException(status_code=409, detail=f"File {new_filename} already exists")

#     try:
#         os.rename(file_path, new_file_path)
#         return {"message": f"File {filename} renamed to {new_filename} successfully"}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error renaming file {filename}: {e}")

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