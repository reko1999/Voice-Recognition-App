import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
} from '@mui/material';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [apiUrl, setApiUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // 현재 URL에서 기본 API 주소 설정
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
    setApiUrl(`${baseUrl}/transcribe`);
  }, []);

  const handleApiUrlChange = (event) => {
    setApiUrl(event.target.value);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        sendAudioData();
      };

      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('마이크 접근에 실패했습니다. 마이크 권한을 허용해주세요.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioData = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setTranscriptions((prev) => [...prev, data.text]);
      } else if (data.error) {
        setTranscriptions((prev) => [...prev, `Error: ${data.error}`]);
      }
    } catch (error) {
      console.error('Error sending audio data:', error);
      setTranscriptions((prev) => [...prev, `Error: ${error.message}`]);
    }
  };

  return (
    <Container className="container">
      <div className="header">
        <Typography variant="h6">Audio Recorder</Typography>
      </div>
      <Box>
        <TextField
          label="API URL"
          variant="outlined"
          fullWidth
          value={apiUrl}
          onChange={handleApiUrlChange}
          className="url-input"
        />
        <div className="button-container">
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartRecording}
            disabled={isRecording}
          >
            Start Recording
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleStopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </Button>
        </div>
      </Box>
      <div className="transcription-container">
        {transcriptions.map((text, index) => (
          <div key={index} className="chat-bubble">
            {text}
          </div>
        ))}
      </div>
    </Container>
  );
}

export default App;