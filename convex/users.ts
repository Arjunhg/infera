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
            return {
                _id: result,
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl
            }
        }

        return user[0];
    }
})