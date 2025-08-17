from fastapi import FastAPI, File, UploadFile
import os, shutil

app = FastAPI()

# Save in ../uploads (folder next to trigger.js)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"message": "Uploaded successfully", "path": file_path}
    except Exception as e:
        return {"error": str(e)}
