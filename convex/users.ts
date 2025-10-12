import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string()
    },

    handler: async(ctx, args) => {
        // If user already exists
        const user = await ctx.db.query('UserTable').filter(q => q.eq(q.field('email'), args.email)).collect();

        // If not then insert new user in DB
        if(user?.length==0){
            const result = await ctx.db.insert('UserTable', {
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl
            })
            console.log("Created new user with ID:", result);
            return {
                _id: result,
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl
            }
        }

        console.log("Returning existing user:", user[0]);
        return user[0];
    }
})