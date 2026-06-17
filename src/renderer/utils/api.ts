import type {
  Equipment,
  InspectionApply,
  Schedule,
  HydroTest,
  ValveTest,
  Defect,
  Certificate,
  Report,
  Company,
  Inspector,
  Statistics,
  RequestOptions,
  EquipmentStatus,
  ApplicationStatus,
  ScheduleStatus,
  DefectLevel,
  DefectStatus,
  CertificateStatus,
  CertificateType,
  TestResult,
  SealingPerformance,
  ReportStatus,
  ReportResult,
  InspectionType,
  InspectionNature,
} from '@/types';

const electronAPI = window.electronAPI;

export interface ApiOptions extends RequestOptions {}

const handleError = (error: unknown, options: ApiOptions = {}): never => {
  const { showError = true } = options;
  const err = error as Error;
  if (showError) {
    console.error(err);
  }
  throw err;
};

export const equipmentApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.equipment.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.equipment.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.equipment.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Equipment>, options?: ApiOptions) =>
    electronAPI.equipment.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.equipment.delete(id).catch(err => handleError(err, options)),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '正常', value: 'normal' as EquipmentStatus },
      { label: '维护中', value: 'maintenance' as EquipmentStatus },
      { label: '停用', value: 'decommissioned' as EquipmentStatus },
      { label: '报废', value: 'scrapped' as EquipmentStatus },
    ]),

  getTypeOptions: () =>
    Promise.resolve([
      { label: '蒸汽锅炉', value: 'steam' },
      { label: '热水锅炉', value: 'hot_water' },
      { label: '有机热载体锅炉', value: 'organic' },
      { label: '电站锅炉', value: 'power' },
      { label: '压力容器', value: 'pressure_vessel' },
      { label: '压力管道', value: 'pressure_pipe' },
    ]),
};

export const companyApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.company.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.company.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.company.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Company>, options?: ApiOptions) =>
    electronAPI.company.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.company.delete(id).catch(err => handleError(err, options)),
};

export const inspectorApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.inspector.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.inspector.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Inspector, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.inspector.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Inspector>, options?: ApiOptions) =>
    electronAPI.inspector.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.inspector.delete(id).catch(err => handleError(err, options)),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '在职', value: 'active' },
      { label: '离职', value: 'leave' },
      { label: '停职', value: 'inactive' },
    ]),
};

export const applicationApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.application.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.application.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<InspectionApply, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.application.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<InspectionApply>, options?: ApiOptions) =>
    electronAPI.application.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.application.delete(id).catch(err => handleError(err, options)),

  review: (id: number, data: { status: ApplicationStatus; approvalOpinion: string }, options?: ApiOptions) =>
    electronAPI.application.update(id, data).catch(err => handleError(err, options)),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '待受理', value: 'pending' as ApplicationStatus },
      { label: '已受理', value: 'approved' as ApplicationStatus },
      { label: '已驳回', value: 'rejected' as ApplicationStatus },
      { label: '已排期', value: 'scheduled' as ApplicationStatus },
      { label: '检验中', value: 'inspecting' as ApplicationStatus },
      { label: '已完成', value: 'completed' as ApplicationStatus },
      { label: '已取消', value: 'cancelled' as ApplicationStatus },
    ]),

  getTypeOptions: () =>
    Promise.resolve([
      { label: '定期检验', value: 'periodic' as InspectionType },
      { label: '监督检验', value: 'supervision' as InspectionType },
      { label: '安装监检', value: 'commissioning' as InspectionType },
      { label: '复检', value: 'reinspection' as InspectionType },
    ]),

  getNatureOptions: () =>
    Promise.resolve([
      { label: '常规检验', value: 'regular' as InspectionNature },
      { label: '专项检验', value: 'special' as InspectionNature },
    ]),
};

export const scheduleApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.schedule.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.schedule.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.schedule.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Schedule>, options?: ApiOptions) =>
    electronAPI.schedule.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.schedule.delete(id).catch(err => handleError(err, options)),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '已排期', value: 'scheduled' as ScheduleStatus },
      { label: '进行中', value: 'in_progress' as ScheduleStatus },
      { label: '已完成', value: 'completed' as ScheduleStatus },
      { label: '已取消', value: 'cancelled' as ScheduleStatus },
      { label: '已延期', value: 'postponed' as ScheduleStatus },
    ]),
};

export const hydrotestApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.hydrotest.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.hydrotest.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<HydroTest, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.hydrotest.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<HydroTest>, options?: ApiOptions) =>
    electronAPI.hydrotest.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.hydrotest.delete(id).catch(err => handleError(err, options)),

  getResultOptions: () =>
    Promise.resolve([
      { label: '合格', value: 'qualified' as TestResult },
      { label: '不合格', value: 'unqualified' as TestResult },
      { label: '待判定', value: 'pending' as TestResult },
    ]),
};

export const valvetestApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.valvetest.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.valvetest.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<ValveTest, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.valvetest.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<ValveTest>, options?: ApiOptions) =>
    electronAPI.valvetest.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.valvetest.delete(id).catch(err => handleError(err, options)),

  getResultOptions: () =>
    Promise.resolve([
      { label: '合格', value: 'qualified' as TestResult },
      { label: '不合格', value: 'unqualified' as TestResult },
      { label: '待判定', value: 'pending' as TestResult },
    ]),

  getSealingOptions: () =>
    Promise.resolve([
      { label: '合格', value: 'qualified' as SealingPerformance },
      { label: '不合格', value: 'unqualified' as SealingPerformance },
    ]),
};

export const defectApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.defect.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.defect.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Defect, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.defect.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Defect>, options?: ApiOptions) =>
    electronAPI.defect.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.defect.delete(id).catch(err => handleError(err, options)),

  getLevelOptions: () =>
    Promise.resolve([
      { label: '轻微', value: 'minor' as DefectLevel },
      { label: '一般', value: 'general' as DefectLevel },
      { label: '严重', value: 'major' as DefectLevel },
      { label: '重大', value: 'critical' as DefectLevel },
    ]),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '待处理', value: 'pending' as DefectStatus },
      { label: '处理中', value: 'processing' as DefectStatus },
      { label: '已修复', value: 'repaired' as DefectStatus },
      { label: '复查中', value: 'rechecking' as DefectStatus },
      { label: '已关闭', value: 'closed' as DefectStatus },
    ]),

  getTypeOptions: () =>
    Promise.resolve([
      { label: '腐蚀', value: 'corrosion' },
      { label: '焊缝缺陷', value: 'weld_defect' },
      { label: '泄漏', value: 'leakage' },
      { label: '变形', value: 'deformation' },
      { label: '裂纹', value: 'crack' },
      { label: '其他', value: 'other' },
    ]),
};

export const reportApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.report.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.report.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.report.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Report>, options?: ApiOptions) =>
    electronAPI.report.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.report.delete(id).catch(err => handleError(err, options)),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '草稿', value: 'draft' as ReportStatus },
      { label: '审核中', value: 'reviewing' as ReportStatus },
      { label: '已批准', value: 'approved' as ReportStatus },
      { label: '已驳回', value: 'rejected' as ReportStatus },
      { label: '已签发', value: 'issued' as ReportStatus },
    ]),

  getResultOptions: () =>
    Promise.resolve([
      { label: '合格', value: 'qualified' as ReportResult },
      { label: '不合格', value: 'unqualified' as ReportResult },
      { label: '有条件合格', value: 'conditional_qualified' as ReportResult },
    ]),
};

export const certificateApi = {
  getList: (params?: Record<string, unknown>, options?: ApiOptions) =>
    electronAPI.certificate.list(params).catch(err => handleError(err, options)),

  getDetail: (id: number, options?: ApiOptions) =>
    electronAPI.certificate.get(id).catch(err => handleError(err, options)),

  create: (data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>, options?: ApiOptions) =>
    electronAPI.certificate.create(data).catch(err => handleError(err, options)),

  update: (id: number, data: Partial<Certificate>, options?: ApiOptions) =>
    electronAPI.certificate.update(id, data).catch(err => handleError(err, options)),

  delete: (id: number, options?: ApiOptions) =>
    electronAPI.certificate.delete(id).catch(err => handleError(err, options)),

  issue: (id: number, options?: ApiOptions) =>
    electronAPI.certificate.update(id, { status: 'valid' as CertificateStatus }).catch(err => handleError(err, options)),

  revoke: (id: number, reason: string, options?: ApiOptions) =>
    electronAPI.certificate.update(id, {
      status: 'revoked' as CertificateStatus,
      revokeReason: reason,
      revokeDate: new Date().toISOString().split('T')[0],
    }).catch(err => handleError(err, options)),

  print: (id: number, options?: ApiOptions) =>
    electronAPI.certificate.print(id).catch(err => handleError(err, options)),

  getStatusOptions: () =>
    Promise.resolve([
      { label: '有效', value: 'valid' as CertificateStatus },
      { label: '已过期', value: 'expired' as CertificateStatus },
      { label: '已吊销', value: 'revoked' as CertificateStatus },
      { label: '已暂停', value: 'suspended' as CertificateStatus },
    ]),

  getTypeOptions: () =>
    Promise.resolve([
      { label: '检验证书', value: 'inspection' as CertificateType },
      { label: '使用登记证', value: 'use_registration' as CertificateType },
      { label: '资格证书', value: 'qualification' as CertificateType },
    ]),
};

export const statisticsApi = {
  get: (options?: ApiOptions): Promise<Statistics> =>
    electronAPI.statistics.get().catch(err => handleError(err, options)),

  getYearOptions: () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push({ label: `${currentYear - i}年`, value: currentYear - i });
    }
    return Promise.resolve(years);
  },
};
