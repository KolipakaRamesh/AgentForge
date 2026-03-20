import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPlanByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});

export const getPlanById = query({
  args: { id: v.id("plans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


export const savePlan = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if plan exists
    const existing = await ctx.db
      .query("plans")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { content: args.content, status: "draft" });
      return existing._id;
    } else {
      return await ctx.db.insert("plans", {
        projectId: args.projectId,
        content: args.content,
        status: "draft",
      });
    }
  },
});

export const approvePlan = mutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, { status: "approved" });
  },
});
