import type { QueryCtx, MutationCtx } from "../_generated/server";

// Row-level security lives here rather than a generic wrapper: every
// user-owned table stores ownerId = identity.tokenIdentifier, and every
// query/mutation that touches such a table calls this first.
export async function requireOwnerId(
    ctx: QueryCtx | MutationCtx,
): Promise<string> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return identity.tokenIdentifier;
}
