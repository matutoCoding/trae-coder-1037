import { ipcMain, IpcMainInvokeEvent } from 'electron';
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
  IpcChannel,
  Statistics
} from './types';
import { dbManager, TableName, TableTypeMap } from './database/database';

function handleError(error: unknown): IpcResponse {
  console.error('IPC Handler Error:', error);
  const message = error instanceof Error ? error.message : '未知错误';
  return { success: false, error: message };
}

function successResponse<T>(data: T, message?: string): IpcResponse<T> {
  return { success: true, data, message };
}

function createHandler<T, R>(
  handler: (data: T, event: IpcMainInvokeEvent) => Promise<R> | R
): (event: IpcMainInvokeEvent, data: T) => Promise<IpcResponse<R>> {
  return async (event: IpcMainInvokeEvent, data: T) => {
    try {
      const result = await handler(data, event);
      return successResponse(result) as IpcResponse<R>;
    } catch (error) {
      return handleError(error) as IpcResponse<R>;
    }
  };
}

function parseInspectorIds(schedule: Schedule & { inspectorIds: string }): Schedule {
  return {
    ...schedule,
    inspectorIds: JSON.parse(schedule.inspectorIds || '[]')
  };
}

function createListHandler<T extends TableName>(
  table: T,
  searchFields?: (keyof TableTypeMap[T])[]
): (event: IpcMainInvokeEvent, params: QueryParams) => Promise<IpcResponse<PaginatedResult<TableTypeMap[T]>>> {
  return createHandler<QueryParams, PaginatedResult<TableTypeMap[T]>>((params) => {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    
    const where: Partial<TableTypeMap[T]> = {};
    if (params.status) {
      (where as Record<string, unknown>).status = params.status;
    }
    if (params.companyId !== undefined) {
      (where as Record<string, unknown>).companyId = params.companyId;
    }
    if (params.equipmentId !== undefined) {
      (where as Record<string, unknown>).equipmentId = params.equipmentId;
    }

    let like: Partial<Record<keyof TableTypeMap[T], string>> | undefined;
    if (params.keyword && searchFields && searchFields.length > 0) {
      like = {} as Partial<Record<keyof TableTypeMap[T], string>>;
      searchFields.forEach(field => {
        like![field] = params.keyword!;
      });
    }

    const result = dbManager.paginate(table, page, pageSize, {
      where,
      like,
      orderBy: 'createdAt' as keyof TableTypeMap[T],
      order: 'DESC'
    });

    let list = result.data;
    
    if (table === 'schedule') {
      list = list.map(item => parseInspectorIds(item as Schedule & { inspectorIds: string })) as TableTypeMap[T][];
    }

    return {
      list,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    };
  });
}

function createGetHandler<T extends TableName>(
  table: T
): (event: IpcMainInvokeEvent, id: number) => Promise<IpcResponse<TableTypeMap[T] | null>> {
  return createHandler<number, TableTypeMap[T] | null>((id) => {
    const result = dbManager.findById(table, id);
    if (!result) {
      throw new Error('记录不存在');
    }
    
    if (table === 'schedule' && result) {
      return parseInspectorIds(result as Schedule & { inspectorIds: string }) as TableTypeMap[T];
    }
    
    return result;
  });
}

function createCreateHandler<T extends TableName>(
  table: T
): (event: IpcMainInvokeEvent, data: Omit<TableTypeMap[T], 'id' | 'createdAt' | 'updatedAt'>) => Promise<IpcResponse<TableTypeMap[T] | null>> {
  return createHandler<Omit<TableTypeMap[T], 'id' | 'createdAt' | 'updatedAt'>, TableTypeMap[T] | null>((data) => {
    const now = new Date().toISOString();
    const insertData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    if (table === 'schedule' && insertData) {
      const scheduleData = insertData as unknown as Schedule;
      (insertData as unknown as Schedule & { inspectorIds: string }).inspectorIds = 
        JSON.stringify(scheduleData.inspectorIds || []);
    }

    const id = dbManager.insert(table, insertData as Omit<TableTypeMap[T], 'id' | 'createdAt' | 'updatedAt'>);
    return dbManager.findById(table, id);
  });
}

function createUpdateHandler<T extends TableName>(
  table: T
): (event: IpcMainInvokeEvent, payload: { id: number; data: Partial<TableTypeMap[T]> }) => Promise<IpcResponse<TableTypeMap[T] | null>> {
  return createHandler<{ id: number; data: Partial<TableTypeMap[T]> }, TableTypeMap[T] | null>(({ id, data }) => {
    const updateData = { ...data };
    delete (updateData as { id?: number }).id;
    delete (updateData as { createdAt?: string }).createdAt;

    if (table === 'schedule' && updateData.inspectorIds !== undefined) {
      (updateData as unknown as Schedule & { inspectorIds: string }).inspectorIds = 
        JSON.stringify(updateData.inspectorIds as unknown as number[]);
    }

    const success = dbManager.update(table, id, updateData as Partial<Omit<TableTypeMap[T], 'id' | 'createdAt'>>);
    if (!success) {
      throw new Error('更新失败，记录不存在');
    }
    return dbManager.findById(table, id);
  });
}

function createDeleteHandler<T extends TableName>(
  table: T
): (event: IpcMainInvokeEvent, id: number) => Promise<IpcResponse<boolean>> {
  return createHandler<number, boolean>((id) => {
    const success = dbManager.delete(table, id);
    if (!success) {
      throw new Error('删除失败，记录不存在');
    }
    return true;
  });
}

function getStatistics(): Statistics {
  const totalEquipment = dbManager.execQueryOne<{ count: number }>('SELECT COUNT(*) as count FROM equipment');
  const normalEquipment = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE equipmentStatus = 'normal'");
  const maintenanceEquipment = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE equipmentStatus = 'maintenance'");
  const decommissionedEquipment = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE equipmentStatus = 'decommissioned'");
  const scrappedEquipment = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE equipmentStatus = 'scrapped'");

  const pendingApplications = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM inspection_apply WHERE status = 'pending'");
  const approvedApplications = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM inspection_apply WHERE status = 'approved'");
  
  const scheduledInspections = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM schedule WHERE status = 'scheduled'");
  const inProgressInspections = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM schedule WHERE status = 'in_progress'");
  const completedInspections = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM schedule WHERE status = 'completed'");

  const openDefects = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM defect WHERE status IN ('pending', 'processing', 'repaired', 'rechecking')");
  const minorDefects = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM defect WHERE defectLevel = 'minor'");
  const generalDefects = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM defect WHERE defectLevel = 'general'");
  const majorDefects = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM defect WHERE defectLevel = 'major'");
  const criticalDefects = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM defect WHERE defectLevel = 'critical'");

  const now = new Date().toISOString();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

  const validCertificates = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM certificate WHERE status = 'valid' AND validTo > ?", [now]);
  const expiringCertificates = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM certificate WHERE status = 'valid' AND validTo <= ? AND validTo > ?", [thirtyDaysLaterStr, now]);
  const expiredCertificates = dbManager.execQueryOne<{ count: number }>("SELECT COUNT(*) as count FROM certificate WHERE status = 'expired' OR validTo <= ?", [now]);

  const monthlyInspectionsSql = `
    SELECT 
      strftime('%Y-%m', planDate) as month,
      COUNT(*) as count
    FROM schedule
    WHERE planDate >= date('now', '-12 months')
    GROUP BY strftime('%Y-%m', planDate)
    ORDER BY month
  `;
  const monthlyInspections = dbManager.execQuery<{ month: string; count: number }>(monthlyInspectionsSql);

  const defectByLevelSql = `
    SELECT defectLevel as level, COUNT(*) as count
    FROM defect
    GROUP BY defectLevel
  `;
  const defectByLevel = dbManager.execQuery<{ level: string; count: number }>(defectByLevelSql);

  const equipmentByStatusSql = `
    SELECT equipmentStatus as status, COUNT(*) as count
    FROM equipment
    GROUP BY equipmentStatus
  `;
  const equipmentByStatus = dbManager.execQuery<{ status: string; count: number }>(equipmentByStatusSql);

  const inspectionByResultSql = `
    SELECT overallResult as result, COUNT(*) as count
    FROM report
    GROUP BY overallResult
  `;
  const inspectionByResult = dbManager.execQuery<{ result: string; count: number }>(inspectionByResultSql);

  return {
    totalEquipment: totalEquipment?.count || 0,
    normalEquipment: normalEquipment?.count || 0,
    maintenanceEquipment: maintenanceEquipment?.count || 0,
    decommissionedEquipment: decommissionedEquipment?.count || 0,
    scrappedEquipment: scrappedEquipment?.count || 0,
    pendingApplications: pendingApplications?.count || 0,
    approvedApplications: approvedApplications?.count || 0,
    scheduledInspections: scheduledInspections?.count || 0,
    inProgressInspections: inProgressInspections?.count || 0,
    completedInspections: completedInspections?.count || 0,
    openDefects: openDefects?.count || 0,
    minorDefects: minorDefects?.count || 0,
    generalDefects: generalDefects?.count || 0,
    majorDefects: majorDefects?.count || 0,
    criticalDefects: criticalDefects?.count || 0,
    validCertificates: validCertificates?.count || 0,
    expiringCertificates: expiringCertificates?.count || 0,
    expiredCertificates: expiredCertificates?.count || 0,
    monthlyInspections,
    defectByLevel,
    equipmentByStatus,
    inspectionByResult
  };
}

export function registerIpcHandlers(): void {
  ipcMain.handle('company:list', createListHandler('company', ['name', 'unifiedSocialCreditCode']));
  ipcMain.handle('company:get', createGetHandler('company'));
  ipcMain.handle('company:create', createCreateHandler('company'));
  ipcMain.handle('company:update', createUpdateHandler('company'));
  ipcMain.handle('company:delete', createDeleteHandler('company'));

  ipcMain.handle('equipment:list', createListHandler('equipment', ['equipmentName', 'equipmentCode']));
  ipcMain.handle('equipment:get', createGetHandler('equipment'));
  ipcMain.handle('equipment:create', createCreateHandler('equipment'));
  ipcMain.handle('equipment:update', createUpdateHandler('equipment'));
  ipcMain.handle('equipment:delete', createDeleteHandler('equipment'));

  ipcMain.handle('inspector:list', createListHandler('inspector', ['name', 'employeeNo']));
  ipcMain.handle('inspector:get', createGetHandler('inspector'));
  ipcMain.handle('inspector:create', createCreateHandler('inspector'));
  ipcMain.handle('inspector:update', createUpdateHandler('inspector'));
  ipcMain.handle('inspector:delete', createDeleteHandler('inspector'));

  ipcMain.handle('application:list', createListHandler('inspection_apply', ['applyNo']));
  ipcMain.handle('application:get', createGetHandler('inspection_apply'));
  ipcMain.handle('application:create', createCreateHandler('inspection_apply'));
  ipcMain.handle('application:update', createUpdateHandler('inspection_apply'));
  ipcMain.handle('application:delete', createDeleteHandler('inspection_apply'));

  ipcMain.handle('schedule:list', createListHandler('schedule', ['scheduleNo']));
  ipcMain.handle('schedule:get', createGetHandler('schedule'));
  ipcMain.handle('schedule:create', createCreateHandler('schedule'));
  ipcMain.handle('schedule:update', createUpdateHandler('schedule'));
  ipcMain.handle('schedule:delete', createDeleteHandler('schedule'));

  ipcMain.handle('hydrotest:list', createListHandler('hydro_test'));
  ipcMain.handle('hydrotest:get', createGetHandler('hydro_test'));
  ipcMain.handle('hydrotest:create', createCreateHandler('hydro_test'));
  ipcMain.handle('hydrotest:update', createUpdateHandler('hydro_test'));
  ipcMain.handle('hydrotest:delete', createDeleteHandler('hydro_test'));

  ipcMain.handle('valvetest:list', createListHandler('valve_test', ['valveName', 'valveNo']));
  ipcMain.handle('valvetest:get', createGetHandler('valve_test'));
  ipcMain.handle('valvetest:create', createCreateHandler('valve_test'));
  ipcMain.handle('valvetest:update', createUpdateHandler('valve_test'));
  ipcMain.handle('valvetest:delete', createDeleteHandler('valve_test'));

  ipcMain.handle('defect:list', createListHandler('defect', ['defectNo', 'defectDescription']));
  ipcMain.handle('defect:get', createGetHandler('defect'));
  ipcMain.handle('defect:create', createCreateHandler('defect'));
  ipcMain.handle('defect:update', createUpdateHandler('defect'));
  ipcMain.handle('defect:delete', createDeleteHandler('defect'));

  ipcMain.handle('report:list', createListHandler('report', ['reportNo']));
  ipcMain.handle('report:get', createGetHandler('report'));
  ipcMain.handle('report:create', createCreateHandler('report'));
  ipcMain.handle('report:update', createUpdateHandler('report'));
  ipcMain.handle('report:delete', createDeleteHandler('report'));

  ipcMain.handle('certificate:list', createListHandler('certificate', ['certificateNo']));
  ipcMain.handle('certificate:get', createGetHandler('certificate'));
  ipcMain.handle('certificate:create', createCreateHandler('certificate'));
  ipcMain.handle('certificate:update', createUpdateHandler('certificate'));
  ipcMain.handle('certificate:delete', createDeleteHandler('certificate'));

  ipcMain.handle('statistics:get', createHandler<void, Statistics>(() => getStatistics()));
}

export function unregisterIpcHandlers(): void {
  const channels: IpcChannel[] = [
    'company:list', 'company:get', 'company:create', 'company:update', 'company:delete',
    'equipment:list', 'equipment:get', 'equipment:create', 'equipment:update', 'equipment:delete',
    'inspector:list', 'inspector:get', 'inspector:create', 'inspector:update', 'inspector:delete',
    'application:list', 'application:get', 'application:create', 'application:update', 'application:delete',
    'schedule:list', 'schedule:get', 'schedule:create', 'schedule:update', 'schedule:delete',
    'hydrotest:list', 'hydrotest:get', 'hydrotest:create', 'hydrotest:update', 'hydrotest:delete',
    'valvetest:list', 'valvetest:get', 'valvetest:create', 'valvetest:update', 'valvetest:delete',
    'defect:list', 'defect:get', 'defect:create', 'defect:update', 'defect:delete',
    'report:list', 'report:get', 'report:create', 'report:update', 'report:delete',
    'certificate:list', 'certificate:get', 'certificate:create', 'certificate:update', 'certificate:delete',
    'statistics:get'
  ];

  for (const channel of channels) {
    ipcMain.removeHandler(channel);
  }
}
