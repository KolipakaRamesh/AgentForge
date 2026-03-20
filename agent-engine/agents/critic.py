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

class CriticResult(BaseModel):
    approved_for_deployment: bool = Field(description="Is the code ready for deployment?")
    actionable_fixes: str = Field(description="If not approved, strict actionable paths to fix the code.")

from .prompts import CRITIC_PROMPT

critic_agent = Agent(
    model,
    output_type=CriticResult,
    system_prompt=CRITIC_PROMPT,
)
