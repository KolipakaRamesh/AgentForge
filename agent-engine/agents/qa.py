import os
os.environ["OPENAI_BASE_URL"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

model = OpenAIModel(os.getenv("OPENROUTER_MODEL", "openai/gpt-4o"))

class QAResult(BaseModel):
    passed: bool = Field(description="Whether the code appears correct and robust")
    feedback: str = Field(description="Issues found, bugs, or improvements needed to fix the build/logic")

from .prompts import QA_PROMPT

qa_agent = Agent(
    model,
    output_type=QAResult,
    system_prompt=QA_PROMPT,
)
