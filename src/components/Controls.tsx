import React from 'react';
import './Controls.css';

interface ControlsProps {
  isReading: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  isWaitingForUser: boolean;
  onStartReading: () => void;
  onStopReading: () => void;
  onStartOver: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isReading,
  isConnected,
  isSpeaking,
  isWaitingForUser,
  onStartReading,
  onStopReading,
  onStartOver
}) => {
  return (
    <div className="controls">
      <button 
        className={`mic-button ${isReading ? 'active' : ''} ${isSpeaking ? 'speaking' : ''} ${isWaitingForUser ? 'waiting' : ''}`}
        onClick={isReading ? onStopReading : onStartReading}
        disabled={!isConnected}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>

      {isReading && (
        <div className="action-buttons">
          <button 
            className="stop-button"
            onClick={onStopReading}
          >
            Stop Reading
          </button>
          <button 
            className="start-over-button"
            onClick={onStartOver}
          >
            Start Over
          </button>
        </div>
      )}

      {!isConnected && (
        <div className="connection-status">
          Connecting to server...
        </div>
      )}

      {isConnected && (
        <div className="speaking-status">
          {isSpeaking ? 'Speaking...' : 
           isWaitingForUser ? 'Your turn to speak...' : 
           isReading ? 'Listening...' : ''}
        </div>
      )}
    </div>
  );
}; 