import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { ScriptDisplay } from './components/ScriptDisplay';
import { Controls } from './components/Controls';
import { WebRTCConnection } from './services/WebRTCConnection';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [userCharacter, setUserCharacter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const webrtcRef = useRef<WebRTCConnection | null>(null);

  useEffect(() => {
    const initWebRTC = async () => {
      try {
        // Get ephemeral token from server
        const response = await fetch('/api/session');
        const data = await response.json();
        const token = data.client_secret.value;

        // Initialize WebRTC connection
        webrtcRef.current = new WebRTCConnection(token);
        
        // Set up callbacks
        webrtcRef.current.setCallbacks({
          onCharacterAssigned: (character) => {
            setUserCharacter(character);
            setCurrentLine(0); // Reset to first line
          },
          onLineComplete: () => {
            setCurrentLine(prev => prev + 1);
          },
          onError: (error) => {
            setError(error.message);
            setIsConnected(false);
          },
          onTurnStart: () => {
            setIsSpeaking(true);
            setIsWaitingForUser(false);
          },
          onTurnEnd: () => {
            setIsSpeaking(false);
          },
          onWaitingForUser: () => {
            setIsWaitingForUser(true);
          }
        });

        await webrtcRef.current.connect();
        setIsConnected(true);
        setError(null);
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        setError('Failed to connect to server. Please try again.');
        setIsConnected(false);
      }
    };

    initWebRTC();

    return () => {
      webrtcRef.current?.disconnect();
    };
  }, []);

  const handleStartReading = async () => {
    if (!webrtcRef.current) return;
    
    setIsReading(true);
    setError(null);
    setIsWaitingForUser(false);
    webrtcRef.current.enableMicrophone(true);
    
    try {
      // The initial message will be sent automatically after connection
      // Just enable the microphone and wait for the AI's question
      setIsWaitingForUser(true);
    } catch (error) {
      console.error('Failed to start reading:', error);
      setError('Failed to start reading. Please try again.');
      setIsReading(false);
      webrtcRef.current.enableMicrophone(false);
    }
  };

  const handleStopReading = async () => {
    if (!webrtcRef.current) return;
    
    try {
      webrtcRef.current.enableMicrophone(false);
      setIsWaitingForUser(false);
      setIsSpeaking(false);
      await webrtcRef.current.sendMessage({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{
            type: "input_text",
            text: "Stop Reading"
          }]
        }
      });
    } catch (error) {
      console.error('Failed to stop reading:', error);
    }

    setIsReading(false);
    setCurrentLine(0);
    setUserCharacter('');
  };

  const handleStartOver = async () => {
    if (!webrtcRef.current) return;
    
    try {
      setIsWaitingForUser(false);
      setIsSpeaking(false);
      await webrtcRef.current.sendMessage({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{
            type: "input_text",
            text: "Start Over"
          }]
        }
      });
      setCurrentLine(0);
      setUserCharacter('');
      setIsWaitingForUser(true);
    } catch (error) {
      console.error('Failed to start over:', error);
      setError('Failed to start over. Please try again.');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Script Reading Assistant</h1>
        {userCharacter && (
          <div className="character-info">
            Reading as: <span>{userCharacter}</span>
          </div>
        )}
      </header>
      
      <main>
        <ScriptDisplay currentLine={currentLine} />
        
        <Controls 
          isReading={isReading}
          isConnected={isConnected}
          isSpeaking={isSpeaking}
          isWaitingForUser={isWaitingForUser}
          onStartReading={handleStartReading}
          onStopReading={handleStopReading}
          onStartOver={handleStartOver}
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 