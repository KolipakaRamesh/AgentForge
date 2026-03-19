import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    description: v.string(),
    status: v.union(v.literal("planning"), v.literal("waiting_approval"), v.literal("executing"), v.literal("done"), v.literal("failed")),
    githubUrl: v.optional(v.string()),
  }),
  plans: defineTable({
    projectId: v.id("projects"),
    content: v.string(),
    status: v.union(v.literal("draft"), v.literal("approved"), v.literal("rejected")),
  }).index("by_project", ["projectId"]),
  tasks: defineTable({
    planId: v.id("plans"),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed")),
  }).index("by_plan", ["planId"]),
  agentLogs: defineTable({
    projectId: v.id("projects"),
    agentType: v.union(v.literal("planner"), v.literal("dev"), v.literal("qa"), v.literal("critic"), v.literal("system")),
    message: v.string(),
    data: v.optional(v.any()),
  }).index("by_project", ["projectId"]),
});
