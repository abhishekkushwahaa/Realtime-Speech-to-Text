# 🎙️ Real-Time Speech-to-Text (Vite + Vosk)

A simple, self-hosted web app that converts your voice into text (English, Hindi, or Hinglish) in real time using **Vosk** and **React (Vite)**.

## Features

- 🗣️ Real-time speech-to-text (STT)
- 🌏 Works offline (no API keys!)
- 💡 Supports English + Hindi
- 🧱 Built with **Vite + React** for fast dev setup

## Requirements

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Docker](https://www.docker.com/)
- A Vosk model (like `vosk-model-small-en-in-0.4`)

## Setup

### 1. Run the Vosk Server

@@ -43,21 +43,21 @@
bun install

````

### 3. Run the App

```bash
bun run dev
````

Open the local link (usually `http://localhost:5173`).

## 🗣️ How to Use

1. Click **Start Listening**
2. Allow microphone access
3. Speak in English or Hindi
4. Watch live text appear instantly

## 📜 License

MIT © 2025 — Built with ❤️ using [Vosk](https://alphacephei.com/vosk/) and [React](https://react.dev/)
