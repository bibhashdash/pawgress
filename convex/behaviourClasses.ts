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
            deletedAt: v.optional(v.number()),
        }),
    ),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const classes = await ctx.db
            .query("behaviourClasses")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();
        return classes.filter((behaviourClass) => behaviourClass.deletedAt === undefined);
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
            deletedAt: v.optional(v.number()),
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
        const deletedAt = Date.now();
        await ctx.db.patch(args.id, { deletedAt });

        // Cascade: soft-delete every subclass under this class too, so
        // nothing is left active under a deleted parent.
        const subclasses = await ctx.db
            .query("subclasses")
            .withIndex("by_behaviourClass", (q) => q.eq("behaviourClassId", args.id))
            .collect();
        for (const subclass of subclasses) {
            if (subclass.deletedAt === undefined) {
                await ctx.db.patch(subclass._id, { deletedAt });
            }
        }
        return null;
    },
});
