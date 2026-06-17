import { contextBridge, ipcRenderer } from 'electron';
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
  Certificate,
  IpcResponse,
  QueryParams,
  PaginatedResult,
  Statistics
} from './types';

const invoke = async <T>(channel: string, ...args: unknown[]): Promise<T> => {
  const response = await ipcRenderer.invoke(channel, ...args) as IpcResponse<T>;
  if (!response.success) {
    throw new Error(response.error || '操作失败');
  }
  return response.data as T;
};

const api = {
  company: {
    list: (params?: QueryParams): Promise<PaginatedResult<Company>> =>
      invoke('company:list', params || {}),
    get: (id: number): Promise<Company | null> =>
      invoke('company:get', id),
    create: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company | null> =>
      invoke('company:create', data),
    update: (id: number, data: Partial<Company>): Promise<Company | null> =>
      invoke('company:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('company:delete', id)
  },

  equipment: {
    list: (params?: QueryParams): Promise<PaginatedResult<Equipment>> =>
      invoke('equipment:list', params || {}),
    get: (id: number): Promise<Equipment | null> =>
      invoke('equipment:get', id),
    create: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment | null> =>
      invoke('equipment:create', data),
    update: (id: number, data: Partial<Equipment>): Promise<Equipment | null> =>
      invoke('equipment:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('equipment:delete', id)
  },

  inspector: {
    list: (params?: QueryParams): Promise<PaginatedResult<Inspector>> =>
      invoke('inspector:list', params || {}),
    get: (id: number): Promise<Inspector | null> =>
      invoke('inspector:get', id),
    create: (data: Omit<Inspector, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inspector | null> =>
      invoke('inspector:create', data),
    update: (id: number, data: Partial<Inspector>): Promise<Inspector | null> =>
      invoke('inspector:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('inspector:delete', id)
  },

  application: {
    list: (params?: QueryParams): Promise<PaginatedResult<InspectionApply>> =>
      invoke('application:list', params || {}),
    get: (id: number): Promise<InspectionApply | null> =>
      invoke('application:get', id),
    create: (data: Omit<InspectionApply, 'id' | 'createdAt' | 'updatedAt'>): Promise<InspectionApply | null> =>
      invoke('application:create', data),
    update: (id: number, data: Partial<InspectionApply>): Promise<InspectionApply | null> =>
      invoke('application:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('application:delete', id)
  },

  schedule: {
    list: (params?: QueryParams): Promise<PaginatedResult<Schedule>> =>
      invoke('schedule:list', params || {}),
    get: (id: number): Promise<Schedule | null> =>
      invoke('schedule:get', id),
    create: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule | null> =>
      invoke('schedule:create', data),
    update: (id: number, data: Partial<Schedule>): Promise<Schedule | null> =>
      invoke('schedule:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('schedule:delete', id)
  },

  hydrotest: {
    list: (params?: QueryParams): Promise<PaginatedResult<HydroTest>> =>
      invoke('hydrotest:list', params || {}),
    get: (id: number): Promise<HydroTest | null> =>
      invoke('hydrotest:get', id),
    create: (data: Omit<HydroTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<HydroTest | null> =>
      invoke('hydrotest:create', data),
    update: (id: number, data: Partial<HydroTest>): Promise<HydroTest | null> =>
      invoke('hydrotest:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('hydrotest:delete', id)
  },

  valvetest: {
    list: (params?: QueryParams): Promise<PaginatedResult<ValveTest>> =>
      invoke('valvetest:list', params || {}),
    get: (id: number): Promise<ValveTest | null> =>
      invoke('valvetest:get', id),
    create: (data: Omit<ValveTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ValveTest | null> =>
      invoke('valvetest:create', data),
    update: (id: number, data: Partial<ValveTest>): Promise<ValveTest | null> =>
      invoke('valvetest:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('valvetest:delete', id)
  },

  defect: {
    list: (params?: QueryParams): Promise<PaginatedResult<Defect>> =>
      invoke('defect:list', params || {}),
    get: (id: number): Promise<Defect | null> =>
      invoke('defect:get', id),
    create: (data: Omit<Defect, 'id' | 'createdAt' | 'updatedAt'>): Promise<Defect | null> =>
      invoke('defect:create', data),
    update: (id: number, data: Partial<Defect>): Promise<Defect | null> =>
      invoke('defect:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('defect:delete', id)
  },

  report: {
    list: (params?: QueryParams): Promise<PaginatedResult<Report>> =>
      invoke('report:list', params || {}),
    get: (id: number): Promise<Report | null> =>
      invoke('report:get', id),
    create: (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report | null> =>
      invoke('report:create', data),
    update: (id: number, data: Partial<Report>): Promise<Report | null> =>
      invoke('report:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('report:delete', id)
  },

  certificate: {
    list: (params?: QueryParams): Promise<PaginatedResult<Certificate>> =>
      invoke('certificate:list', params || {}),
    get: (id: number): Promise<Certificate | null> =>
      invoke('certificate:get', id),
    create: (data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Certificate | null> =>
      invoke('certificate:create', data),
    update: (id: number, data: Partial<Certificate>): Promise<Certificate | null> =>
      invoke('certificate:update', { id, data }),
    delete: (id: number): Promise<boolean> =>
      invoke('certificate:delete', id),
    print: (id: number): Promise<Certificate | null> =>
      invoke('certificate:print', id)
  },

  statistics: {
    get: (): Promise<Statistics> =>
      invoke('statistics:get')
  },

  platform: {
    os: process.platform,
    isWindows: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux'
  }
};

export type ElectronAPI = typeof api;

contextBridge.exposeInMainWorld('electronAPI', api);
