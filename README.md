# 🎯 Infera - AI-Powered Interview Practice Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://infera-amber.vercel.app/)
[![Watch Demo](https://img.shields.io/badge/YouTube-Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/QvwlU2qT7xc)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Master job interviews with AI-powered automation that mirrors real recruiters**

[Live Demo](https://infera-amber.vercel.app/) • [Video Demo](https://youtu.be/QvwlU2qT7xc) • [Report Bug](https://github.com/Arjunhg/infera/issues)

</div>

---

## 📖 Overview

Infera is an intelligent interview preparation platform that conducts realistic AI-powered mock interviews. It analyzes your resume or job description to generate personalized interview questions, conducts natural voice conversations, and provides detailed feedback to help you ace your next interview.

### ✨ Key Features

- **🎤 Real-time Voice Interviews** - Natural conversation with AI using speech-to-text and text-to-speech
- **📄 Resume Analysis** - Upload your resume for personalized interview questions
- **💼 Custom Job Descriptions** - Generate questions based on specific job requirements
- **🌍 Multi-language Support** - Conduct interviews in English and Hindi (with more languages coming)
- **🤖 Intelligent AI Responses** - Context-aware conversation that adapts to your answers
- **📊 Detailed Feedback** - Get comprehensive performance analysis and improvement suggestions
- **🔒 Secure Authentication** - User management with Clerk
- **⚡ Rate Limiting** - Fair usage with Arcjet token bucket implementation

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Motion** - Smooth animations
- **shadcn/ui** - Beautiful UI components

### Backend & Services
- **Convex** - Real-time database and backend
- **n8n** - Workflow automation for AI processing
- **Murf AI** - Text-to-speech and translation
- **AssemblyAI** - Real-time speech-to-text (Universal-Streaming v3)
- **ImageKit** - Resume file storage
- **Clerk** - Authentication and user management
- **Arcjet** - Rate limiting and security

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or pnpm package manager
- API keys for required services (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arjunhg/infera.git
   cd infera
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Convex Database
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   
   # Murf AI (TTS & Translation)
   MURF_API_KEY=your_murf_api_key
   
   # AssemblyAI (Speech-to-Text)
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   
   # ImageKit (File Storage)
   IMAGEKIT_URL_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_URL_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
   
   # n8n Webhooks
   N8N_URL_ENDPOINT=your_n8n_interview_webhook
   N8N_FEEDBACK_URL=your_n8n_feedback_webhook
   
   # Arcjet (Rate Limiting)
   ARCJET_KEY=your_arcjet_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 How It Works

### 1. **Create Interview Session**
Choose between two modes:
- **Resume Upload**: Upload your PDF resume for AI-analyzed personalized questions
- **Manual Entry**: Enter job title and description for role-specific questions

### 2. **AI Question Generation**
- Resume is uploaded to ImageKit and analyzed via n8n workflow
- AI generates contextual interview questions based on your profile
- Questions are stored in Convex database

### 3. **Live Interview**
- **Speech Recognition**: AssemblyAI captures your voice in real-time
- **AI Conversation**: Intelligent responses that adapt to your answers
- **Text-to-Speech**: Murf AI speaks questions in natural voice
- **Multi-language**: Switch between English and Hindi

### 4. **Feedback & Analysis**
- Conversation history is analyzed via n8n workflow
- Detailed feedback on performance, strengths, and areas for improvement
- Rating and actionable suggestions provided

---

## 🌟 Core Features Explained

### Voice Activity Detection
Smart detection of when you start and stop speaking, with configurable silence timeout to ensure smooth conversation flow.

### Contextual AI Responses
The AI interviewer:
- Acknowledges answer quality (brief, detailed, technical depth)
- Recognizes examples and practical experience
- Provides encouraging feedback
- Adapts follow-up questions based on your responses

### Language Support
- **English** (en-US) - Default voice: Terrell
- Automatic translation of AI responses
- Easy to add more languages via configuration

### Rate Limiting
Arcjet token bucket implementation:
- 5 tokens refilled every 5 seconds
- Maximum capacity of 10 tokens
- Prevents API abuse and ensures fair usage

---

## 📁 Project Structure

```
infera/
├── app/
│   ├── (routes)/
│   │   ├── dashboard/          # User dashboard
│   │   └── interview/          # Interview session pages
│   ├── api/                    # API routes
│   │   ├── assemblyai-stream/  # Speech-to-text streaming
│   │   ├── murf-tts/          # Text-to-speech
│   │   ├── murf-translate/    # Translation service
│   │   ├── generate-interview-question/
│   │   └── interview-feedback/
│   └── _components/           # Landing page components
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── LanguageSelector.tsx   # Language selection UI
├── convex/                    # Convex backend
│   └── schema.ts             # Database schema
├── hooks/
│   ├── useInterviewFlow.ts   # Main interview logic
│   └── useVoiceActivityDetection.ts
├── services/
│   ├── conversationService.ts # AI conversation logic
│   ├── speechService.ts      # AssemblyAI integration
│   └── textToSpeechService.ts # Murf TTS integration
├── lib/
│   └── languageConfig.ts     # Language configurations
├── n8n/                      # n8n workflow JSONs
│   ├── Generate Interview.json
│   └── Feedback Generation.json
└── utils/
    └── arcjet.ts             # Rate limiting config
```

---

## 🔧 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/assemblyai-stream` | POST | Get temporary token for AssemblyAI streaming |
| `/api/murf-tts` | POST | Generate speech from text |
| `/api/murf-translate` | POST | Translate text to target language |
| `/api/generate-interview-question` | POST | Generate interview questions from resume/job description |
| `/api/interview-feedback` | POST | Generate feedback from conversation history |

---

## 🎨 Key Technologies Deep Dive

### AssemblyAI Universal-Streaming v3
- Real-time speech recognition with WebSocket connection
- PCM 16-bit little-endian audio format
- Automatic language detection
- Low latency transcription

### Murf AI Integration
- **TTS**: High-quality voice synthesis in multiple languages
- **Translation**: Automatic translation for multi-language support
- Streaming audio delivery for fast playback

### n8n Workflows
Two automated workflows power the AI features:
1. **Interview Generation**: Analyzes resume/job description and generates questions
2. **Feedback Generation**: Processes conversation history and creates detailed feedback

### Convex Database
Real-time database with two main tables:
- **UserTable**: User profiles with Clerk integration
- **InterviewSessionTable**: Interview sessions with questions, answers, and feedback

---

## 🌍 Adding New Languages

1. Find the Murf voice ID from [Murf documentation](https://murf.ai/api/docs)
2. Add to `lib/languageConfig.ts`:
   ```typescript
   {
     code: 'es',
     name: 'Spanish',
     nativeName: 'Español',
     murfCode: 'es-ES',
     voiceId: 'es-ES-alvaro',
     flag: '🇪🇸'
   }
   ```
3. The language will automatically appear in the selector!

---

## 📊 Database Schema

### UserTable
```typescript
{
  name: string
  imageUrl: string
  email: string
}
```

### InterviewSessionTable
```typescript
{
  interviewQuestions: Array<{
    question: string
    answer: string
  }>
  resumeUrl?: string
  userId: Id<'UserTable'>
  status: string
  jobTitle?: string
  jobDescription?: string
  feedback?: {
    feedback: string
    suggestion: string
    rating: number
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Murf AI** for powerful text-to-speech and translation APIs
- **AssemblyAI** for real-time speech recognition
- **n8n** for workflow automation capabilities
- **Convex** for seamless real-time database
- **Clerk** for authentication infrastructure

---

## 📧 Contact

**Arjun Sharma** - [@Arjunhg](https://github.com/Arjunhg)

Project Link: [https://github.com/Arjunhg/infera](https://github.com/Arjunhg/infera)

Live Demo: [https://infera-amber.vercel.app/](https://infera-amber.vercel.app/)

---

<div align="center">

**Made with ❤️ by Arjun Sharma**

If you found this project helpful, please consider giving it a ⭐!

</div>
