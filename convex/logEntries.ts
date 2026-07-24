import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnerId } from "./model/auth";
import { requireOwnedClass } from "./behaviourClasses";
import { requireOwnedSubclass } from "./subclasses";
import { requireOwnedTag } from "./tags";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const logEntryObject = v.object({
    _id: v.id("logEntries"),
    _creationTime: v.number(),
    ownerId: v.string(),
    behaviourClassId: v.id("behaviourClasses"),
    subclassId: v.id("subclasses"),
    timestamp: v.number(),
    description: v.optional(v.string()),
    tagId: v.id("tags"),
});

// Shared ownership check for update/remove: confirms the row exists and
// belongs to the caller before any mutation touches it.
async function requireOwnedLogEntry(ctx: MutationCtx, id: Id<"logEntries">, ownerId: string) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.ownerId !== ownerId) {
        throw new Error("Log entry not found");
    }
    return existing;
}

// Confirms subclassId belongs to the caller and actually belongs to
// behaviourClassId — a log entry can't reference a subclass from a
// different behaviour class than the one it's logged against.
async function requireConsistentSubclass(
    ctx: MutationCtx,
    behaviourClassId: Id<"behaviourClasses">,
    subclassId: Id<"subclasses">,
    ownerId: string,
) {
    const subclass = await requireOwnedSubclass(ctx, subclassId, ownerId);
    if (subclass.behaviourClassId !== behaviourClassId) {
        throw new Error("Subclass does not belong to the given behaviour class");
    }
}

export const list = query({
    args: {},
    returns: v.array(logEntryObject),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        return await ctx.db
            .query("logEntries")
            .withIndex("by_owner_and_timestamp", (q) => q.eq("ownerId", ownerId))
            .order("desc")
            .collect();
    },
});

export const get = query({
    args: {
        id: v.id("logEntries"),
    },
    returns: v.union(logEntryObject, v.null()),
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
        behaviourClassId: v.id("behaviourClasses"),
        subclassId: v.id("subclasses"),
        timestamp: v.number(),
        description: v.optional(v.string()),
        tagId: v.id("tags"),
    },
    returns: v.id("logEntries"),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedClass(ctx, args.behaviourClassId, ownerId);
        await requireConsistentSubclass(ctx, args.behaviourClassId, args.subclassId, ownerId);
        await requireOwnedTag(ctx, args.tagId, ownerId);

        return await ctx.db.insert("logEntries", {
            ownerId,
            behaviourClassId: args.behaviourClassId,
            subclassId: args.subclassId,
            timestamp: args.timestamp,
            description: args.description,
            tagId: args.tagId,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("logEntries"),
        behaviourClassId: v.optional(v.id("behaviourClasses")),
        subclassId: v.optional(v.id("subclasses")),
        timestamp: v.optional(v.number()),
        description: v.optional(v.string()),
        tagId: v.optional(v.id("tags")),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const existing = await requireOwnedLogEntry(ctx, args.id, ownerId);

        if (args.behaviourClassId !== undefined) {
            await requireOwnedClass(ctx, args.behaviourClassId, ownerId);
        }
        if (args.subclassId !== undefined) {
            const nextBehaviourClassId = args.behaviourClassId ?? existing.behaviourClassId;
            await requireConsistentSubclass(ctx, nextBehaviourClassId, args.subclassId, ownerId);
        }
        if (args.tagId !== undefined) {
            await requireOwnedTag(ctx, args.tagId, ownerId);
        }

        const patch: {
            behaviourClassId?: Id<"behaviourClasses">;
            subclassId?: Id<"subclasses">;
            timestamp?: number;
            description?: string;
            tagId?: Id<"tags">;
        } = {};
        if (args.behaviourClassId !== undefined) patch.behaviourClassId = args.behaviourClassId;
        if (args.subclassId !== undefined) patch.subclassId = args.subclassId;
        if (args.timestamp !== undefined) patch.timestamp = args.timestamp;
        if (args.description !== undefined) patch.description = args.description;
        if (args.tagId !== undefined) patch.tagId = args.tagId;
        await ctx.db.patch(args.id, patch);
        return null;
    },
});

export const remove = mutation({
    args: {
        id: v.id("logEntries"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedLogEntry(ctx, args.id, ownerId);
        await ctx.db.delete(args.id);
        return null;
    },
});
