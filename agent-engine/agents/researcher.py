import os
os.environ["OPENAI_BASE_URL"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from .dev import FileUpdate, DevResult

model_name = os.getenv("OPENROUTER_MODEL")
if not model_name:
    raise ValueError("OPENROUTER_MODEL environment variable is not set")
model = OpenAIModel(model_name)

class ResearchResult(DevResult):
    hypothesis: str = Field(description="The research hypothesis being tested")
    improvement_type: str = Field(description="The category of improvement (UX, Performance, Readability, etc.)")

from .prompts import RESEARCHER_PROMPT

researcher_agent = Agent(
    model,
    output_type=ResearchResult,
    system_prompt=RESEARCHER_PROMPT,
)
