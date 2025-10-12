
export interface SpeechToTextOptions {
  sampleRate?: number;
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (connected: boolean) => void;
}

export class AssemblyAISpeechService {
  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isConnected = false;
  private options: SpeechToTextOptions;
  private audioStream: MediaStream | null = null;

  constructor(options: SpeechToTextOptions = {}) {
    this.options = {
      sampleRate: 16000,
      ...options
    };
  }

  async initialize(): Promise<void> {
    try {
      // Get temporary token from our API route
      const response = await fetch('/api/assemblyai-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AssemblyAI token: ${response.status}`);
      }

      const { token } = await response.json();
      console.log('Got AssemblyAI token, connecting to Universal-Streaming v3...');

      // Updated endpoint URL for Universal-Streaming v3
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&encoding=pcm_s16le&token=${token}`;
      console.log('Attempting AssemblyAI v3 connection to:', wsUrl);

      this.socket = new WebSocket(wsUrl);
      this.socket.binaryType = 'arraybuffer'; // CRITICAL: Set binary type for PCM data

      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error('Failed to create WebSocket'));

        this.socket.onopen = () => {
          console.log('✅ AssemblyAI v3 WebSocket connected');
          this.isConnected = true;
          this.options.onConnectionStateChange?.(true);
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('AssemblyAI v3 message:', data);

            // Handle Universal-Streaming v3 message types
            if (data.type === 'Begin') {
              console.log(`Session began: ID=${data.id}`);
            } else if (data.type === 'Turn') {
              const transcript = data.transcript || '';
              if (transcript.trim()) {
                if (data.end_of_turn) {
                  console.log('Final transcript:', transcript.trim());
                  this.options.onFinalTranscript?.(transcript.trim());
                } else {
                  console.log('Partial transcript:', transcript.trim());
                  this.options.onPartialTranscript?.(transcript.trim());
                }
              }
            } else if (data.type === 'Error') {
              console.error('AssemblyAI error:', data);
              this.options.onError?.(new Error(data.error || 'AssemblyAI error'));
            }
          } catch (error) {
            console.error('Error parsing AssemblyAI v3 message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('❌ AssemblyAI v3 WebSocket error:', error);
          this.options.onError?.(new Error('WebSocket connection error'));
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log(`AssemblyAI v3 WebSocket closed: ${event.code} - ${event.reason}`);
          this.isConnected = false;
          this.options.onConnectionStateChange?.(false);
        };
      });

    } catch (error) {
      console.error('Failed to initialize AssemblyAI v3:', error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  async startRecording(audioStream: MediaStream): Promise<void> {
    if (!this.isConnected || !this.socket) {
      throw new Error('AssemblyAI not connected');
    }

    this.audioStream = audioStream;
    
    try {
      // Create AudioContext with 16kHz sample rate (AssemblyAI requirement)
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      
      // Create audio source from microphone stream
      this.sourceNode = this.audioContext.createMediaStreamSource(audioStream);
      
      // Create script processor for real-time audio processing
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processorNode.onaudioprocess = (event) => {
        // Guard against disconnected socket or stopped recording
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          return;
        }

        try {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Convert Float32Array to Int16Array (PCM 16-bit little-endian)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // Clamp the sample to [-1, 1] and convert to 16-bit integer
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          }
          
          // Send raw PCM data to AssemblyAI (no JSON wrapper needed for binary data)
          this.socket.send(pcmData.buffer);
          
        } catch (error) {
          console.error('Error processing audio chunk:', error);
          // Stop recording on persistent errors to prevent spam
          this.stopRecording();
          this.options.onError?.(error as Error);
        }
      };

      // Connect the audio pipeline: source -> processor -> destination
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);
      
      console.log('🎤 Started recording for AssemblyAI v3 (real-time PCM streaming)');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  stopRecording(): void {
    console.log('🛑 Stopping recording...');
    
    // Disconnect audio processing pipeline
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('🛑 Stopped recording');
  }

  disconnect(): void {
    console.log('🔌 Disconnecting AssemblyAI service...');
    
    this.stopRecording();
    
    if (this.socket) {
      try {
        // Send termination message for v3 (if still connected)
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'Terminate' }));
        }
        this.socket.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.socket = null;
    }

    this.isConnected = false;
    this.options.onConnectionStateChange?.(false);
  }

  get connected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }
}
