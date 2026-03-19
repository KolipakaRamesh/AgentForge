import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTasksByPlanId = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();
  },
});

export const saveTasks = mutation({
  args: {
    planId: v.id("plans"),
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing tasks for this plan
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();
      
    for (const task of existingTasks) {
      await ctx.db.delete(task._id);
    }

    // Insert new tasks
    for (const task of args.tasks) {
      await ctx.db.insert("tasks", {
        planId: args.planId,
        title: task.title,
        description: task.description,
        status: "pending",
      });
    }
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: args.status });
  },
});
