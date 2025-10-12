import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const SaveInterviewQuestions = mutation({
    args: {
        interviewQuestions: v.array(v.object({
            question: v.string(),
            answer: v.string()
        })),
        resumeUrl: v.optional(v.string()),
        jobTitle: v.optional(v.string()),
        jobDescription: v.optional(v.string()),
        uid: v.id('UserTable')
    },

    // v.optional will not allow null value but will allow undefined. So in CreateInterviewDialog we need to associate undefined with each field being passed to SaveInterviewQuestions function
    // To make convex accept null value use: v.union(v.string(), v.null());

    handler: async(ctx, args) => {
        const result = await ctx.db.insert('InterviewSessionTable', {
            interviewQuestions: args.interviewQuestions,
            resumeUrl: args.resumeUrl,
            jobTitle: args.jobTitle,
            jobDescription: args.jobDescription,
            userId: args.uid,
            status: 'draft'
        })
        return result;
    }

})

export const GetInterviewQuestions = query({
    args: {
        interviewRecordId: v.id('InterviewSessionTable'),
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.query('InterviewSessionTable').filter(q => q.eq(q.field('_id'), args.interviewRecordId)).collect();
        return result[0];
    }
})

export const UpdateFeedback = mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        feedback: v.optional(v.object({
            feedback: v.string(),
            suggestion: v.string(),
            rating: v.number()
        }))
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.patch(args.recordId, {
            feedback: args.feedback,
            status: 'completed'
        })
        return result;
    }
})

export const GetInterviewList = query({
    args: {
        uid: v.id('UserTable')
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.query('InterviewSessionTable').filter(q => q.eq(q.field('userId'), args.uid)).order('desc').collect();
        return result;
    }
})