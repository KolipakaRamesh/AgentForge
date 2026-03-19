import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLogsByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const addLog = mutation({
  args: {
    projectId: v.id("projects"),
    agentType: v.union(v.literal("planner"), v.literal("dev"), v.literal("qa"), v.literal("critic"), v.literal("system")),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentLogs", {
      projectId: args.projectId,
      agentType: args.agentType,
      message: args.message,
      data: args.data,
    });
  },
});
