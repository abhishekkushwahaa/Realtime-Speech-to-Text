import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:2700");

ws.on("open", () => {
  console.log("Connected to Vosk server!");
  ws.send(JSON.stringify({ config: { sample_rate: 16000 } }));
  ws.send(JSON.stringify({ eof: 1 }));
});

ws.on("message", (msg) => console.log("Response:", msg.toString()));
ws.on("close", () => console.log("Closed"));
ws.on("error", (err) => console.error("Error:", err));
