import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Behaviour/sub-behaviour data model not yet decided (see PROJECT_SETUP.md).
// Add tables here once the shape is settled.
export default defineSchema({
    settings: defineTable({
        ownerId: v.string(), // identity.tokenIdentifier
        // Denormalized count of rows in the tags table, kept in sync by
        // tags.create/remove.
        tagCount: v.number(),
        // Gates the onboarding carousel — false for brand-new rows, flipped
        // to true once the user completes it.
        hasCompletedOnboarding: v.boolean(),
    }).index("by_owner", ["ownerId"]),

    tags: defineTable({
        ownerId: v.string(), // identity.tokenIdentifier
        settingsId: v.id("settings"),
        name: v.string(),
        color: v.string(),
        // Soft-delete, same reasoning as behaviourClasses.deletedAt: log
        // entries keep referencing a tag by id after it's removed from the
        // Settings picker.
        deletedAt: v.optional(v.number()),
    }).index("by_owner", ["ownerId"])
      .index("by_settings", ["settingsId"]),

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

    logEntries: defineTable({
        ownerId: v.string(), // identity.tokenIdentifier
        behaviourClassId: v.id("behaviourClasses"),
        subclassId: v.id("subclasses"),
        // User-editable, epoch ms — when the training event happened, not
        // necessarily when the row was created. UI should default this to
        // Date.now() on the form, but the mutation always requires it.
        timestamp: v.number(),
        description: v.optional(v.string()),
        tagId: v.id("tags"),
    }).index("by_owner", ["ownerId"])
      .index("by_owner_and_timestamp", ["ownerId", "timestamp"])
      .index("by_behaviourClass", ["behaviourClassId"])
      .index("by_subclass", ["subclassId"])
      .index("by_tag", ["tagId"]),
});
