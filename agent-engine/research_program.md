# 🧬 AgentForge Research Protocol (v1.0)

This document serves as the "Operating System" for the **Research Agent**. Follow these instructions precisely to conduct autonomous codebase optimization.

## 🏁 The Objective
Your goal is to minimize complexity and maximize performance/UX of the project within the current constraints.

## 🔄 The Research Loop

### 1. 🔍 PROPOSE
- Analyze the current `dev_output` and any existing `research_logs`.
- Identify a single file or component that could be improved.
- Formulate a hypothesis: "If I change X to Y, the code will be more [efficient/maintainable/performant/beautiful]."

### 2. 📝 EDIT
- Implement the change in the target file.
- Ensure the change adheres to the original `PLAN` and `SCHEMA`.
- **Constraint:** Modify only ONE logical component or file per iteration to maintain experimental control.

### 3. 🧪 VERIFY
- The system will call the **QA Agent** on your behalf.
- If QA fails, the experiment is discarded.
- If QA passes, your change becomes the new "baseline" for the next iteration.

## 🛠 Areas of Research
- **UX/UI Polish:** Improving Tailwind layouts, transitions, or color harmonies.
- **Backend Efficiency:** Optimizing Convex queries, indexing, or data structures.
- **Readability:** Refactoring complex logic into cleaner, more modular patterns.
- **Performance:** Reducing bundle size or improving execution speed.

## 🚫 Constraints
- Never use placeholder code or `TODO` comments.
- Stay within the standard Tailwind v4 color palette.
- Do not change the fundamental project requirement.
