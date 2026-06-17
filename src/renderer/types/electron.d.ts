import type {
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
  QueryParams,
  PaginatedResult,
  Statistics
} from './index';

export interface ElectronAPI {
  company: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Company>>;
    get: (id: number) => Promise<Company | null>;
    create: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Company | null>;
    update: (id: number, data: Partial<Company>) => Promise<Company | null>;
    delete: (id: number) => Promise<boolean>;
  };

  equipment: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Equipment>>;
    get: (id: number) => Promise<Equipment | null>;
    create: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Equipment | null>;
    update: (id: number, data: Partial<Equipment>) => Promise<Equipment | null>;
    delete: (id: number) => Promise<boolean>;
  };

  inspector: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Inspector>>;
    get: (id: number) => Promise<Inspector | null>;
    create: (data: Omit<Inspector, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Inspector | null>;
    update: (id: number, data: Partial<Inspector>) => Promise<Inspector | null>;
    delete: (id: number) => Promise<boolean>;
  };

  application: {
    list: (params?: QueryParams) => Promise<PaginatedResult<InspectionApply>>;
    get: (id: number) => Promise<InspectionApply | null>;
    create: (data: Omit<InspectionApply, 'id' | 'createdAt' | 'updatedAt'>) => Promise<InspectionApply | null>;
    update: (id: number, data: Partial<InspectionApply>) => Promise<InspectionApply | null>;
    delete: (id: number) => Promise<boolean>;
  };

  schedule: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Schedule>>;
    get: (id: number) => Promise<Schedule | null>;
    create: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Schedule | null>;
    update: (id: number, data: Partial<Schedule>) => Promise<Schedule | null>;
    delete: (id: number) => Promise<boolean>;
  };

  hydrotest: {
    list: (params?: QueryParams) => Promise<PaginatedResult<HydroTest>>;
    get: (id: number) => Promise<HydroTest | null>;
    create: (data: Omit<HydroTest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HydroTest | null>;
    update: (id: number, data: Partial<HydroTest>) => Promise<HydroTest | null>;
    delete: (id: number) => Promise<boolean>;
  };

  valvetest: {
    list: (params?: QueryParams) => Promise<PaginatedResult<ValveTest>>;
    get: (id: number) => Promise<ValveTest | null>;
    create: (data: Omit<ValveTest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ValveTest | null>;
    update: (id: number, data: Partial<ValveTest>) => Promise<ValveTest | null>;
    delete: (id: number) => Promise<boolean>;
  };

  defect: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Defect>>;
    get: (id: number) => Promise<Defect | null>;
    create: (data: Omit<Defect, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Defect | null>;
    update: (id: number, data: Partial<Defect>) => Promise<Defect | null>;
    delete: (id: number) => Promise<boolean>;
  };

  report: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Report>>;
    get: (id: number) => Promise<Report | null>;
    create: (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Report | null>;
    update: (id: number, data: Partial<Report>) => Promise<Report | null>;
    delete: (id: number) => Promise<boolean>;
  };

  certificate: {
    list: (params?: QueryParams) => Promise<PaginatedResult<Certificate>>;
    get: (id: number) => Promise<Certificate | null>;
    create: (data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Certificate | null>;
    update: (id: number, data: Partial<Certificate>) => Promise<Certificate | null>;
    delete: (id: number) => Promise<boolean>;
    print: (id: number) => Promise<Certificate | null>;
  };

  statistics: {
    get: () => Promise<Statistics>;
  };

  platform: {
    os: string;
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
