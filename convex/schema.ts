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
        subclasses: v.optional(v.array(v.string())),
    }).index("by_owner", ["ownerId"]),
});
