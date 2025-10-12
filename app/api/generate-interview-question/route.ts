import axios from "axios";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { aj } from "@/utils/arcjet";
import type { ArcjetRateLimitReason } from "@arcjet/next";

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_URL_PUBLIC_KEY || "",
    privateKey : process.env.IMAGEKIT_URL_PRIVATE_KEY || "",
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT || ""
});

export async function POST(request: NextRequest){

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobTitle = formData.get('jobTitle');
    const jobDescription = formData.get('jobDescription');

    // const { userId } = getAuth(request);
    const user = await currentUser();

    const decision = await aj.protect(request, { userId: user?.primaryEmailAddress?.emailAddress??'', requested: 5 }) //Deduct 5 credits
    console.log("Decision:", decision)

    if((decision.reason as ArcjetRateLimitReason).remaining === 0){
        return NextResponse.json({
            status: 429,
            result: 'No free credits remaining. Try again after 50 second'
        })
    }

    try {

        if(file){
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            if(!user){
                return NextResponse.json({error: 'Unauthorized'}, {status: 401});
            }
            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: `upload-${Date.now()}.pdf`,
                useUniqueFileName: true
            })

            // call n8n webhook
            const result = await axios.post(process.env.N8N_URL_ENDPOINT || '', {
                resumeUrl: uploadResponse.url
            })

            
            // Extract interview questions from the response
            let interviewQuestions = [];
            if (result.data?.message?.content?.interview_questions) {
                interviewQuestions = result.data.message.content.interview_questions;
            } else if (result.data?.interview_questions) {
                interviewQuestions = result.data.interview_questions;
            } else if (Array.isArray(result.data) && result.data[0]?.interview_questions) {
                interviewQuestions = result.data[0].interview_questions;
            }
            

            return NextResponse.json({
                interviewQuestions: interviewQuestions || [],
                resumeUrl: uploadResponse?.url
            }, { status: 200 })

        } else {
            const result = await axios.post(process.env.N8N_URL_ENDPOINT || '', {
                resumeUrl: null,
                jobTitle: jobTitle,
                jobDescription: jobDescription
            })
            
            // Extract interview questions from the response
            let interviewQuestions = [];
            if (result.data?.message?.content?.questions) {
                interviewQuestions = result.data.message.content.questions;
            } else if (result.data?.questions) {
                interviewQuestions = result.data.questions;
            } else if (Array.isArray(result.data) && result.data[0]?.questions) {
                interviewQuestions = result.data[0].questions;
            }
            

            return NextResponse.json({
                interviewQuestions: interviewQuestions || [],
                resumeUrl: null
            }, { status: 200 })
        }

        
    }  catch (error: any) {
        // Enhanced error logging
        console.error("Error in /api/generate-interview-question:", {
            message: error?.message,
            stack: error?.stack,
            error,
        });

        // More descriptive error response
        return NextResponse.json(
            {
                error: 'Failed to process interview question generation.',
                details: error?.message || 'Unknown error',
                hint: 'Check if the n8n webhook URL is correct and the API route exists.',
            },
            { status: 500 }
        );
    }
}