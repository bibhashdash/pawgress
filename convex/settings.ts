import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnerId } from "./model/auth";

export const get = query({
    args: {},
    returns: v.union(
        v.object({
            _id: v.id("settings"),
            _creationTime: v.number(),
            ownerId: v.string(),
        }),
        v.null(),
    ),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        return await ctx.db
            .query("settings")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .unique();
    },
});

// Get-or-create: settings is a per-user singleton, so callers just ensure()
// it exists rather than running a separate create step.
export const ensure = mutation({
    args: {},
    returns: v.id("settings"),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .unique();
        if (existing) return existing._id;
        return await ctx.db.insert("settings", { ownerId });
    },
});
