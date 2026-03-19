import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: "planning",
    });
    return projectId;
  },
});

export const getProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(v.literal("planning"), v.literal("waiting_approval"), v.literal("executing"), v.literal("done"), v.literal("failed")),
    githubUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { projectId, status, githubUrl } = args;
    await ctx.db.patch(projectId, { status, ...(githubUrl ? { githubUrl } : {}) });
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // 1. Delete all logs
    const logs = await ctx.db.query("agentLogs").withIndex("by_project", q => q.eq("projectId", args.projectId)).collect();
    for (const log of logs) { await ctx.db.delete(log._id); }
    
    // 2. Delete all plans and their tasks
    const plans = await ctx.db.query("plans").withIndex("by_project", q => q.eq("projectId", args.projectId)).collect();
    for (const plan of plans) {
      const tasks = await ctx.db.query("tasks").withIndex("by_plan", q => q.eq("planId", plan._id)).collect();
      for (const task of tasks) { await ctx.db.delete(task._id); }
      await ctx.db.delete(plan._id);
    }
    
    // 3. Delete project
    await ctx.db.delete(args.projectId);
  }
});
