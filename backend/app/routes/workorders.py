import time
from typing import Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from app.config import Settings, get_settings
from app.models import WorkOrder, WorkOrdersResponse, StatsResponse

router = APIRouter()

# Simple in-memory token cache
_token_cache: dict = {"token": None, "expires": 0}


async def get_dataspace_token(settings: Settings) -> str:
    """Fetch OAuth2 token from DataSpace auth server. Cached until 60s before expiry."""
    now = time.time()
    if _token_cache["token"] and _token_cache["expires"] > now:
        return _token_cache["token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            settings.token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.ds_client_id,
                "client_secret": settings.ds_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"DataSpace auth failed: {resp.text}")

        data = resp.json()
        _token_cache["token"] = data["access_token"]
        _token_cache["expires"] = now + data.get("expires_in", 300) - 60
        return _token_cache["token"]


@router.get("/", response_model=WorkOrdersResponse)
async def list_workorders(
    startDate: Optional[str] = Query(None, description="YYYY-MM-DD"),
    endDate: Optional[str] = Query(None, description="YYYY-MM-DD"),
    status: Optional[str] = Query(None),
    settings: Settings = Depends(get_settings),
):
    """Proxy to DataSpace jobDetails collection — no credentials exposed to frontend."""
    token = await get_dataspace_token(settings)

    collection = f"{settings.ds_plant_code}_jobDetails"
    url = f"{settings.gateway_base}/transaction/{collection}/records"

    params: dict = {}
    if startDate:
        params["startDate"] = startDate
    if endDate:
        params["endDate"] = endDate
    if status:
        params["status"] = status

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            url,
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        if resp.status_code == 401:
            # Force token refresh on next call
            _token_cache["expires"] = 0
            raise HTTPException(status_code=401, detail="DataSpace token expired, retry")
        if not resp.ok:
            raise HTTPException(status_code=resp.status_code, detail=f"DataSpace error: {resp.text}")

        raw = resp.json()

    # Normalise response — DataSpace may return data in different shapes
    records: list = []
    if isinstance(raw, list):
        records = raw
    elif isinstance(raw, dict):
        records = raw.get("data") or raw.get("records") or raw.get("result") or []

    work_orders = [WorkOrder(**r) for r in records]
    return WorkOrdersResponse(data=work_orders, total=len(work_orders))


@router.get("/stats", response_model=StatsResponse)
async def workorder_stats(
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    settings: Settings = Depends(get_settings),
):
    """Return aggregated status counts for the stats bar."""
    token = await get_dataspace_token(settings)

    collection = f"{settings.ds_plant_code}_jobDetails"
    url = f"{settings.gateway_base}/transaction/{collection}/records"

    params: dict = {}
    if startDate:
        params["startDate"] = startDate
    if endDate:
        params["endDate"] = endDate

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            url,
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        if not resp.ok:
            raise HTTPException(status_code=resp.status_code, detail=f"DataSpace error: {resp.text}")
        raw = resp.json()

    records: list = []
    if isinstance(raw, list):
        records = raw
    elif isinstance(raw, dict):
        records = raw.get("data") or raw.get("records") or raw.get("result") or []

    by_status: dict[str, int] = {}
    for r in records:
        s = r.get("jobStatus") or "Unknown"
        by_status[s] = by_status.get(s, 0) + 1

    return StatsResponse(total=len(records), byStatus=by_status)
