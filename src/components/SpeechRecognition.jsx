import { useEffect, useRef, useState } from "react";

const SpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(0);

  const socket = useRef(null);
  const audioContext = useRef(null);
  const processor = useRef(null);
  const source = useRef(null);
  const timer = useRef(null);
  const mediaStream = useRef(null);

  const VOSK_SERVER = "ws://localhost:2700";
  const SAMPLE_RATE = 16000;

  const downsampleBuffer = (buffer, inputRate, outputRate) => {
    if (inputRate === outputRate) return buffer;
    const ratio = inputRate / outputRate;
    const newLen = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLen);
    for (let i = 0; i < newLen; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.floor((i + 1) * ratio);
      let sum = 0;
      for (let j = start; j < end && j < buffer.length; j++) sum += buffer[j];
      result[i] = sum / (end - start);
    }
    return result;
  };

  const startListening = async () => {
    setTranscript("");
    setPartialTranscript("");
    setElapsed(0);
    setStatus("Connecting...");

    socket.current = new WebSocket(VOSK_SERVER);

    socket.current.onopen = async () => {
      setStatus("Connected. Awaiting microphone...");
      try {
        mediaStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setStatus("Listening...");
        setIsListening(true);

        socket.current.send(
          JSON.stringify({ config: { sample_rate: SAMPLE_RATE } })
        );

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext.current = new AudioContext();

        const inputRate = audioContext.current.sampleRate;
        source.current = audioContext.current.createMediaStreamSource(
          mediaStream.current
        );
        processor.current = audioContext.current.createScriptProcessor(
          4096,
          1,
          1
        );

        processor.current.onaudioprocess = (e) => {
          if (!socket.current || socket.current.readyState !== WebSocket.OPEN)
            return;
          const input = e.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(input, inputRate, SAMPLE_RATE);

          const rms = Math.sqrt(
            downsampled.reduce((s, v) => s + v * v, 0) / downsampled.length
          );
          setVolume(rms * 100);

          const pcm = new Int16Array(downsampled.length);
          for (let i = 0; i < downsampled.length; i++) {
            let s = Math.max(-1, Math.min(1, downsampled[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          socket.current.send(pcm.buffer);
        };

        source.current.connect(processor.current);
        processor.current.connect(audioContext.current.destination);

        timer.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      } catch (err) {
        console.error("Error initializing audio:", err);
        setStatus(`Error: ${err.message}. Check mic permissions.`);
        stopListening();
      }
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.partial) setPartialTranscript(data.partial);
      if (data.text) {
        setTranscript((t) => (t + " " + data.text).trim());
        setPartialTranscript("");
      }
    };

    socket.current.onerror = () => {
      setStatus("Error (Check Vosk server)");
      stopListening();
    };

    socket.current.onclose = () => {
      if (isListening) setStatus("Disconnected");
      stopListening();
    };
  };

  const stopListening = () => {
    if (!isListening && !audioContext.current) return;

    setIsListening(false);
    if (status !== "Error") setStatus("Stopped");

    if (timer.current) clearInterval(timer.current);
    timer.current = null;

    if (socket.current) {
      try {
        if (socket.current.readyState === WebSocket.OPEN)
          socket.current.send(JSON.stringify({ eof: 1 }));
        socket.current.close();
      } catch (err) {
        console.error("Error closing socket:", err);
      }
      socket.current = null;
    }

    if (processor.current) {
      processor.current.disconnect();
      processor.current = null;
    }
    if (source.current) {
      source.current.disconnect();
      source.current = null;
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }

    if (audioContext.current) {
      audioContext.current.close().catch(console.error);
      audioContext.current = null;
    }

    setVolume(0);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "50px auto",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        background: "linear-gradient(145deg, #e8b76fff, #ada853ff)",
      }}
    >
      <h2
        style={{
          fontSize: "26px",
          marginBottom: "15px",
          textAlign: "center",
          color: "#222",
          fontWeight: "700",
        }}
      >
        🎙️ Real-time Speech-to-Text
      </h2>

      <p
        style={{
          color: "#555",
          textAlign: "center",
          fontSize: "14px",
          marginBottom: "20px",
        }}
      >
        {status} {isListening && <span>• {elapsed}s</span>}
      </p>

      {/* Animated mic button */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            backgroundColor: isListening ? "#ff4b4b" : "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "90px",
            height: "90px",
            fontSize: "32px",
            cursor: "pointer",
            boxShadow: isListening
              ? "0 0 25px rgba(255,75,75,0.6)"
              : "0 0 20px rgba(76,175,80,0.5)",
            transition: "all 0.3s ease-in-out",
            transform: isListening ? "scale(1.1)" : "scale(1)",
          }}
        >
          {isListening ? "🛑" : "🎧"}
        </button>
      </div>

      {/* Volume visualizer */}
      {isListening && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            height: "30px",
            gap: "3px",
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => {
            const active = i < Math.round((volume / 100) * 20);
            return (
              <div
                key={i}
                style={{
                  width: "6px",
                  height: `${10 + i * 1.5}px`,
                  background: active ? "#4caf50" : "#ccc",
                  borderRadius: "3px",
                  transition: "background 0.1s, height 0.2s",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Transcript */}
      <div
        style={{
          background: "#fff",
          border: "2px solid #eee",
          borderRadius: "10px",
          padding: "15px 20px",
          minHeight: "120px",
          lineHeight: "1.6",
          color: "#222",
          fontSize: "15px",
          overflowY: "auto",
        }}
      >
        <strong style={{ color: "#333" }}>🗣️ Transcript:</strong>
        <p style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}>
          {transcript}
        </p>
        <p
          style={{
            color: "#888",
            fontStyle: "italic",
            transition: "opacity 0.3s",
            opacity: partialTranscript ? 1 : 0,
          }}
        >
          {partialTranscript}
        </p>
      </div>
    </div>
  );
};

export default SpeechRecognition;
