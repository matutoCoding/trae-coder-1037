export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RequestOptions {
  showLoading?: boolean;
  showError?: boolean;
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

export type EquipmentStatus = 'normal' | 'maintenance' | 'decommissioned' | 'scrapped';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'inspecting' | 'completed' | 'cancelled';
export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
export type DefectLevel = 'minor' | 'general' | 'major' | 'critical';
export type DefectStatus = 'pending' | 'processing' | 'repaired' | 'rechecking' | 'closed';
export type CertificateStatus = 'valid' | 'expired' | 'revoked' | 'suspended';
export type CertificateType = 'inspection' | 'use_registration' | 'qualification';
export type TestResult = 'qualified' | 'unqualified' | 'pending';
export type SealingPerformance = 'qualified' | 'unqualified';
export type ReportStatus = 'draft' | 'reviewing' | 'approved' | 'rejected' | 'issued';
export type ReportResult = 'qualified' | 'unqualified' | 'conditional_qualified';
export type InspectionType = 'periodic' | 'supervision' | 'commissioning' | 'reinspection';
export type InspectionNature = 'regular' | 'special';

export interface Company {
  id: number;
  name: string;
  unifiedSocialCreditCode: string;
  legalPerson: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  industryType: string;
  enterpriseScale: string;
  establishmentDate: string;
  businessScope: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: number;
  companyId: number;
  equipmentCode: string;
  equipmentName: string;
  equipmentType: string;
  modelSpecification: string;
  designPressure: number;
  designTemperature: number;
  workingPressure: number;
  workingTemperature: number;
  volume?: number;
  diameter?: number;
  wallThickness?: number;
  material?: string;
  manufactureDate: string;
  commissioningDate: string;
  installationLocation: string;
  useRegistrationCode: string;
  nextInspectionDate: string;
  lastInspectionDate?: string;
  equipmentStatus: EquipmentStatus;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inspector {
  id: number;
  employeeNo: string;
  name: string;
  gender: 'male' | 'female';
  idCard: string;
  phone: string;
  email?: string;
  department: string;
  position: string;
  qualificationLevel: string;
  qualificationCertificateNo: string;
  qualificationExpiryDate: string;
  inspectionScope: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'leave';
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionApply {
  id: number;
  applyNo: string;
  companyId: number;
  equipmentId: number;
  inspectionType: InspectionType;
  inspectionNature: InspectionNature;
  applyDate: string;
  applyReason: string;
  applicant: string;
  applicantPhone: string;
  status: ApplicationStatus;
  approverId?: number;
  approvalOpinion?: string;
  approvalDate?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  scheduleNo: string;
  applyId: number;
  companyId: number;
  equipmentId: number;
  inspectionType: string;
  planDate: string;
  planStartTime: string;
  planEndTime: string;
  actualDate?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  inspectorIds: string;
  mainInspectorId: number;
  inspectionLocation: string;
  preparationItems?: string;
  status: ScheduleStatus;
  cancelReason?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HydroTest {
  id: number;
  scheduleId: number;
  equipmentId: number;
  testDate: string;
  testMethod: string;
  testMedium: string;
  mediumTemperature: number;
  testPressure: number;
  pressureHoldingTime: number;
  pressureDrop?: number;
  testEnvironment: string;
  inspectionSituation: string;
  leakageSituation?: string;
  deformationSituation?: string;
  testResult: TestResult;
  testerId: number;
  witness?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValveTest {
  id: number;
  scheduleId: number;
  equipmentId: number;
  valveName: string;
  valveModel: string;
  valveNo: string;
  specification: string;
  manufacturer?: string;
  factoryDate?: string;
  testDate: string;
  setPressure: number;
  testPressure: number;
  seatPressure: number;
  backPressure?: number;
  testMedium: string;
  dischargeCapacity?: number;
  sealingPerformance: SealingPerformance;
  openingPressureDeviation?: number;
  testResult: TestResult;
  adjustmentMethod?: string;
  testerId: number;
  remark?: string;
  nextTestDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Defect {
  id: number;
  scheduleId: number;
  equipmentId: number;
  defectNo: string;
  defectType: string;
  defectLevel: DefectLevel;
  defectLocation: string;
  defectDescription: string;
  discoveryMethod: string;
  discoveryDate: string;
  defectSize?: string;
  defectArea?: number;
  defectDepth?: number;
  causeAnalysis?: string;
  treatmentSuggestion: string;
  handlerId?: number;
  treatmentResult?: string;
  treatmentDate?: string;
  recheckResult?: string;
  recheckDate?: string;
  status: DefectStatus;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: number;
  reportNo: string;
  applyId: number;
  scheduleId: number;
  companyId: number;
  equipmentId: number;
  inspectionType: string;
  inspectionBasis: string;
  inspectionDate: string;
  inspectorIds: string;
  mainInspectorId: number;
  equipmentOverview: string;
  inspectionItems: string;
  inspectionProcess: string;
  defectList?: string;
  hydroTestId?: number;
  valveTestIds?: string;
  overallResult: ReportResult;
  handlingOpinion: string;
  nextInspectionDate: string;
  reportEditorId: number;
  reportEditorDate: string;
  reviewerId?: number;
  reviewerOpinion?: string;
  reviewDate?: string;
  approverId?: number;
  approverOpinion?: string;
  approvalDate?: string;
  status: ReportStatus;
  issueDate?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: number;
  certificateNo: string;
  reportId: number;
  companyId: number;
  equipmentId: number;
  certificateType: CertificateType;
  issueDate: string;
  validFrom: string;
  validTo: string;
  issuingAuthority: string;
  issuer: string;
  inspectionConclusion: string;
  equipmentInfo: string;
  remarks?: string;
  status: CertificateStatus;
  revokeReason?: string;
  revokeDate?: string;
  printCount?: number;
  lastPrintDate?: string;
  createdAt: string;
  updatedAt: string;
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
  monthlyInspections: { month: string; count: number }[];
  defectByLevel: { level: string; count: number }[];
  equipmentByStatus: { status: string; count: number }[];
  inspectionByResult: { result: string; count: number }[];
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'inspector' | 'reviewer' | 'operator';
  phone: string;
  email: string;
  department: string;
  status: 'active' | 'inactive';
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}
