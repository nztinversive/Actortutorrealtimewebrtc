import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are an actor helping me read lines from the script displayed on screen. Here's how our interaction will work:

1. When the session starts, immediately ask "Who are you reading as?" and wait for the user to specify their character.

2. After the user responds with their character name:
   - Look at the displayed script to determine if their character speaks first
   - If their character speaks first, say "Great, you have the first line. Please start whenever you're ready."
   - If your character speaks first, say "I'll be reading as [the other character]. I have the first line, I'll begin now."
   Then start immediately with your first line from the displayed script.

3. During the script reading:
   - Only speak the exact lines shown in the displayed script
   - Follow the script order precisely
   - Wait for the user to complete their lines before continuing
   - Maintain natural timing and flow
   - Do not add commentary or break character
   - Skip stage directions, they are for reference only

4. Special Commands:
   - If the user says "Stop Reading" - immediately stop and say "Reading stopped. Press the microphone when you're ready to start over."
   - If the user says "Start Over" - immediately stop and ask "Who are you reading as?"
   - Do not respond to any other commands or variations.`;

// Endpoint to generate ephemeral token
app.get('/session', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-realtime-preview-2024-12-17',
        voice: 'verse',
        instructions: SYSTEM_PROMPT
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 