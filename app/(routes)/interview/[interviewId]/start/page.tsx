'use client'
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { InterviewData } from '@/types/Types';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { PhoneCall, PhoneOff, User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useInterviewFlow } from '@/hooks/useInterviewFlow';

const ContinuousInterview = () => {
  const { interviewId } = useParams();
  const convex = useConvex();
  const router = useRouter();

  const [interviewData, setInterviewData] = useState<InterviewData>();
  const [isLoading, setIsLoading] = useState(true);

  const updateFeedback = useMutation(api.Interview.UpdateFeedback);

  // Initialize interview flow with questions
  const { state, actions } = useInterviewFlow(interviewData?.interviewQuestions || []);

  // Get interview data
  const getInterviewQuestions = async () => {
    if (!interviewId || Array.isArray(interviewId)) {
      toast.error("Invalid interview ID");
      throw new Error("Invalid interview ID");
    }
    
    try {
      const result = await convex.query(api.Interview.GetInterviewQuestions, { 
        interviewRecordId: interviewId as Id<"InterviewSessionTable"> 
      });

      if (result) {
        // Cast to proper type based on whether resumeUrl exists
        if (result.resumeUrl) {
          const resumeInterview: InterviewData = {
            ...result,
            type: 'resume',
            resumeUrl: result.resumeUrl
          };
          setInterviewData(resumeInterview);
        } else {
          const manualInterview: InterviewData = {
            ...result,
            type: 'manual'
          };
          setInterviewData(manualInterview);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle interview completion
  const finishInterview = async () => {
    try {
      actions.endInterview();
      toast.warning('Generating feedback...');

      // Generate feedback using the interview feedback API
      const feedbackResponse = await axios.post('/api/interview-feedback', {
        conversation: state.conversationHistory,
        interviewQuestions: interviewData?.interviewQuestions
      });

      console.log("Feedback Response:", feedbackResponse);
      console.log("Feedback response data: ", feedbackResponse.data);

      // Update feedback in database - n8n returns the feedback object directly
      await updateFeedback({
        recordId: interviewId as Id<"InterviewSessionTable">,
        feedback: feedbackResponse.data
      });

      toast.success('Interview completed successfully!');
      router.push(`/dashboard`);
    } catch (error) {
      console.error('Error finishing interview:', error);
      toast.error('Failed to generate feedback');
    }
  };

  // Auto-finish when interview is complete
  useEffect(() => {
    if (state.isComplete && state.conversationHistory.length > 0) {
      // Wait a bit before finishing to let final AI response play
      setTimeout(() => {
        finishInterview();
      }, 5000);
    }
  }, [state.isComplete]);

  useEffect(() => {
    getInterviewQuestions();
  }, [interviewId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (!interviewData?.interviewQuestions?.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">No interview questions available</p>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h1 className="text-2xl font-bold">AI Interview Session</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="opacity-90">
                Question {state.progress.current} of {state.progress.total}
              </p>
              <div className="flex items-center space-x-4">
                {state.isConnected && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                )}
                <div className="text-sm font-medium">
                  {state.progress.percentage}% Complete
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2 mt-3">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${state.progress.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left side - AI Avatar area */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <Bot className={`w-24 h-24 mx-auto mb-4 transition-colors duration-300 ${
                      state.isAISpeaking ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    {state.isAISpeaking && (
                      <div className="absolute inset-0 w-24 h-24 mx-auto">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    AI Interviewer
                  </h3>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    {state.isAISpeaking && (
                      <p className="text-green-600 font-medium">🗣️ Speaking...</p>
                    )}
                    {state.isListening && !state.isAISpeaking && (
                      <p className="text-blue-600 font-medium">👂 Listening...</p>
                    )}
                    {state.isSpeaking && (
                      <p className="text-orange-600 font-medium">🎤 You're speaking...</p>
                    )}
                    {!state.isConnected && !state.isComplete && (
                      <p className="text-gray-400">Ready to connect</p>
                    )}
                    {state.isComplete && (
                      <p className="text-green-600 font-medium">✅ Interview Complete</p>
                    )}
                  </div>

                  {state.error && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">{state.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!state.isConnected ? (
                  <Button 
                    onClick={actions.startInterview}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                    disabled={!interviewData?.interviewQuestions?.length}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Start Interview
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={actions.retryConnection}
                      variant="outline"
                      size="lg"
                      disabled={state.isAISpeaking}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Retry Connection
                    </Button>
                    
                    <Button
                      onClick={finishInterview}
                      variant="destructive"
                      size="lg"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      End Interview
                    </Button>
                  </>
                )}
              </div>

              {/* Voice Activity Indicator */}
              {state.isListening && (
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-700 mb-2">
                    🎙️ Speak naturally - I'm listening!
                  </p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-8 bg-blue-400 rounded animate-pulse ${
                          state.isSpeaking ? 'bg-orange-400' : ''
                        }`}
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Conversation log */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 h-[450px] overflow-y-auto">
                <h3 className="font-semibold mb-4 text-gray-800">Live Conversation</h3>
                
                {/* Current transcript */}
                {state.currentTranscript && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-700 font-medium mb-1">You're saying:</p>
                    <p className="text-blue-800">{state.currentTranscript}</p>
                  </div>
                )}

                {/* Conversation history */}
                <div className="space-y-3">
                  {state.conversationHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Start the interview to begin our conversation</p>
                    </div>
                  ) : (
                    state.conversationHistory.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg transition-all duration-300 ${
                          entry.role === 'user'
                            ? 'bg-green-50 border-l-4 border-green-500 ml-4'
                            : 'bg-gray-100 border-l-4 border-gray-500 mr-4'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {entry.role === 'user' ? (
                            <User className="w-4 h-4 text-green-600" />
                          ) : (
                            <Bot className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-xs font-medium capitalize text-gray-600">
                            {entry.role === 'user' ? 'You' : 'AI Interviewer'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {entry.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Current question display */}
              {state.currentQuestion && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    Current Question:
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {state.currentQuestion.question}
                  </p>
                </div>
              )}

              {/* Instructions */}
              {state.isListening && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700">
                    💡 <strong>Tip:</strong> Speak naturally and wait for the AI to finish before responding. 
                    The system automatically detects when you start and stop speaking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinuousInterview;