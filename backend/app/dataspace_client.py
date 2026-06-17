"""
DataSpace API client — runs entirely on the server.
Credentials never leave this module. The browser only ever sees our /api/* responses.
"""
import time
import httpx
from app.config import Settings

# Simple in-process token cache (per worker)
_token_cache: dict = {"token": None, "expires_at": 0}


async def get_token(settings: Settings) -> str:
    """Fetch (or return cached) OAuth2 access token from DataSpace."""
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"]:
        return _token_cache["token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            settings.token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.dataspace_client_id,
                "client_secret": settings.dataspace_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = now + data.get("expires_in", 300) - 30
    return _token_cache["token"]


async def fetch_work_orders(
    settings: Settings,
    start_date: str | None = None,
    end_date: str | None = None,
    status: str | None = None,
) -> list[dict]:
    """Fetch jobDetails records from DataSpace."""
    token = await get_token(settings)
    collection = f"{settings.dataspace_plant_code}_jobDetails"
    url = f"{settings.gateway_base}/transaction/{collection}/records"

    params: dict = {}
    if start_date:
        params["startDate"] = start_date
    if end_date:
        params["endDate"] = end_date
    if status:
        params["status"] = status

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            url,
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

    records = data.get("data") or data.get("records") or data or []
    if isinstance(records, dict):
        records = list(records.values())
    return records
