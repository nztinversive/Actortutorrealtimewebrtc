# Script Reading Assistant

A real-time script reading application using OpenAI's Realtime API and WebRTC. This application allows users to practice reading scripts with an AI scene partner.

## Features

- Real-time voice interaction with AI
- Automatic script progression
- Character role assignment
- Visual script display with highlighting
- Support for stage directions
- Easy-to-use interface with microphone control

## Prerequisites

- Node.js 18 or higher
- An OpenAI API key with access to the Realtime API
- A modern web browser with WebRTC support

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd script-reading-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start both the frontend and backend servers:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Usage

1. Open the application in your browser
2. Click the microphone button to start a reading session
3. The AI will ask which character you want to read as
4. Speak your lines when it's your turn
5. Use the "Stop Reading" button to end the session
6. Use the "Start Over" button to begin from the beginning

## Technical Details

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Real-time Communication: WebRTC
- Styling: CSS Modules
- API: OpenAI Realtime API

## Project Structure

```
├── public/
│   └── microphone.svg
├── server/
│   └── index.ts
├── src/
│   ├── components/
│   │   ├── Controls.tsx
│   │   └── ScriptDisplay.tsx
│   ├── services/
│   │   └── WebRTCConnection.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
└── vite.config.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 