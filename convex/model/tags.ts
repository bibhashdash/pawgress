import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// Seeded onto every new settings row. Will likely move to a user-driven
// onboarding flow later, but a fixed starting set is fine for now.
export const DEFAULT_TAG_NAMES = ["good", "watch", "issue", "incident"] as const;

// Hex values, matching the app's Tailwind palette (see tailwind.config.js)
// so tag chips line up with the rest of the UI's semantic colors. Stored
// as hex rather than Tailwind class names since tags.color is set
// directly as a background color, not resolved through Tailwind/NativeWind.
const DEFAULT_TAG_COLORS: Record<(typeof DEFAULT_TAG_NAMES)[number], string> = {
    good: "#16a34a",
    watch: "#ffdf20",
    issue: "#EB5E28",
    incident: "#dc2626",
};

// Inserts the default tag set for a settings row and returns how many were
// created, so the caller can set settings.tagCount in the same mutation.
export async function seedDefaultTags(ctx: MutationCtx, ownerId: string, settingsId: Id<"settings">) {
    for (const name of DEFAULT_TAG_NAMES) {
        await ctx.db.insert("tags", { ownerId, settingsId, name, color: DEFAULT_TAG_COLORS[name] });
    }
    return DEFAULT_TAG_NAMES.length;
}
