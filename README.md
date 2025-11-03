# 🎙️ Real-Time Speech-to-Text (Vite + Vosk)

A simple, self-hosted web app that converts your voice into text (English, Hindi, or Hinglish) in real time using **Vosk** and **React (Vite)**.

## 🚀 Features

- 🗣️ Real-time speech-to-text (STT)
- 🌏 Works offline (no API keys!)
- 💡 Supports English + Hindi
- 🧱 Built with **Vite + React** for fast dev setup

---

## 🧰 Requirements

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Docker](https://www.docker.com/)
- A Vosk model (like `vosk-model-small-en-in-0.4`)

---

## ⚙️ Setup

### 1. Run the Vosk Server

Download and unzip a model (e.g., Indian English):

```bash
wget https://alphacephei.com/vosk/models/vosk-model-small-en-in-0.4.zip
unzip vosk-model-small-en-in-0.4.zip
mv vosk-model-small-en-in-0.4 model
```

Then start the Vosk WebSocket server:

```bash
docker run -d -p 2700:2700 -v $PWD/model:/opt/vosk/model alphacep/vosk-server:latest
```

🟢 Vosk now runs locally at **ws://localhost:2700**

---

### 2. Create the Vite + React App

```bash
bun create vite@latest speech-to-text-app
cd speech-to-text-app
bun install
```

---

### 5. Run the App

```bash
npm run dev
```

Open the local link (usually `http://localhost:5173`).

---

## 🗣️ How to Use

1. Click **Start Listening**
2. Allow microphone access
3. Speak in English or Hindi
4. Watch live text appear instantly

---

## 🧩 Common Issues

| Problem            | Fix                                           |
| ------------------ | --------------------------------------------- |
| ❌ WebSocket error | Check if Vosk Docker is running               |
| 🎙️ No mic detected | Allow microphone in browser                   |
| 🧠 Wrong text      | Try another Vosk model (Hindi, English, etc.) |

---

## 📜 License

MIT © 2025 — Built with ❤️ using [Vosk](https://alphacephei.com/vosk/) and [React](https://react.dev/)

---
