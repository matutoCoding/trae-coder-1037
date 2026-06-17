import {
  Company,
  Equipment,
  Inspector,
  InspectionApply,
  Schedule,
  HydroTest,
  ValveTest,
  Defect,
  Report,
  Certificate
} from '../database/schema';

export type {
  Company,
  Equipment,
  Inspector,
  InspectionApply,
  Schedule,
  HydroTest,
  ValveTest,
  Defect,
  Report,
  Certificate
};

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  companyId?: number;
  equipmentId?: number;
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Statistics {
  totalEquipment: number;
  normalEquipment: number;
  maintenanceEquipment: number;
  decommissionedEquipment: number;
  scrappedEquipment: number;
  pendingApplications: number;
  approvedApplications: number;
  scheduledInspections: number;
  inProgressInspections: number;
  completedInspections: number;
  openDefects: number;
  minorDefects: number;
  generalDefects: number;
  majorDefects: number;
  criticalDefects: number;
  validCertificates: number;
  expiringCertificates: number;
  expiredCertificates: number;
  todayInspections: number;
  thisMonthInspections: number;
  thisMonthPassRate: number;
  monthlyInspections: { month: string; count: number; passRate: number; defectCount: number }[];
  defectByLevel: { level: string; count: number }[];
  equipmentByStatus: { status: string; count: number }[];
  inspectionByResult: { result: string; count: number }[];
}

export type IpcChannel =
  | 'company:list'
  | 'company:get'
  | 'company:create'
  | 'company:update'
  | 'company:delete'
  | 'equipment:list'
  | 'equipment:get'
  | 'equipment:create'
  | 'equipment:update'
  | 'equipment:delete'
  | 'inspector:list'
  | 'inspector:get'
  | 'inspector:create'
  | 'inspector:update'
  | 'inspector:delete'
  | 'application:list'
  | 'application:get'
  | 'application:create'
  | 'application:update'
  | 'application:delete'
  | 'schedule:list'
  | 'schedule:get'
  | 'schedule:create'
  | 'schedule:update'
  | 'schedule:delete'
  | 'hydrotest:list'
  | 'hydrotest:get'
  | 'hydrotest:create'
  | 'hydrotest:update'
  | 'hydrotest:delete'
  | 'valvetest:list'
  | 'valvetest:get'
  | 'valvetest:create'
  | 'valvetest:update'
  | 'valvetest:delete'
  | 'defect:list'
  | 'defect:get'
  | 'defect:create'
  | 'defect:update'
  | 'defect:delete'
  | 'report:list'
  | 'report:get'
  | 'report:create'
  | 'report:update'
  | 'report:delete'
  | 'certificate:list'
  | 'certificate:get'
  | 'certificate:create'
  | 'certificate:update'
  | 'certificate:delete'
  | 'certificate:print'
  | 'statistics:get';
