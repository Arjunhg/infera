import { Id } from "@/convex/_generated/dataModel";

export type UserDetails = {
  _id?: Id<'UserTable'>;
  email: string;
  imageUrl: string;
  name: string;
};

export type FormDataType = {
  resume?: File | null; // This can be undefined if resume is not provided (another hidden type: undefined)
  jobTitle?: string;
  jobDescription?: string;
};

export type onInputChangeType = <K extends keyof FormDataType>(
  field: K,
  value: FormDataType[K]
) => void;

// app\(routes)\interview\[interviewId]\start\page.tsx
export type InterviewData = ResumeBasedInterview | ManualInterview;

interface BaseInterview {
  _id: Id<"InterviewSessionTable">;
  _creationTime: number;
  interviewQuestions: { question: string; answer: string }[];
  userId: Id<"UserTable">;
  status: string;
  feedback?: FeedbackType;
}

interface ResumeBasedInterview extends BaseInterview {
  type: "resume";
  resumeUrl: string; // required
  jobTitle?: string;
  jobDescription?: string;
}

interface ManualInterview extends BaseInterview {
  type: "manual";
  jobTitle?: string;
  jobDescription?: string;
}

// 
export type KnowledgeBaseItem = {
  create_time: number;
  docs: []; 
  from: number;
  name: string;
  prologue: string;
}

// 
export type MessageType = {
  from: 'user' | 'bot',
  text: string
}

// feedback
export type FeedbackType = {
  feedback: string;
  rating: number;
  suggestion: string;
}