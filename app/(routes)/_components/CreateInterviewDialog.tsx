import React, { useContext, useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Loader2Icon, Plus } from 'lucide-react'
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'
import { DialogClose } from '@radix-ui/react-dialog'
import { FormDataType } from '@/types/Types'
import axios from 'axios'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const CreateInterviewDialog = () => {

    const [formData, setFormData] = useState<FormDataType>({
        resume: null,
        jobTitle: "",
        jobDescription: ""
    });
    const [file, setFile] = useState<File>();
    const [loading, setLoading] = useState<boolean>(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
    const saveInterviewQuestion = useMutation(api.Interview.SaveInterviewQuestions);
    
    const userContext = useContext(UserDetailContext);
    const router = useRouter();
    const toastIdRef = useRef<string | number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Engaging messages to cycle through during processing
    const loadingMessages = [
        "🔍 Analyzing your resume...",
        "🤖 Understanding job requirements...",
        "💡 Generating personalized questions...",
        "🎯 Tailoring interview difficulty...",
        "📝 Preparing your interview session...",
        "✨ Almost ready! Final touches...",
        "🚀 Setting up your interview environment..."
    ];

    const onHandleInputChange = (field: keyof FormDataType, value: string | File | null | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    
    useEffect(() => {
        if(file){
            onHandleInputChange('resume', file);
        }else{
            onHandleInputChange('resume', null);
        }
    }, [file]);

    // Effect to handle progressive toast messages during loading
    useEffect(() => {
        if (loading) {
            // Show initial toast
            toastIdRef.current = toast.loading(loadingMessages[0], {
                duration: Infinity, // Keep it until we dismiss it
            });
            
            // Start cycling through messages
            intervalRef.current = setInterval(() => {
                setCurrentMessageIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % loadingMessages.length;
                    
                    // Update the existing toast with new message
                    if (toastIdRef.current) {
                        toast.dismiss(toastIdRef.current);
                        toastIdRef.current = toast.loading(loadingMessages[nextIndex], {
                            duration: Infinity,
                        });
                    }
                    
                    return nextIndex;
                });
            }, 2500); // Change message every 2.5 seconds
        } else {
            // Clean up when loading stops
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }
            setCurrentMessageIndex(0);
        }

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        };
    }, [loading, loadingMessages]);

    const onSubmit = async () => {
        // Check if user is authenticated
        if(!userContext?.userDetails?._id){
            toast.error("Please sign in to create an interview");
            router.push('/sign-in');
            return;
        }

        setLoading(true);
        const formData_ = new FormData();
        formData_.append('file', file??'');
        formData_.append('jobTitle', formData?.jobTitle || "");
        formData_.append('jobDescription', formData?.jobDescription || "");

        try {
            const result = await axios.post('/api/generate-interview-question', formData_);
            if(result?.data?.status===429){
                toast.warning(result?.data?.result);
                return ;
            }
            
            console.log("API response: ", result.data);
            console.log("Interview questions from API: ", result.data?.interviewQuestions);
            console.log("Interview questions length: ", result.data?.interviewQuestions?.length);
            
            const response = await saveInterviewQuestion({
                interviewQuestions: result.data?.interviewQuestions,
                resumeUrl: result.data?.resumeUrl || undefined,
                jobTitle: formData?.jobTitle || undefined,
                jobDescription: formData?.jobDescription || undefined,
                uid: userContext?.userDetails?._id
            })
            console.log("Saved interview session: ", response); // this id will be used for redirecting user to the interview session
            toast.success("Interview created successfully!");
            router.push('/interview/' + response)
        } catch (error) {
            console.log(error);
            toast.error("Failed to create interview. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    size="lg" 
                    className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 mb-8 cursor-pointer"
                >
                    <Plus size={20} />
                    Create Your Interview
                </Button>
            </DialogTrigger>
            <DialogContent className='w-full max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                        Create New Interview
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                        Please provide the following details to set up your interview.
                        <br/>
                        <span className='text-xs text-muted-foreground text-red-500'>Typical interview creation is 30 seconds.</span>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <Tabs defaultValue="resume-upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger 
                                value="resume-upload" 
                                className="text-xs sm:text-sm font-medium cursor-pointer"
                            >
                                Resume Upload
                            </TabsTrigger>
                            <TabsTrigger 
                                value="job-description" 
                                className="text-xs sm:text-sm font-medium cursor-pointer"
                            >
                                Job Description
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="resume-upload" className="space-y-4">
                            <ResumeUpload setFile={setFile} />
                        </TabsContent>
                        <TabsContent value="job-description" className="space-y-4">
                            <JobDescription onInputChange={onHandleInputChange}/>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className='flex flex-col sm:flex-row gap-3 pt-4'>
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button className="w-full sm:w-auto cursor-pointer" onClick={onSubmit} disabled={loading || (!file && (!formData?.jobTitle || !formData?.jobDescription))}>
                        {loading && <Loader2Icon className='animate-spin'/>} 
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateInterviewDialog
