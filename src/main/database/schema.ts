export interface Company {
  id?: number;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Equipment {
  id?: number;
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
  equipmentStatus: 'normal' | 'maintenance' | 'decommissioned' | 'scrapped';
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inspector {
  id?: number;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface InspectionApply {
  id?: number;
  applyNo: string;
  companyId: number;
  equipmentId: number;
  inspectionType: 'periodic' | 'supervision' | 'commissioning' | 'reinspection';
  inspectionNature: 'regular' | 'special';
  applyDate: string;
  applyReason: string;
  applicant: string;
  applicantPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'inspecting' | 'completed' | 'cancelled';
  approverId?: number;
  approvalOpinion?: string;
  approvalDate?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  id?: number;
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
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  cancelReason?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HydroTest {
  id?: number;
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
  testResult: 'qualified' | 'unqualified' | 'pending';
  testerId: number;
  witness?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValveTest {
  id?: number;
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
  sealingPerformance: 'qualified' | 'unqualified';
  openingPressureDeviation?: number;
  testResult: 'qualified' | 'unqualified' | 'pending';
  adjustmentMethod?: string;
  testerId: number;
  remark?: string;
  nextTestDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Defect {
  id?: number;
  scheduleId: number;
  equipmentId: number;
  defectNo: string;
  defectType: string;
  defectLevel: 'minor' | 'general' | 'major' | 'critical';
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
  status: 'pending' | 'processing' | 'repaired' | 'rechecking' | 'closed';
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  id?: number;
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
  overallResult: 'qualified' | 'unqualified' | 'conditional_qualified';
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
  status: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'issued';
  issueDate?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificate {
  id?: number;
  certificateNo: string;
  reportId: number;
  companyId: number;
  equipmentId: number;
  certificateType: 'inspection' | 'use_registration' | 'qualification';
  issueDate: string;
  validFrom: string;
  validTo: string;
  issuingAuthority: string;
  issuer: string;
  inspectionConclusion: string;
  equipmentInfo: string;
  remarks?: string;
  status: 'valid' | 'expired' | 'revoked' | 'suspended';
  revokeReason?: string;
  revokeDate?: string;
  printCount?: number;
  lastPrintDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CREATE_TABLE_COMPANY = `
CREATE TABLE IF NOT EXISTS company (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unifiedSocialCreditCode TEXT NOT NULL UNIQUE,
  legalPerson TEXT NOT NULL,
  contactPerson TEXT NOT NULL,
  contactPhone TEXT NOT NULL,
  address TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  industryType TEXT NOT NULL,
  enterpriseScale TEXT NOT NULL,
  establishmentDate TEXT NOT NULL,
  businessScope TEXT,
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_TABLE_EQUIPMENT = `
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyId INTEGER NOT NULL,
  equipmentCode TEXT NOT NULL UNIQUE,
  equipmentName TEXT NOT NULL,
  equipmentType TEXT NOT NULL,
  modelSpecification TEXT NOT NULL,
  designPressure REAL NOT NULL,
  designTemperature REAL NOT NULL,
  workingPressure REAL NOT NULL,
  workingTemperature REAL NOT NULL,
  volume REAL,
  diameter REAL,
  wallThickness REAL,
  material TEXT,
  manufactureDate TEXT NOT NULL,
  commissioningDate TEXT NOT NULL,
  installationLocation TEXT NOT NULL,
  useRegistrationCode TEXT NOT NULL UNIQUE,
  nextInspectionDate TEXT NOT NULL,
  lastInspectionDate TEXT,
  equipmentStatus TEXT NOT NULL DEFAULT 'normal',
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES company(id) ON DELETE CASCADE
);
`;

export const CREATE_TABLE_INSPECTOR = `
CREATE TABLE IF NOT EXISTS inspector (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeNo TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  idCard TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  email TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  qualificationLevel TEXT NOT NULL,
  qualificationCertificateNo TEXT NOT NULL UNIQUE,
  qualificationExpiryDate TEXT NOT NULL,
  inspectionScope TEXT NOT NULL,
  hireDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_TABLE_INSPECTION_APPLY = `
CREATE TABLE IF NOT EXISTS inspection_apply (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applyNo TEXT NOT NULL UNIQUE,
  companyId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  inspectionType TEXT NOT NULL,
  inspectionNature TEXT NOT NULL,
  applyDate TEXT NOT NULL,
  applyReason TEXT NOT NULL,
  applicant TEXT NOT NULL,
  applicantPhone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approverId INTEGER,
  approvalOpinion TEXT,
  approvalDate TEXT,
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES company(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (approverId) REFERENCES inspector(id)
);
`;

export const CREATE_TABLE_SCHEDULE = `
CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scheduleNo TEXT NOT NULL UNIQUE,
  applyId INTEGER NOT NULL,
  companyId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  inspectionType TEXT NOT NULL,
  planDate TEXT NOT NULL,
  planStartTime TEXT NOT NULL,
  planEndTime TEXT NOT NULL,
  actualDate TEXT,
  actualStartTime TEXT,
  actualEndTime TEXT,
  inspectorIds TEXT NOT NULL,
  mainInspectorId INTEGER NOT NULL,
  inspectionLocation TEXT NOT NULL,
  preparationItems TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  cancelReason TEXT,
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applyId) REFERENCES inspection_apply(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES company(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (mainInspectorId) REFERENCES inspector(id)
);
`;

export const CREATE_TABLE_HYDRO_TEST = `
CREATE TABLE IF NOT EXISTS hydro_test (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scheduleId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  testDate TEXT NOT NULL,
  testMethod TEXT NOT NULL,
  testMedium TEXT NOT NULL,
  mediumTemperature REAL NOT NULL,
  testPressure REAL NOT NULL,
  pressureHoldingTime INTEGER NOT NULL,
  pressureDrop REAL,
  testEnvironment TEXT NOT NULL,
  inspectionSituation TEXT NOT NULL,
  leakageSituation TEXT,
  deformationSituation TEXT,
  testResult TEXT NOT NULL DEFAULT 'pending',
  testerId INTEGER NOT NULL,
  witness TEXT,
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheduleId) REFERENCES schedule(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (testerId) REFERENCES inspector(id)
);
`;

export const CREATE_TABLE_VALVE_TEST = `
CREATE TABLE IF NOT EXISTS valve_test (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scheduleId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  valveName TEXT NOT NULL,
  valveModel TEXT NOT NULL,
  valveNo TEXT NOT NULL,
  specification TEXT NOT NULL,
  manufacturer TEXT,
  factoryDate TEXT,
  testDate TEXT NOT NULL,
  setPressure REAL NOT NULL,
  testPressure REAL NOT NULL,
  seatPressure REAL NOT NULL,
  backPressure REAL,
  testMedium TEXT NOT NULL,
  dischargeCapacity REAL,
  sealingPerformance TEXT NOT NULL,
  openingPressureDeviation REAL,
  testResult TEXT NOT NULL DEFAULT 'pending',
  adjustmentMethod TEXT,
  testerId INTEGER NOT NULL,
  remark TEXT,
  nextTestDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheduleId) REFERENCES schedule(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (testerId) REFERENCES inspector(id)
);
`;

export const CREATE_TABLE_DEFECT = `
CREATE TABLE IF NOT EXISTS defect (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scheduleId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  defectNo TEXT NOT NULL UNIQUE,
  defectType TEXT NOT NULL,
  defectLevel TEXT NOT NULL,
  defectLocation TEXT NOT NULL,
  defectDescription TEXT NOT NULL,
  discoveryMethod TEXT NOT NULL,
  discoveryDate TEXT NOT NULL,
  defectSize TEXT,
  defectArea REAL,
  defectDepth REAL,
  causeAnalysis TEXT,
  treatmentSuggestion TEXT NOT NULL,
  handlerId INTEGER,
  treatmentResult TEXT,
  treatmentDate TEXT,
  recheckResult TEXT,
  recheckDate TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheduleId) REFERENCES schedule(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (handlerId) REFERENCES inspector(id)
);
`;

export const CREATE_TABLE_REPORT = `
CREATE TABLE IF NOT EXISTS report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportNo TEXT NOT NULL UNIQUE,
  applyId INTEGER NOT NULL,
  scheduleId INTEGER NOT NULL,
  companyId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  inspectionType TEXT NOT NULL,
  inspectionBasis TEXT NOT NULL,
  inspectionDate TEXT NOT NULL,
  inspectorIds TEXT NOT NULL,
  mainInspectorId INTEGER NOT NULL,
  equipmentOverview TEXT NOT NULL,
  inspectionItems TEXT NOT NULL,
  inspectionProcess TEXT NOT NULL,
  defectList TEXT,
  hydroTestId INTEGER,
  valveTestIds TEXT,
  overallResult TEXT NOT NULL,
  handlingOpinion TEXT NOT NULL,
  nextInspectionDate TEXT NOT NULL,
  reportEditorId INTEGER NOT NULL,
  reportEditorDate TEXT NOT NULL,
  reviewerId INTEGER,
  reviewerOpinion TEXT,
  reviewDate TEXT,
  approverId INTEGER,
  approverOpinion TEXT,
  approvalDate TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  issueDate TEXT,
  remark TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applyId) REFERENCES inspection_apply(id) ON DELETE CASCADE,
  FOREIGN KEY (scheduleId) REFERENCES schedule(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES company(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (mainInspectorId) REFERENCES inspector(id),
  FOREIGN KEY (reportEditorId) REFERENCES inspector(id),
  FOREIGN KEY (reviewerId) REFERENCES inspector(id),
  FOREIGN KEY (approverId) REFERENCES inspector(id),
  FOREIGN KEY (hydroTestId) REFERENCES hydro_test(id)
);
`;

export const CREATE_TABLE_CERTIFICATE = `
CREATE TABLE IF NOT EXISTS certificate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificateNo TEXT NOT NULL UNIQUE,
  reportId INTEGER NOT NULL,
  companyId INTEGER NOT NULL,
  equipmentId INTEGER NOT NULL,
  certificateType TEXT NOT NULL,
  issueDate TEXT NOT NULL,
  validFrom TEXT NOT NULL,
  validTo TEXT NOT NULL,
  issuingAuthority TEXT NOT NULL,
  issuer TEXT NOT NULL,
  inspectionConclusion TEXT NOT NULL,
  equipmentInfo TEXT NOT NULL,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'valid',
  revokeReason TEXT,
  revokeDate TEXT,
  printCount INTEGER DEFAULT 0,
  lastPrintDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reportId) REFERENCES report(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES company(id) ON DELETE CASCADE,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE
);
`;

export const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(companyId);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(equipmentStatus);
CREATE INDEX IF NOT EXISTS idx_equipment_next_inspection ON equipment(nextInspectionDate);
CREATE INDEX IF NOT EXISTS idx_apply_company ON inspection_apply(companyId);
CREATE INDEX IF NOT EXISTS idx_apply_equipment ON inspection_apply(equipmentId);
CREATE INDEX IF NOT EXISTS idx_apply_status ON inspection_apply(status);
CREATE INDEX IF NOT EXISTS idx_apply_date ON inspection_apply(applyDate);
CREATE INDEX IF NOT EXISTS idx_schedule_apply ON schedule(applyId);
CREATE INDEX IF NOT EXISTS idx_schedule_equipment ON schedule(equipmentId);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(planDate);
CREATE INDEX IF NOT EXISTS idx_schedule_status ON schedule(status);
CREATE INDEX IF NOT EXISTS idx_schedule_inspector ON schedule(mainInspectorId);
CREATE INDEX IF NOT EXISTS idx_hydro_schedule ON hydro_test(scheduleId);
CREATE INDEX IF NOT EXISTS idx_hydro_equipment ON hydro_test(equipmentId);
CREATE INDEX IF NOT EXISTS idx_hydro_date ON hydro_test(testDate);
CREATE INDEX IF NOT EXISTS idx_valve_schedule ON valve_test(scheduleId);
CREATE INDEX IF NOT EXISTS idx_valve_equipment ON valve_test(equipmentId);
CREATE INDEX IF NOT EXISTS idx_valve_date ON valve_test(testDate);
CREATE INDEX IF NOT EXISTS idx_defect_schedule ON defect(scheduleId);
CREATE INDEX IF NOT EXISTS idx_defect_equipment ON defect(equipmentId);
CREATE INDEX IF NOT EXISTS idx_defect_level ON defect(defectLevel);
CREATE INDEX IF NOT EXISTS idx_defect_status ON defect(status);
CREATE INDEX IF NOT EXISTS idx_report_apply ON report(applyId);
CREATE INDEX IF NOT EXISTS idx_report_equipment ON report(equipmentId);
CREATE INDEX IF NOT EXISTS idx_report_status ON report(status);
CREATE INDEX IF NOT EXISTS idx_report_date ON report(inspectionDate);
CREATE INDEX IF NOT EXISTS idx_certificate_report ON certificate(reportId);
CREATE INDEX IF NOT EXISTS idx_certificate_equipment ON certificate(equipmentId);
CREATE INDEX IF NOT EXISTS idx_certificate_status ON certificate(status);
CREATE INDEX IF NOT EXISTS idx_certificate_valid ON certificate(validTo);
CREATE INDEX IF NOT EXISTS idx_inspector_status ON inspector(status);
CREATE INDEX IF NOT EXISTS idx_inspector_department ON inspector(department);
`;

export const CREATE_TABLES = [
  CREATE_TABLE_COMPANY,
  CREATE_TABLE_EQUIPMENT,
  CREATE_TABLE_INSPECTOR,
  CREATE_TABLE_INSPECTION_APPLY,
  CREATE_TABLE_SCHEDULE,
  CREATE_TABLE_HYDRO_TEST,
  CREATE_TABLE_VALVE_TEST,
  CREATE_TABLE_DEFECT,
  CREATE_TABLE_REPORT,
  CREATE_TABLE_CERTIFICATE,
];

export type TableName =
  | 'company'
  | 'equipment'
  | 'inspector'
  | 'inspection_apply'
  | 'schedule'
  | 'hydro_test'
  | 'valve_test'
  | 'defect'
  | 'report'
  | 'certificate';

export type TableTypeMap = {
  company: Company;
  equipment: Equipment;
  inspector: Inspector;
  inspection_apply: InspectionApply;
  schedule: Schedule;
  hydro_test: HydroTest;
  valve_test: ValveTest;
  defect: Defect;
  report: Report;
  certificate: Certificate;
};
