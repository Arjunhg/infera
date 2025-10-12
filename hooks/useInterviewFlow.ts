import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';
import { AssemblyAISpeechService } from '@/services/speechService';
import { MurfTextToSpeechService } from '@/services/textToSpeechService';
import { AIConversationService, type ConversationEntry, type InterviewQuestion } from '@/services/conversationService';

export interface InterviewState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isAISpeaking: boolean;
  currentTranscript: string;
  conversationHistory: ConversationEntry[];
  currentQuestion: InterviewQuestion | null;
  progress: { current: number; total: number; percentage: number };
  isComplete: boolean;
  error: string | null;
  selectedLanguage: string;
}

export interface UseInterviewFlowResult {
  state: InterviewState;
  actions: {
    startInterview: () => Promise<void>;
    endInterview: () => void;
    retryConnection: () => Promise<void>;
    setLanguage: (languageCode: string, voiceId: string) => void;
  };
}

export const useInterviewFlow = (
  interviewQuestions: InterviewQuestion[]
): UseInterviewFlowResult => {
  const [state, setState] = useState<InterviewState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isAISpeaking: false,
    currentTranscript: '',
    conversationHistory: [],
    currentQuestion: null,
    progress: { current: 0, total: interviewQuestions.length, percentage: 0 },
    isComplete: false,
    error: null,
    selectedLanguage: 'en'
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const speechServiceRef = useRef<AssemblyAISpeechService | null>(null);
  const ttsServiceRef = useRef<MurfTextToSpeechService | null>(null);
  const conversationServiceRef = useRef<AIConversationService | null>(null);
  const isProcessingRef = useRef(false);
  const lastSpeechEndTimeRef = useRef<number>(0);

  const voiceActivity = useVoiceActivityDetection({
    threshold: 0.01,
    silenceTimeout: 2000,
    minSpeechDuration: 800
  });

  // Initialize services
  useEffect(() => {
    if (interviewQuestions.length === 0) return;

    conversationServiceRef.current = new AIConversationService(interviewQuestions);
    
    setState(prev => ({
      ...prev,
      currentQuestion: interviewQuestions[0],
      progress: { current: 1, total: interviewQuestions.length, percentage: 0 }
    }));
  }, [interviewQuestions]);

  // Handle user speech detection
  const handleUserSpeechEnd = useCallback(async (transcript: string) => {
    if (!conversationServiceRef.current || isProcessingRef.current || !transcript.trim()) {
      return;
    }

    const now = Date.now();
    // Prevent processing if we just finished speaking (within 1 second)
    if (now - lastSpeechEndTimeRef.current < 1000) {
      return;
    }

    isProcessingRef.current = true;

    try {
      setState(prev => ({ ...prev, currentTranscript: '' }));

      const aiResponse = await conversationServiceRef.current.processUserResponse(transcript);
      const conversationHistory = conversationServiceRef.current.getConversationHistory();
      const progress = conversationServiceRef.current.getProgress();
      const currentQuestion = conversationServiceRef.current.getCurrentQuestion();
      const isComplete = conversationServiceRef.current.isInterviewComplete();

      setState(prev => ({
        ...prev,
        conversationHistory,
        progress,
        currentQuestion,
        isComplete
      }));

      // Speak AI response
      if (ttsServiceRef.current && aiResponse) {
        await ttsServiceRef.current.speak(aiResponse);
        lastSpeechEndTimeRef.current = Date.now();
      }

    } catch (error) {
      console.error('Error processing user response:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to process your response. Please try again.' 
      }));
      toast.error('Failed to process your response');
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Initialize speech services
  const initializeServices = useCallback(async () => {
    if (!audioRef.current) {
      throw new Error('Audio element not available');
    }

    try {
      // Initialize TTS service
      ttsServiceRef.current = new MurfTextToSpeechService(audioRef.current, {
        voiceId: 'en-US-terrell',
        language: 'en',
        onSpeechStart: () => {
          setState(prev => ({ ...prev, isAISpeaking: true }));
        },
        onSpeechEnd: () => {
          setState(prev => ({ ...prev, isAISpeaking: false }));
          lastSpeechEndTimeRef.current = Date.now();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          setState(prev => ({ ...prev, isAISpeaking: false }));
          toast.error('Voice synthesis error');
        }
      });

      // Initialize speech recognition service
      speechServiceRef.current = new AssemblyAISpeechService({
        onPartialTranscript: (text) => {
          setState(prev => ({ ...prev, currentTranscript: text }));
        },
        onFinalTranscript: handleUserSpeechEnd,
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Speech recognition error. Please check your microphone.' 
          }));
          toast.error('Speech recognition error');
        },
        onConnectionStateChange: (connected) => {
          setState(prev => ({ ...prev, isConnected: connected }));
        }
      });

      await speechServiceRef.current.initialize();

    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }, []); // handleUserSpeechEnd is stable with useCallback

  // Start voice activity monitoring
  useEffect(() => {
    if (voiceActivity.audioStream && speechServiceRef.current?.connected) {
      speechServiceRef.current.startRecording(voiceActivity.audioStream);
      setState(prev => ({ ...prev, isListening: true }));
    }
  }, [voiceActivity.audioStream, state.isConnected]);

  // Update speaking state
  useEffect(() => {
    setState(prev => ({ ...prev, isSpeaking: voiceActivity.isSpeaking }));
  }, [voiceActivity.isSpeaking]);

  // Start interview
  const startInterview = useCallback(async () => {
    if (!conversationServiceRef.current) {
      toast.error('Interview questions not loaded');
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));

      // Initialize services
      await initializeServices();

      // Start voice activity detection
      await voiceActivity.startListening();

      // Get and speak initial greeting
      const greeting = conversationServiceRef.current.getInitialGreeting();
      const conversationHistory = conversationServiceRef.current.getConversationHistory();
      
      setState(prev => ({ ...prev, conversationHistory }));

      if (ttsServiceRef.current) {
        await ttsServiceRef.current.speak(greeting);
        lastSpeechEndTimeRef.current = Date.now();
      }

      toast.success('Interview started! Speak naturally when I finish talking.');

    } catch (error) {
      console.error('Failed to start interview:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start interview. Please check your microphone and try again.' 
      }));
      toast.error('Failed to start interview');
    }
  }, [initializeServices, voiceActivity]);

  // End interview
  const endInterview = useCallback(() => {
    // Stop all services
    voiceActivity.stopListening();
    speechServiceRef.current?.disconnect();
    ttsServiceRef.current?.stop();

    setState(prev => ({
      ...prev,
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isAISpeaking: false,
      currentTranscript: ''
    }));

    isProcessingRef.current = false;
    toast.success('Interview ended');
  }, []); // Remove voiceActivity dependency to prevent loops

  // Retry connection
  const retryConnection = useCallback(async () => {
    // Stop all services manually to avoid dependency issues
    voiceActivity.stopListening();
    speechServiceRef.current?.disconnect();
    ttsServiceRef.current?.stop();

    setState(prev => ({
      ...prev,
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isAISpeaking: false,
      currentTranscript: ''
    }));

    isProcessingRef.current = false;
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await startInterview();
  }, [startInterview, voiceActivity]); // Keep necessary dependencies

  // Set language
  const setLanguage = useCallback((languageCode: string, voiceId: string) => {
    setState(prev => ({ ...prev, selectedLanguage: languageCode }));
    if (ttsServiceRef.current) {
      ttsServiceRef.current.setLanguage(languageCode, voiceId);
    }
  }, []);

  // Cleanup on unmount - use ref to avoid dependency issues
  useEffect(() => {
    const cleanup = () => {
      voiceActivity.stopListening();
      speechServiceRef.current?.disconnect();
      ttsServiceRef.current?.stop();
      isProcessingRef.current = false;
    };

    return cleanup;
  }, []); // Empty dependency array for cleanup

  // Create audio element if not exists
  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.preload = 'auto';
      audioRef.current = audio;
    }
  }, []);

  return {
    state,
    actions: {
      startInterview,
      endInterview,
      retryConnection,
      setLanguage
    }
  };
};