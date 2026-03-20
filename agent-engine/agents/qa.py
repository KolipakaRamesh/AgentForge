import os
os.environ["OPENAI_BASE_URL"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

import httpx
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

model_name = os.getenv("OPENROUTER_MODEL")
if not model_name:
    raise ValueError("OPENROUTER_MODEL environment variable is not set")
model = OpenAIModel(model_name)

class QAResult(BaseModel):
    passed: bool = Field(description="Whether the code appears correct and robust")
    feedback: str = Field(description="Issues found, bugs, or improvements needed to fix the build/logic")

from .prompts import QA_PROMPT

qa_agent = Agent(
    model,
    output_type=QAResult,
    system_prompt=QA_PROMPT,
)
