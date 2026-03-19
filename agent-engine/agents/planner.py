import os
os.environ["OPENAI_BASE_URL"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from typing import List

model = OpenAIModel(os.getenv("OPENROUTER_MODEL", "openai/gpt-4o"))

class TaskDef(BaseModel):
    title: str = Field(description="Short title of the task")
    description: str = Field(description="Detailed description of what needs to be implemented")

class PlanResult(BaseModel):
    architecture_overview: str = Field(description="A markdown formatted overview of the architecture, data models, and component structure")
    tasks: List[TaskDef] = Field(description="List of granular tasks to execute")

from .prompts import PLANNER_PROMPT

planner_agent = Agent(
    model,
    output_type=PlanResult,
    system_prompt=PLANNER_PROMPT,
)
