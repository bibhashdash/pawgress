import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnerId } from "./model/auth";
import { seedDefaultTags } from "./model/tags";

export const get = query({
    args: {},
    returns: v.union(
        v.object({
            _id: v.id("settings"),
            _creationTime: v.number(),
            ownerId: v.string(),
            tagCount: v.number(),
            hasCompletedOnboarding: v.boolean(),
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
// it exists rather than running a separate create step. A brand-new row
// gets seeded with the default tag set immediately, and starts with
// onboarding not yet completed.
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

        const settingsId = await ctx.db.insert("settings", {
            ownerId,
            tagCount: 0,
            hasCompletedOnboarding: false,
        });
        const tagCount = await seedDefaultTags(ctx, ownerId, settingsId);
        await ctx.db.patch(settingsId, { tagCount });
        return settingsId;
    },
});

export const completeOnboarding = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .unique();
        if (!existing) {
            throw new Error("Settings not found");
        }
        await ctx.db.patch(existing._id, { hasCompletedOnboarding: true });
        return null;
    },
});
