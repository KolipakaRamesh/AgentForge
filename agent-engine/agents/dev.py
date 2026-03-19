import os
os.environ["OPENAI_BASE_URL"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

model = OpenAIModel(os.getenv("OPENROUTER_MODEL", "openai/gpt-4o"))

class FileUpdate(BaseModel):
    path: str = Field(description="File path relative to project root")
    content: str = Field(description="Full content of the file")

class DevResult(BaseModel):
    files: list[FileUpdate] = Field(description="List of files created or updated")
    explanation: str = Field(description="Explanation of the code changes")

from .prompts import DEV_PROMPT

dev_agent = Agent(
    model,
    output_type=DevResult,
    system_prompt=DEV_PROMPT,
)
