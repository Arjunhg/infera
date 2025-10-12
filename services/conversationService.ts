
export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface ConversationState {
  currentQuestionIndex: number;
  conversationHistory: ConversationEntry[];
  isComplete: boolean;
  isWaitingForResponse: boolean;
}

export class AIConversationService {
  private state: ConversationState = {
    currentQuestionIndex: 0,
    conversationHistory: [],
    isComplete: false,
    isWaitingForResponse: false
  };
  private interviewQuestions: InterviewQuestion[] = [];

  constructor(interviewQuestions: InterviewQuestion[]) {
    this.interviewQuestions = interviewQuestions;
  }

  getInitialGreeting(): string {
    if (this.interviewQuestions.length === 0) {
      return "Hello! Welcome to your interview. Unfortunately, I don't have any questions prepared. Please contact support.";
    }

    const greeting = `Hello! Welcome to your technical interview with infera. I'm your AI interviewer, and I'm excited to learn more about you today.

I'll be conducting a structured interview with ${this.interviewQuestions.length} questions to better understand your background and expertise. We'll have a natural conversation, so feel free to elaborate on your answers and ask for clarification if needed.

Let's start with our first question: ${this.interviewQuestions[0].question}`;

    this.addToHistory('assistant', greeting);
    this.state.isWaitingForResponse = true;
    return greeting;
  }

  async processUserResponse(userText: string): Promise<string> {
    if (!this.state.isWaitingForResponse) {
      return "I'm sorry, I wasn't expecting a response right now. Please wait for my next question.";
    }

    // Add user response to history
    this.addToHistory('user', userText);
    this.state.isWaitingForResponse = false;

    // Generate contextually aware response
    const aiResponse = this.generateEnhancedContextualResponse(userText);
    this.addToHistory('assistant', aiResponse);
    
    return aiResponse;
  }

  private generateEnhancedContextualResponse(userText: string): string {
    const currentQuestion = this.interviewQuestions[this.state.currentQuestionIndex];
    const isLastQuestion = this.state.currentQuestionIndex >= this.interviewQuestions.length - 1;
    
    // Get conversation history for context
    const recentHistory = this.state.conversationHistory.slice(-6); // Last 3 Q&A pairs
    const allUserResponses = this.state.conversationHistory
      .filter(entry => entry.role === 'user')
      .map(entry => entry.content.toLowerCase());

    // Analyze the user's current response
    const lowerText = userText.toLowerCase().trim();
    const wordCount = userText.split(/\s+/).length;
    
    // Detect response patterns
    const responseAnalysis = this.analyzeUserResponse(lowerText, wordCount, allUserResponses);
    
    // Generate contextually appropriate acknowledgment
    let response = this.generateAcknowledgment(responseAnalysis, currentQuestion);
    
    // Add follow-up comments based on conversation history
    const followUp = this.generateHistoryBasedFollowUp(responseAnalysis, recentHistory, allUserResponses);
    if (followUp) {
      response += ` ${followUp}`;
    }

    // Handle question progression
    if (isLastQuestion) {
      this.state.isComplete = true;
      response += this.generateInterviewConclusion(allUserResponses);
    } else {
      this.state.currentQuestionIndex++;
      const nextQuestion = this.interviewQuestions[this.state.currentQuestionIndex];
      const transition = this.generateQuestionTransition(responseAnalysis, nextQuestion);
      response += `\n\n${transition}`;
      this.state.isWaitingForResponse = true;
    }

    return response;
  }

  private analyzeUserResponse(lowerText: string, wordCount: number, previousResponses: string[]) {
    return {
      // Response quality indicators
      isUnknown: lowerText.includes("don't know") || lowerText.includes("not sure") || 
                lowerText.includes("no idea") || lowerText === "i don't know",
      isBrief: wordCount <= 5,
      isShort: wordCount <= 15,
      isMedium: wordCount > 15 && wordCount <= 50,
      isDetailed: wordCount > 50,
      isVeryDetailed: wordCount > 100,
      
      // Content indicators
      hasExample: lowerText.includes("example") || lowerText.includes("for instance") || 
                 lowerText.includes("once") || lowerText.includes("when i"),
      hasExperience: lowerText.includes("experience") || lowerText.includes("worked") || 
                    lowerText.includes("used") || lowerText.includes("project"),
      hasTechnicalTerms: lowerText.includes("algorithm") || lowerText.includes("framework") || 
                        lowerText.includes("database") || lowerText.includes("api") ||
                        lowerText.includes("javascript") || lowerText.includes("node") ||
                        lowerText.includes("react") || lowerText.includes("python"),
      isOpinion: lowerText.includes("think") || lowerText.includes("believe") || 
                lowerText.includes("prefer") || lowerText.includes("in my opinion"),
      showsConfidence: lowerText.includes("confident") || lowerText.includes("sure") || 
                      lowerText.includes("definitely") || lowerText.includes("absolutely"),
      showsUncertainty: lowerText.includes("maybe") || lowerText.includes("probably") || 
                       lowerText.includes("might") || lowerText.includes("could be"),
      
      // Comparative analysis
      improvedFromPrevious: this.hasImprovedFromPrevious(lowerText, previousResponses),
      consistentQuality: this.hasConsistentQuality(wordCount, previousResponses),
      
      // Raw data
      wordCount,
      originalText: lowerText
    };
  }

  private hasImprovedFromPrevious(currentResponse: string, previousResponses: string[]): boolean {
    if (previousResponses.length < 2) return false;
    
    const lastResponse = previousResponses[previousResponses.length - 1];
    const currentWordCount = currentResponse.split(/\s+/).length;
    const lastWordCount = lastResponse.split(/\s+/).length;
    
    // Consider improved if current response is more detailed than previous
    return currentWordCount > lastWordCount * 1.2;
  }

  private hasConsistentQuality(currentWordCount: number, previousResponses: string[]): boolean {
    if (previousResponses.length < 2) return true;
    
    const avgPreviousLength = previousResponses.reduce((sum, response) => 
      sum + response.split(/\s+/).length, 0) / previousResponses.length;
    
    // Consider consistent if within 50% of average
    return Math.abs(currentWordCount - avgPreviousLength) < avgPreviousLength * 0.5;
  }

  private generateAcknowledgment(analysis: any, currentQuestion: InterviewQuestion): string {
    // Handle "don't know" responses with empathy
    if (analysis.isUnknown) {
      const unknownResponses = [
        "That's perfectly okay. Not every candidate will have experience with every topic, and honesty is valuable.",
        "I appreciate your honesty. It's better to be upfront than to guess.",
        "No worries at all. This question can be challenging, and it's fine if you haven't encountered this before.",
        "Thank you for being honest. Not knowing something doesn't reflect poorly on your abilities."
      ];
      return unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
    }

    // Handle very brief responses
    if (analysis.isBrief) {
      return "Thank you for your response. I'd love to hear more, but let's continue.";
    }

    // Handle short responses
    if (analysis.isShort) {
      if (analysis.hasExperience) {
        return "I can see you have some experience with this. Thanks for sharing.";
      }
      return "Thank you for your response.";
    }

    // Handle medium responses
    if (analysis.isMedium) {
      if (analysis.hasExample) {
        return "I appreciate you providing that specific example. It gives good insight into your experience.";
      }
      if (analysis.hasTechnicalTerms) {
        return "Good technical insight. I can see you understand the concepts well.";
      }
      if (analysis.isOpinion) {
        return "That's an interesting perspective. I appreciate you sharing your thoughts.";
      }
      return "That's a solid response. Thank you for explaining your approach.";
    }

    // Handle detailed responses
    if (analysis.isDetailed) {
      const detailedResponses = [
        "Excellent detailed explanation. I can see you have strong knowledge in this area.",
        "Thank you for that comprehensive response. Your experience really shows.",
        "That's a very thorough answer. I appreciate the depth of detail you provided.",
        "Great explanation with good examples. This demonstrates solid understanding."
      ];

      if (analysis.hasExample && analysis.hasTechnicalTerms) {
        return "Outstanding response! The combination of technical knowledge and practical examples is exactly what we're looking for.";
      }
      if (analysis.hasExample) {
        return "Excellent answer with concrete examples. This really helps me understand your experience.";
      }
      if (analysis.hasTechnicalTerms) {
        return "Great technical depth in your response. I can see you have solid expertise in this area.";
      }

      return detailedResponses[Math.floor(Math.random() * detailedResponses.length)];
    }

    // Handle very detailed responses
    if (analysis.isVeryDetailed) {
      return "Fantastic comprehensive answer! The level of detail and insight you've provided is impressive. I can clearly see your expertise and experience.";
    }

    // Default fallback
    return "Thank you for your response.";
  }

  private generateHistoryBasedFollowUp(analysis: any, recentHistory: ConversationEntry[], allUserResponses: string[]): string | null {
    // Don't add follow-ups for unknown responses
    if (analysis.isUnknown) return null;

    // Improvement recognition
    if (analysis.improvedFromPrevious) {
      return "I notice you're providing more detailed responses as we go along, which is great to see.";
    }

    // Consistency recognition
    if (allUserResponses.length >= 3 && analysis.consistentQuality) {
      if (analysis.isDetailed || analysis.isVeryDetailed) {
        return "You're consistently providing thoughtful, detailed responses throughout our conversation.";
      }
    }

    // Technical expertise pattern
    const technicalCount = allUserResponses.filter(response => 
      response.includes("algorithm") || response.includes("framework") || 
      response.includes("database") || response.includes("api")).length;
    
    if (technicalCount >= 2 && analysis.hasTechnicalTerms) {
      return "I'm seeing a strong technical foundation across multiple areas.";
    }

    // Example pattern
    const exampleCount = allUserResponses.filter(response => 
      response.includes("example") || response.includes("project") || 
      response.includes("experience")).length;
    
    if (exampleCount >= 2 && analysis.hasExample) {
      return "I appreciate how you consistently back up your answers with practical examples.";
    }

    return null;
  }

  private generateQuestionTransition(analysis: any, nextQuestion: InterviewQuestion): string {
    if (analysis.isUnknown) {
      return `Let's move on to our next question: ${nextQuestion.question}`;
    }

    const transitions = [
      `Perfect. Here's my next question: ${nextQuestion.question}`,
      `Great. Let's continue with: ${nextQuestion.question}`,
      `Moving on to our next topic: ${nextQuestion.question}`,
      `Let's explore another area: ${nextQuestion.question}`
    ];

    if (analysis.isDetailed || analysis.isVeryDetailed) {
      const detailedTransitions = [
        `Excellent. Building on that expertise, let me ask: ${nextQuestion.question}`,
        `Great depth there. Now I'd like to explore: ${nextQuestion.question}`,
        `Perfect explanation. Let's shift focus to: ${nextQuestion.question}`
      ];
      return detailedTransitions[Math.floor(Math.random() * detailedTransitions.length)];
    }

    return transitions[Math.floor(Math.random() * transitions.length)];
  }

  private generateInterviewConclusion(allUserResponses: string[]): string {
    const totalResponses = allUserResponses.length;
    const detailedResponses = allUserResponses.filter(response => 
      response.split(/\s+/).length > 30).length;
    const technicalResponses = allUserResponses.filter(response => 
      response.includes("algorithm") || response.includes("framework") || 
      response.includes("database") || response.includes("api") ||
      response.includes("javascript") || response.includes("node")).length;
    
    let conclusion = "\n\nThat concludes our interview questions.";
    
    // Personalized conclusion based on overall performance
    if (detailedResponses / totalResponses > 0.6) {
      conclusion += " Thank you for providing such detailed and thoughtful responses throughout our conversation.";
    } else if (technicalResponses >= 2) {
      conclusion += " I appreciate the technical insights you've shared today.";
    } else {
      conclusion += " Thank you for your time and honest responses today.";
    }
    
    conclusion += " Do you have any questions about the role or our team before we wrap up?";
    
    return conclusion;
  }

  private addToHistory(role: 'user' | 'assistant', content: string): void {
    this.state.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }

  // Public methods (keep existing interface)
  getCurrentQuestion(): InterviewQuestion | null {
    if (this.state.currentQuestionIndex < this.interviewQuestions.length) {
      return this.interviewQuestions[this.state.currentQuestionIndex];
    }
    return null;
  }

  getState(): ConversationState {
    return { ...this.state };
  }

  getConversationHistory(): ConversationEntry[] {
    return [...this.state.conversationHistory];
  }

  isInterviewComplete(): boolean {
    return this.state.isComplete;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    const current = Math.min(this.state.currentQuestionIndex + 1, this.interviewQuestions.length);
    const total = this.interviewQuestions.length;
    const percentage = Math.round((current / total) * 100);
    return { current, total, percentage };
  }

  reset(): void {
    this.state = {
      currentQuestionIndex: 0,
      conversationHistory: [],
      isComplete: false,
      isWaitingForResponse: false
    };
  }
}
