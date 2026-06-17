export interface WorkOrder {
  jobNumber?: string;
  jobCode?: string;
  itemCode?: string;
  itemDescription?: string;
  customerName?: string;
  customerNumber?: string;
  soNumber?: string;
  soLineNumber?: string;
  soQty?: number;
  jobQty?: number;
  completedQty?: number;
  jobStatus?: string;
  requestDate?: string;
  startDate?: string;
  completionDate?: string;
  soCreationDate?: string;
  plantCode?: string;
  remarks?: string;
  [key: string]: unknown;
}

export interface DataSpaceCreds {
  client_id: string;
  client_secret: string;
  company_code: string;
  plant_code: string;
  environment: string;
}
