from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # DataSpace credentials — read from .env, never exposed to clients
    ds_client_id: str = Field(..., alias="DS_CLIENT_ID")
    ds_client_secret: str = Field(..., alias="DS_CLIENT_SECRET")
    ds_company_code: str = Field("UATOCC", alias="DS_COMPANY_CODE")
    ds_plant_code: str = Field("OCCUAT", alias="DS_PLANT_CODE")
    ds_environment: str = Field("uat", alias="DS_ENVIRONMENT")

    # CORS
    allowed_origins: str = Field("http://localhost:5173", alias="ALLOWED_ORIGINS")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def token_url(self) -> str:
        if self.ds_environment == "prod":
            return "https://auth.industryapps.net/auth/realms/IndustryApps/protocol/openid-connect/token"
        return "https://auth.uat.industryapps.net/auth/realms/IndustryApps/protocol/openid-connect/token"

    @property
    def gateway_base(self) -> str:
        if self.ds_environment == "prod":
            return f"https://connect-v1.industryapps.net/{self.ds_company_code}"
        return f"https://connect-v1.uat.industryapps.net/{self.ds_company_code}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
