import os
from convex import ConvexClient
from github_integration import github_manager
from dotenv import load_dotenv

load_dotenv()

convex_url = os.getenv("NEXT_PUBLIC_CONVEX_URL")
if not convex_url:
    raise ValueError("NEXT_PUBLIC_CONVEX_URL is not set")

client = ConvexClient(convex_url)

def add_log(project_id: str, agent_type: str, message: str, data: dict = None):
    client.mutation("logs:addLog", {
        "projectId": project_id,
        "agentType": agent_type,
        "message": message,
        "data": data
    })

def update_project_status(project_id: str, status: str, github_url: str = None):
    args = {"projectId": project_id, "status": status}
    if github_url:
        args["githubUrl"] = github_url
    client.mutation("projects:updateProjectStatus", args)

def save_plan(project_id: str, content: str):
    res = client.mutation("plans:savePlan", {
        "projectId": project_id,
        "content": content
    })
    return res

def save_tasks(plan_id: str, tasks: list):
    client.mutation("tasks:saveTasks", {
        "planId": plan_id,
        "tasks": tasks
    })

def create_github_repo_for_project(project_id: str, project_name: str, description: str) -> str:
    """Create a GitHub repository for a project and return the URL"""
    repo_name = f"agentforge-{project_id}"
    github_url = github_manager.create_repository(
        name=repo_name,
        description=f"AgentForge generated project: {description}",
        private=False
    )
    
    if github_url:
        # Update project with GitHub URL
        update_project_status(project_id, "done", github_url)
    
    return github_url or ""

def push_project_to_github(project_id: str, files: dict, commit_message: str = "AgentForge generated code") -> bool:
    """Push project files to GitHub"""
    # In a real implementation, we'd fetch the GitHub URL from Convex
    # For now, we'll create a new repo
    # TODO: Fetch existing GitHub URL from project data
    return False  # Placeholder - to be implemented with proper project lookup
