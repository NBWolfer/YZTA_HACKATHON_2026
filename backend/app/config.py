from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gemma4:e2b"
    groq_api_key: str | None = None
    default_ai_provider: str = "ollama"  # or "groq"
    database_url: str = "sqlite:///./data/sme.db"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
