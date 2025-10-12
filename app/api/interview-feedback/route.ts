import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        const { conversation } = await request.json();

        // Convert conversation array to JSON string to match what n8n expects
        const result = await axios.post(process.env.N8N_FEEDBACK_URL || '', {
            message: JSON.stringify(conversation)
        })
        console.log("result",result);
        // Extract feedback from nested structure: result.data.message.content
        const feedback = result.data;


        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error in feedback API:", error);
        return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
    }
}