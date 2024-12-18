import React from 'react';
import './ScriptDisplay.css';

interface ScriptLine {
  character: string;
  text: string;
  isStageDirection: boolean;
  isContinued?: boolean;
}

const script: ScriptLine[] = [
  { character: "JOHN", text: "Good evening.", isStageDirection: false },
  { character: "OFFICER HUDSON", text: "Good evening, sir. License and registration, please?", isStageDirection: false },
  { character: "", text: "JOHN passes his documents out to the Officer.", isStageDirection: true },
  { character: "OFFICER HUDSON", text: "Have you been drinking, sir?", isStageDirection: false, isContinued: true },
  { character: "JOHN", text: "No? I mean- Not, like, drinking. I had wine with dinner. Out at dinner.", isStageDirection: false },
  { character: "OFFICER HUDSON", text: "Mhmm.", isStageDirection: false },
  { character: "", text: "OFFICER HUDSON is still yet to make eye contact. He starts writing a ticket in his citation book.", isStageDirection: true },
  { character: "JOHN", text: "Uh ... David- Dave Shaddick.", isStageDirection: false },
  { character: "", text: "Pause. The writing stops.", isStageDirection: true },
  { character: "JOHN", text: "Do you know him? You- the name, at least?", isStageDirection: false, isContinued: true },
  { character: "OFFICER HUDSON", text: "No, sir.", isStageDirection: false },
  { character: "JOHN", text: "I work for him. In the mayor's office. It's actually Dave's office. He's the mayor.", isStageDirection: false },
  { character: "OFFICER HUDSON", text: "Good for Dave.", isStageDirection: false },
  { character: "JOHN", text: "He's actually my father-in-law. Soon to be. My \"father-out-law\", we like to joke... And he's a good guy. Understanding. I think you'd like each other. (John gets bolder.) I was having dinner with him tonight at Weston's, and he- he told me to let him know I got home safe to his daughter. So he's going to, you know, call me up and ask me how my drive home was. I'm going to have to tell him all about it.", isStageDirection: false },
  { character: "", text: "Silence. A car drives past the traffic stop; OFFICER HUDSON looks down at JOHN's face for the first time.", isStageDirection: true },
  { character: "OFFICER HUDSON", text: "Are you gonna ask me? Are you gonna say it direct? Because if you want me to let you off, tonight, I want to hear you say it.", isStageDirection: false },
  { character: "JOHN", text: "I...", isStageDirection: false },
  { character: "", text: "JOHN sighs through his nose. OFFICER HUDSON hands back his license with a speeding ticket.", isStageDirection: true },
  { character: "OFFICER HUDSON", text: "That's what I thought. Slow down, okay?", isStageDirection: false },
  { character: "JOHN", text: "You know this is a speed trap you're sitting in? You shouldn't even be here.", isStageDirection: false },
  { character: "OFFICER HUDSON", text: "Maybe you can take it up with the Mayor's office. Goodnight, sir.", isStageDirection: false },
  { character: "", text: "JOHN takes the ticket and watches OFFICER HUDSON return to his car and drive away.", isStageDirection: true }
];

interface ScriptDisplayProps {
  currentLine: number;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ currentLine }) => {
  return (
    <div className="script-display">
      {script.map((line, index) => (
        <div 
          key={index}
          className={`script-line ${index === currentLine ? 'current' : ''} ${line.isStageDirection ? 'stage-direction' : ''}`}
        >
          {!line.isStageDirection && (
            <div className="character-name">
              {line.character}
              {line.isContinued && " (CONT'D)"}
            </div>
          )}
          <div className="line-text">
            {line.isStageDirection ? `(${line.text})` : line.text}
          </div>
        </div>
      ))}
    </div>
  );
}; 