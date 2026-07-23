import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnerId } from "./model/auth";
import { requireOwnedClass } from "./behaviourClasses";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Shared ownership check for update/remove: confirms the row exists and
// belongs to the caller before any mutation touches it.
async function requireOwnedSubclass(ctx: MutationCtx, id: Id<"subclasses">, ownerId: string) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.ownerId !== ownerId) {
        throw new Error("Subclass not found");
    }
    return existing;
}

export const list = query({
    args: {
        behaviourClassId: v.id("behaviourClasses"),
    },
    returns: v.array(
        v.object({
            _id: v.id("subclasses"),
            _creationTime: v.number(),
            ownerId: v.string(),
            behaviourClassId: v.id("behaviourClasses"),
            name: v.string(),
        }),
    ),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedClass(ctx, args.behaviourClassId, ownerId);
        return await ctx.db
            .query("subclasses")
            .withIndex("by_behaviourClass", (q) => q.eq("behaviourClassId", args.behaviourClassId))
            .collect();
    },
});

export const create = mutation({
    args: {
        behaviourClassId: v.id("behaviourClasses"),
        name: v.string(),
    },
    returns: v.id("subclasses"),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const behaviourClass = await requireOwnedClass(ctx, args.behaviourClassId, ownerId);
        const id = await ctx.db.insert("subclasses", {
            ownerId,
            behaviourClassId: args.behaviourClassId,
            name: args.name,
        });
        await ctx.db.patch(args.behaviourClassId, {
            subclassCount: (behaviourClass.subclassCount ?? 0) + 1,
        });
        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("subclasses"),
        name: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedSubclass(ctx, args.id, ownerId);
        await ctx.db.patch(args.id, { name: args.name });
        return null;
    },
});

export const remove = mutation({
    args: {
        id: v.id("subclasses"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const existing = await requireOwnedSubclass(ctx, args.id, ownerId);
        await ctx.db.delete(args.id);
        const behaviourClass = await ctx.db.get(existing.behaviourClassId);
        if (behaviourClass) {
            await ctx.db.patch(existing.behaviourClassId, {
                subclassCount: Math.max(0, (behaviourClass.subclassCount ?? 0) - 1),
            });
        }
        return null;
    },
});
