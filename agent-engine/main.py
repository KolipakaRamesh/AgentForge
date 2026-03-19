import os
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
print(f"NEXT_PUBLIC_CONVEX_URL: {os.getenv('NEXT_PUBLIC_CONVEX_URL', 'NOT SET')}")

from convex_client import update_project_status, add_log, save_plan, save_tasks, client
from agents.planner import planner_agent
from agents.dev import dev_agent
from agents.qa import qa_agent
from agents.critic import critic_agent
from memory import agent_memory

app = FastAPI(title="AgentForge AI Agent Engine")

class PlanRequest(BaseModel):
    projectId: str
    requirement: str

class ExecuteRequest(BaseModel):
    projectId: str
    planId: str

@app.post("/api/plan")
def start_planning(req: PlanRequest, background_tasks: BackgroundTasks):
    add_log(req.projectId, "system", "Received planning request.")
    background_tasks.add_task(run_planner, req.projectId, req.requirement)
    return {"status": "started planning"}

async def run_planner(project_id: str, requirement: str):
    try:
        add_log(project_id, "planner", "Analyzing requirement and designing architecture...")
        
        # 1. RETRIEVE HISTORICAL CONTEXT (RAG)
        context_prompt = ""
        if agent_memory.enabled:
            add_log(project_id, "planner", "Searching Pinecone for similar architectural patterns...")
            relevant_projects = agent_memory.retrieve_relevant_context(requirement)
            if relevant_projects:
                context_str = "\n\n".join([f"- Requirement: {p['requirement']}" for p in relevant_projects])
                context_prompt = f"\n\n### HISTORICAL CONTEXT\nUse patterns from these related project requirements where applicable:\n{context_str}"

        # 2. RUN PLANNER WITH CONTEXT
        result = await planner_agent.run(f"Requirement: {requirement}{context_prompt}")
        
        plan_content = result.output.architecture_overview
        add_log(project_id, "planner", "Architecture planned. Generating task breakdowns...")
        
        plan_id = save_plan(project_id, plan_content)
        tasks = [{"title": t.title, "description": t.description} for t in result.output.tasks]
        save_tasks(plan_id, tasks)
        
        update_project_status(project_id, "waiting_approval")
        add_log(project_id, "planner", "Plan requires user approval.")
        
    except Exception as e:
        add_log(project_id, "system", f"Planning failed: {str(e)}")
        update_project_status(project_id, "failed")

async def run_execution_loop(project_id: str, plan_id: str):
    try:
        add_log(project_id, "system", "Spinning up execution environment...")
        
        # 1. Fetch Plan from Convex
        try:
            plan_result = client.query("plans:getPlanById", {"id": plan_id})
            if plan_result:
                plan_content = plan_result.get("content", "Execute tasks according to standard Next.js architecture.")
            else:
                # Fallback if plan not found
                plan_content = "Execute tasks according to standard Next.js architecture."
                add_log(project_id, "system", "Warning: Plan not found in Convex, using fallback content")
        except Exception as e:
            # Fallback on any error
            plan_content = "Execute tasks according to standard Next.js architecture."
            add_log(project_id, "system", f"Error fetching plan from Convex: {str(e)}. Using fallback content.")
        
        # 2. DEV AGENT
        add_log(project_id, "dev", "Writing code based on architectural plan...")
        dev_res = await dev_agent.run(f"Implement this plan:\n{plan_content}")
        add_log(project_id, "dev", f"Generated {len(dev_res.output.files)} files. {dev_res.output.explanation}")
        
        # 3. QA AGENT
        add_log(project_id, "qa", "Running tests and verifying codebase...")
        qa_res = await qa_agent.run(f"Review these generated files:\n{str(dev_res.output.files)}")
        
        if not qa_res.output.passed:
            add_log(project_id, "critic", f"QA found issues: {qa_res.output.feedback}. Constructing fixes...")
            critic_res = await critic_agent.run(f"Dev did: {dev_res.output.explanation}. QA said: {qa_res.output.feedback}")
            add_log(project_id, "critic", f"Actionable feedback generated. Looping back... (Skipped for demo)")
        else:
            add_log(project_id, "qa", "All checks passed successfully.")
            
        # 4. EXPORT TO DISK
        add_log(project_id, "system", "Exporting generated files to local project directory...")
        export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ExportedProjects", f"project_{project_id}")
        os.makedirs(export_dir, exist_ok=True)
        for f_def in dev_res.output.files:
            file_path = os.path.join(export_dir, f_def.path)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f_def.content)
                
        file_uri = "file:///" + export_dir.replace("\\", "/")
        
        # Prepare files for GitHub push
        files_to_push = {}
        for f_def in dev_res.output.files:
            files_to_push[f_def.path] = f_def.content
        
        # Push to GitHub and get URL
        github_url = ""
        if files_to_push:
            # Create a meaningful repo name from the requirement
            repo_name = "".join(c for c in requirement if c.isalnum() or c in (' ', '-', '_')).rstrip()
            repo_name = repo_name.replace(' ', '-').lower()[:50]  # Limit length
            if not repo_name:
                repo_name = f"project-{project_id}"
            
            github_url = github_manager.create_repository(
                name=repo_name,
                description=f"AgentForge generated project: {requirement[:100]}",
                private=False
            )
            
            if github_url:
                # Push the files
                github_manager.push_files(github_url, files_to_push, "Initial commit from AgentForge")
                add_log(project_id, "system", f"Project pushed to GitHub: {github_url}")
            else:
                add_log(project_id, "system", "Failed to create GitHub repository")
        
        # Update project status with GitHub URL if available, otherwise local path
        final_url = github_url if github_url else file_uri
        update_project_status(project_id, "done", final_url)
        
        if github_url:
            add_log(project_id, "system", f"Project deployed to GitHub! Repository: {github_url}")
        else:
            add_log(project_id, "system", f"Project deployed locally! Saved to {export_dir}")

        # 5. PINECONE MEMORY (Update Vector Store)
        if agent_memory.enabled:
            add_log(project_id, "system", "Storing project architecture in Pinecone (Long-term Memory)...")
            agent_memory.store_project_context(project_id, requirement, plan_content)

    except Exception as e:
        add_log(project_id, "system", f"Execution failed: {str(e)}")
        update_project_status(project_id, "failed")

@app.post("/api/execute")
def start_execution(req: ExecuteRequest, background_tasks: BackgroundTasks):
    add_log(req.projectId, "system", "Received execute request.")
    background_tasks.add_task(run_execution_loop, req.projectId, req.planId)
    return {"status": "started execution"}

@app.get("/")
def read_root():
    return {"status": "Agent Engine is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
