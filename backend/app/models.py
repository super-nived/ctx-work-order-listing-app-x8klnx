from pydantic import BaseModel
from typing import Optional


class WorkOrder(BaseModel):
    jobNumber: Optional[str] = None
    jobStatus: Optional[str] = None
    jobQty: Optional[float] = None
    jobCompletion: Optional[float] = None
    jobScrapQuantity: Optional[str] = None
    jobCreationDate: Optional[str] = None
    jobCompletionDate: Optional[str] = None
    lastUpdateDate: Optional[str] = None
    soNumber: Optional[str] = None
    soCreationDate: Optional[str] = None
    customerName: Optional[str] = None
    customerNumber: Optional[str] = None
    soLineNumber: Optional[str] = None
    itemCode: Optional[str] = None
    description: Optional[str] = None
    umo: Optional[str] = None
    soQty: Optional[str] = None
    requestDate: Optional[str] = None
    productType: Optional[str] = None
    fPI: Optional[str] = None
    dia: Optional[str] = None
    pitch: Optional[str] = None
    length: Optional[str] = None
    row: Optional[str] = None
    height: Optional[str] = None
    qnty: Optional[str] = None
    L1: Optional[str] = None
    L2: Optional[str] = None
    L3: Optional[str] = None
    L4: Optional[str] = None
    strightBend: Optional[str] = None
    customerApproved: Optional[str] = None


class WorkOrdersResponse(BaseModel):
    data: list[WorkOrder]
    total: int


class StatsResponse(BaseModel):
    total: int
    byStatus: dict[str, int]
