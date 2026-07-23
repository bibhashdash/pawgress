import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Behaviour/sub-behaviour data model not yet decided (see PROJECT_SETUP.md).
// Add tables here once the shape is settled.
export default defineSchema({
    settings: defineTable({
        ownerId: v.string(), // identity.tokenIdentifier
    }).index("by_owner", ["ownerId"]),

    behaviourClasses: defineTable({
        ownerId: v.string(), // identity.tokenIdentifier
        title: v.string(),
        // Denormalized count of rows in the subclasses table, kept in sync
        // by subclasses.create/remove — avoids an N+1 query per row just to
        // show a count badge in the behaviours list.
        subclassCount: v.number(),
        // Soft-delete: set instead of actually deleting, so logs that
        // reference this class keep working. list() filters these out;
        // get() still returns them.
        deletedAt: v.optional(v.number()),
    }).index("by_owner", ["ownerId"]),

    subclasses: defineTable({
        ownerId: v.string(), // identity.tokenIdentifier
        behaviourClassId: v.id("behaviourClasses"),
        name: v.string(),
        // Soft-delete, same reasoning as behaviourClasses.deletedAt.
        deletedAt: v.optional(v.number()),
    }).index("by_owner", ["ownerId"])
      .index("by_behaviourClass", ["behaviourClassId"]),
});
