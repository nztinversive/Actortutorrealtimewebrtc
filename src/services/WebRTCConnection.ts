interface EventCallback {
  onCharacterAssigned?: (character: string) => void;
  onLineComplete?: () => void;
  onError?: (error: Error) => void;
  onTurnStart?: () => void;
  onTurnEnd?: () => void;
  onWaitingForUser?: () => void;
}

export class WebRTCConnection {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private token: string;
  private callbacks: EventCallback = {};
  private isAISpeaking: boolean = false;
  private localStream: MediaStream | null = null;
  private waitingForUser: boolean = false;

  constructor(token: string) {
    this.token = token;
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;
  }

  setCallbacks(callbacks: EventCallback) {
    this.callbacks = callbacks;
  }

  async connect() {
    try {
      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up audio handling
      this.pc.ontrack = (e) => {
        if (this.audioElement) {
          this.audioElement.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: {
            ideal: true
          },
          noiseSuppression: {
            ideal: true
          },
          autoGainControl: {
            ideal: true
          },
          channelCount: {
            ideal: 1
          },
          sampleRate: {
            ideal: 16000
          },
          sampleSize: {
            ideal: 16
          }
        } 
      });
      
      this.localStream.getTracks().forEach(track => {
        const audioTrack = track as MediaStreamTrack;
        const constraints = audioTrack.getConstraints();
        audioTrack.applyConstraints({
          ...constraints,
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true
        });
        track.enabled = false; // Start with microphone off
        this.pc?.addTrack(track, this.localStream!);
      });

      // Create data channel
      this.dc = this.pc.createDataChannel('oai-events');
      this.setupDataChannel();

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Get remote description from server
      const response = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.statusText}`);
      }

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await response.text()
      };

      await this.pc.setRemoteDescription(answer);

      // Send initial message after connection is established
      setTimeout(() => {
        if (this.dc?.readyState === 'open') {
          console.log('Sending initial message');
          this.sendMessage({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{
                type: "input_text",
                text: "We will be reading the traffic stop script shown on screen. The script has two characters: JOHN and OFFICER HUDSON. Who would you like to read as?"
              }]
            }
          });
          this.waitingForUser = true;
          this.callbacks.onWaitingForUser?.();
        }
      }, 1000);

    } catch (error) {
      console.error('WebRTC connection failed:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  private setupDataChannel() {
    if (!this.dc) return;

    this.dc.onopen = () => {
      console.log('Data channel opened');
    };

    this.dc.onmessage = (e) => {
      const event = JSON.parse(e.data);
      this.handleServerEvent(event);
    };

    this.dc.onerror = (error) => {
      console.error('Data channel error:', error);
      this.callbacks.onError?.(error as Error);
    };

    this.dc.onclose = () => {
      console.log('Data channel closed');
    };
  }

  private handleServerEvent(event: any) {
    switch (event.type) {
      case 'session.created':
        console.log('Session created:', event);
        break;

      case 'response.text.delta':
        this.handleTextDelta(event);
        break;

      case 'response.audio.started':
        console.log('AI started speaking');
        this.isAISpeaking = true;
        this.waitingForUser = false;
        this.callbacks.onTurnStart?.();
        break;

      case 'response.audio.done':
        console.log('AI finished speaking');
        this.isAISpeaking = false;
        this.callbacks.onTurnEnd?.();
        
        // If the AI says it's waiting for the user to start
        if (this.waitingForUser) {
          this.callbacks.onWaitingForUser?.();
        } else {
          this.callbacks.onLineComplete?.();
          
          // If AI just finished a line and it's not waiting for user, prompt for next line
          if (!this.waitingForUser) {
            setTimeout(() => {
              this.sendMessage({
                type: "conversation.item.create",
                item: {
                  type: "message",
                  role: "user",
                  content: [{
                    type: "input_text",
                    text: "Continue with your next line exactly as shown in the script."
                  }]
                }
              });
            }, 500);
          }
        }
        break;

      case 'input_audio_buffer.speech_started':
        if (!this.isAISpeaking) {
          console.log('User started speaking');
          this.callbacks.onTurnStart?.();
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        this.callbacks.onTurnEnd?.();
        break;

      case 'response.done':
        console.log('Response complete:', event);
        break;

      default:
        console.log('Received event:', event);
    }
  }

  private handleTextDelta(event: any) {
    const text = event.delta?.text;
    if (!text) return;

    console.log('Text delta:', text);

    // Check for character assignment
    if (text.toLowerCase().includes("who are you reading as")) {
      this.waitingForUser = true;
      this.callbacks.onWaitingForUser?.();
    }
    else if (text.toLowerCase().includes("i'll be reading as") || text.toLowerCase().includes("i will be reading as")) {
      const match = text.match(/(?:i'll|i will) be reading as (\w+)/i);
      if (match && match[1]) {
        console.log('Character assigned:', match[1]);
        this.callbacks.onCharacterAssigned?.(match[1]);
      }

      // If AI has the first line, they'll start speaking
      if (text.toLowerCase().includes("i have the first line")) {
        console.log('AI has first line, starting...');
        this.waitingForUser = false;
        this.isAISpeaking = true;
        this.callbacks.onTurnStart?.();

        // Send a message to trigger the AI to start its first line
        setTimeout(() => {
          this.sendMessage({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{
                type: "input_text",
                text: "Please start with your first line exactly as shown in the script."
              }]
            }
          });
        }, 500);
      }
    }

    // Check if AI is waiting for user to start
    if (text.toLowerCase().includes("you have the first line") || 
        text.toLowerCase().includes("please start whenever you're ready")) {
      console.log('Waiting for user to start...');
      this.waitingForUser = true;
      this.callbacks.onWaitingForUser?.();
    }

    // Check for special commands responses
    if (text.toLowerCase().includes("reading stopped")) {
      console.log('Reading stopped');
      this.waitingForUser = false;
      this.isAISpeaking = false;
    }
  }

  async sendMessage(message: any) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    console.log('Sending message:', message);
    this.dc.send(JSON.stringify(message));
  }

  enableMicrophone(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  disconnect() {
    this.enableMicrophone(false);
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.dc?.close();
    this.pc?.close();
    this.audioElement?.remove();
  }
} 