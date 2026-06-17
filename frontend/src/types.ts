export interface WorkOrder {
  jobNumber?: string;
  jobStatus?: string;
  jobQty?: number;
  jobCompletion?: number;
  jobScrapQuantity?: string;
  jobCreationDate?: string;
  jobCompletionDate?: string;
  lastUpdateDate?: string;
  soNumber?: string;
  soCreationDate?: string;
  customerName?: string;
  customerNumber?: string;
  soLineNumber?: string;
  itemCode?: string;
  description?: string;
  umo?: string;
  soQty?: string;
  requestDate?: string;
  productType?: string;
  fPI?: string;
  dia?: string;
  pitch?: string;
  length?: string;
  row?: string;
  height?: string;
  qnty?: string;
  L1?: string;
  L2?: string;
  L3?: string;
  L4?: string;
  strightBend?: string;
  customerApproved?: string;
}

export interface WorkOrdersResponse {
  data: WorkOrder[];
  total: number;
}

export interface StatsResponse {
  total: number;
  byStatus: Record<string, number>;
}

export interface FilterState {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}
