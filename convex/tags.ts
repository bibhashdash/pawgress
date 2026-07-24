import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnerId } from "./model/auth";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Shared ownership check: confirms the row exists and belongs to the
// caller. Exported so convex/logEntries.ts can verify a tagId actually
// belongs to the caller before logging against it.
export async function requireOwnedTag(ctx: QueryCtx | MutationCtx, id: Id<"tags">, ownerId: string) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.ownerId !== ownerId) {
        throw new Error("Tag not found");
    }
    return existing;
}

async function requireSettings(ctx: MutationCtx, ownerId: string) {
    const settings = await ctx.db
        .query("settings")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .unique();
    if (!settings) {
        throw new Error("Settings not found");
    }
    return settings;
}

export const list = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("tags"),
            _creationTime: v.number(),
            ownerId: v.string(),
            settingsId: v.id("settings"),
            name: v.string(),
            color: v.string(),
            deletedAt: v.optional(v.number()),
        }),
    ),
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const rows = await ctx.db
            .query("tags")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();
        return rows.filter((row) => row.deletedAt === undefined);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        color: v.string()
    },
    returns: v.id("tags"),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const settings = await requireSettings(ctx, ownerId);
        const id = await ctx.db.insert("tags", {
            ownerId,
            settingsId: settings._id,
            name: args.name,
            color: args.color
        });
        await ctx.db.patch(settings._id, {
            tagCount: settings.tagCount + 1,
        });
        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("tags"),
        name: v.string(),
        color: v.string()
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await requireOwnedTag(ctx, args.id, ownerId);
        await ctx.db.patch(args.id, { name: args.name, color: args.color });
        return null;
    },
});

export const remove = mutation({
    args: {
        id: v.id("tags"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const existing = await requireOwnedTag(ctx, args.id, ownerId);
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
        const settings = await ctx.db.get(existing.settingsId);
        if (settings) {
            await ctx.db.patch(existing.settingsId, {
                tagCount: Math.max(0, settings.tagCount - 1),
            });
        }
        return null;
    },
});
