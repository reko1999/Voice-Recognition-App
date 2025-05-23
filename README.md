# Voice-Recognition-App
실시간 음성 인식 웹 애플리케이션

## 개요
웹 브라우저에서 음성을 녹음하고 OpenAI Whisper로 텍스트로 변환하는 애플리케이션. FastAPI와 React 기반, ngrok으로 외부 접근 지원.

## 설치
1. Python 3.8 이상.
2. 종속성:
- FFmpeg: `apt-get install -y ffmpeg`.
- fastapi: 백엔드 API 서버.
- uvicorn: FastAPI 실행용 ASGI 서버.
- openai-whisper: 음성 인식 및 텍스트 변환.
- pyngrok: 로컬 서버 외부 공개.
- python-multipart: 파일 업로드 처리.
3. ngrok 설치 및 인증 토큰 설정.

## 실행
1. FastAPI: `python app.py`.
2. ngrok: `./ngrok http 3000`.
3. 공개 URL로 접속.

## API 사용법
- **엔드포인트**: `/transcribe`
- **메서드**: POST
- **요청**: FormData `file` 필드에 WebM 오디오.
- **응답**: JSON 텍스트 결과.
