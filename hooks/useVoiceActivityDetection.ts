import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceActivityOptions {
  threshold?: number;
  silenceTimeout?: number;
  minSpeechDuration?: number;
}

interface VoiceActivityResult {
  isListening: boolean;
  isSpeaking: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  audioStream: MediaStream | null;
}

export const useVoiceActivityDetection = (
  options: VoiceActivityOptions = {}
): VoiceActivityResult => {
  const {
    threshold = 0.01,
    silenceTimeout = 2000, // 2 seconds of silence before stopping
    minSpeechDuration = 500 // minimum 500ms of speech
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedVolume = average / 255;

    const currentTime = Date.now();
    const wasSpeaking = isSpeaking;

    if (normalizedVolume > threshold) {
      // Voice detected
      if (!wasSpeaking) {
        speechStartTimeRef.current = currentTime;
        setIsSpeaking(true);
      }
      
      // Clear silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else {
      // Silence detected
      if (wasSpeaking && !silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          const speechDuration = speechStartTimeRef.current 
            ? currentTime - speechStartTimeRef.current 
            : 0;
          
          // Only consider it as speech if it lasted long enough
          if (speechDuration >= minSpeechDuration) {
            setIsSpeaking(false);
            speechStartTimeRef.current = null;
          }
        }, silenceTimeout);
      }
    }

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(detectVoiceActivity);
    }
  }, [threshold, silenceTimeout, minSpeechDuration, isSpeaking, isListening]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setAudioStream(stream);

      // Create audio context for voice activity detection
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      setIsListening(true);
      detectVoiceActivity();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }, [detectVoiceActivity]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setIsSpeaking(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    microphoneRef.current = null;
    speechStartTimeRef.current = null;
  }, [audioStream]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    audioStream
  };
};