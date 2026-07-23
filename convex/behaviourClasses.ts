import { v } from "convex/values";
import {mutation, query} from "./_generated/server";
import { requireOwnerId } from "./model/auth";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Shared ownership check: confirms the row exists and belongs to the
// caller. Exported so convex/subclasses.ts can verify a behaviourClassId
// actually belongs to the caller before creating/listing against it.
export async function requireOwnedClass(ctx: QueryCtx | MutationCtx, id: Id<"behaviourClasses">, ownerId: string) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.ownerId !== ownerId) {
        throw new Error("Behaviour class not found");
    }
    return existing;
}

export const list = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("behaviourClasses"),
            _creationTime: v.number(),
            ownerId: v.string(),
            title: v.string(),
            subclassCount: v.number(),
        }),
    ),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        return await ctx.db
            .query("behaviourClasses")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();
    },
});

export const get = query({
    args: {
        id: v.id("behaviourClasses"),
    },
    returns: v.union(
        v.object({
            _id: v.id("behaviourClasses"),
            _creationTime: v.number(),
            ownerId: v.string(),
            title: v.string(),
            subclassCount: v.number(),
        }),
        v.null(),
    ),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const existing = await ctx.db.get(args.id);
        if (!existing || existing.ownerId !== ownerId) {
            return null;
        }
        return existing;
    },
});

export const create = mutation({
    args: {
        title: v.string(),
    },
    returns: v.id("behaviourClasses"),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        return await ctx.db.insert("behaviourClasses", {
            ownerId,
            title: args.title,
            subclassCount: 0,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("behaviourClasses"),
        title: v.optional(v.string()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedClass(ctx, args.id, ownerId);

        const patch: { title?: string } = {};
        if (args.title !== undefined) patch.title = args.title;
        await ctx.db.patch(args.id, patch);
        return null;
    },
});

export const remove = mutation({
    args: {
        id: v.id("behaviourClasses"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedClass(ctx, args.id, ownerId);
        await ctx.db.delete(args.id);
        return null;
    },
});
