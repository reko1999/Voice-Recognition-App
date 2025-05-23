# FastAPI 서버 코드
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import whisper
import io
import os
import tempfile
import numpy as np
import uvicorn

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인에서 접근 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 및 템플릿 설정
app.mount("/static", StaticFiles(directory="./www/static"), name="static")
templates = Jinja2Templates(directory="./www")

# Whisper 모델 로드
model = whisper.load_model("base")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # 임시 파일 생성
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
        # 파일 데이터를 임시 파일에 쓰기
        audio_data = await file.read()
        temp_file.write(audio_data)
        temp_file_path = temp_file.name
    
    try:
        # Whisper 모델은 오디오 파일 경로를 직접 처리 가능
        result = model.transcribe(temp_file_path)
        
        # 처리 후 임시 파일 삭제
        os.unlink(temp_file_path)
        
        return JSONResponse(content={"text": result["text"]})
    except Exception as e:
        # 오류 발생 시에도 임시 파일 삭제 시도
        try:
            os.unlink(temp_file_path)
        except:
            pass
        
        print(f'Error: {e}')
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)