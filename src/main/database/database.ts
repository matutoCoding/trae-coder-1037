import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import {
  CREATE_TABLES,
  CREATE_INDEXES,
  TableName,
  TableTypeMap,
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
} from './schema';

export { TableName, TableTypeMap };
export type SortOrder = 'ASC' | 'DESC';

export interface QueryOptions<T> {
  where?: Partial<T>;
  orderBy?: keyof T;
  order?: SortOrder;
  limit?: number;
  offset?: number;
  like?: Partial<Record<keyof T, string>>;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

function rowsToObjects<T>(columns: string[], values: unknown[][]): T[] {
  return values.map(row => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj as T;
  });
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private dbPath: string = '';
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async init(dbName: string = 'boiler_inspection.db'): Promise<void> {
    if (this.db) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInit(dbName);
    return this.initPromise;
  }

  private async doInit(dbName: string): Promise<void> {
    const userDataPath = app ? app.getPath('userData') : process.cwd();
    this.dbPath = path.join(userDataPath, dbName);

    this.SQL = await initSqlJs({
      locateFile: (file: string) => {
        const basePath = app && app.isPackaged
          ? path.join(process.resourcesPath, 'node_modules', 'sql.js', 'dist')
          : path.join(process.cwd(), 'node_modules', 'sql.js', 'dist');
        return path.join(basePath, file);
      }
    });

    let fileBuffer: Buffer | null = null;
    if (fs.existsSync(this.dbPath)) {
      fileBuffer = fs.readFileSync(this.dbPath);
    }

    this.db = fileBuffer
      ? new this.SQL.Database(fileBuffer)
      : new this.SQL.Database();

    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
    this.db.run('PRAGMA busy_timeout = 30000');

    this.createTables();
    this.createIndexes();
    this.save();
  }

  public async initForTest(dbPath: string): Promise<void> {
    if (this.db) {
      return;
    }

    this.SQL = await initSqlJs({
      locateFile: (file: string) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file)
    });

    this.dbPath = dbPath;

    let fileBuffer: Buffer | null = null;
    if (fs.existsSync(this.dbPath)) {
      fileBuffer = fs.readFileSync(this.dbPath);
    }

    this.db = fileBuffer
      ? new this.SQL.Database(fileBuffer)
      : new this.SQL.Database();

    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
    this.db.run('PRAGMA busy_timeout = 30000');

    this.createTables();
    this.createIndexes();
    this.save();
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('BEGIN TRANSACTION');
    try {
      for (const sql of CREATE_TABLES) {
        this.db!.exec(sql);
      }
      this.db.run('COMMIT');
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  private createIndexes(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec(CREATE_INDEXES);
  }

  private save(): void {
    if (!this.db || !this.dbPath) return;
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  public getDb(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  public getDbPath(): string {
    return this.dbPath;
  }

  public close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  private run(sql: string, params: unknown[] = []): RunResult {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params);
    const changes = this.db.getRowsModified();
    const lastInsertRowid = this.execQueryOne<{ id: number }>('SELECT last_insert_rowid() as id')?.id || 0;
    return { changes, lastInsertRowid };
  }

  public execQuery<T>(sql: string, params: unknown[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized');
    const results = this.db.exec(sql, params);
    if (results.length === 0) return [];
    return rowsToObjects<T>(results[0].columns, results[0].values);
  }

  public execQueryOne<T>(sql: string, params: unknown[] = []): T | null {
    const results = this.execQuery<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  public insert<T extends TableName>(table: T, data: Omit<TableTypeMap[T], 'id' | 'createdAt' | 'updatedAt'>): number {
    if (!this.db) throw new Error('Database not initialized');

    const columns = Object.keys(data) as string[];
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => (data as Record<string, unknown>)[col]);

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = this.run(sql, values);
    this.save();
    return Number(result.lastInsertRowid);
  }

  public insertMany<T extends TableName>(
    table: T,
    records: Omit<TableTypeMap[T], 'id' | 'createdAt' | 'updatedAt'>[]
  ): number[] {
    if (!this.db) throw new Error('Database not initialized');
    if (records.length === 0) return [];

    const columns = Object.keys(records[0]) as (keyof TableTypeMap TT)[]ableTypeMap[T])[];
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    const ids: number[] = [];
    this.db.run('BEGIN TRANSACTION');
    try {
      for (const item of records) {
        const values = columns.map(col => tem[
        const result = this.run(sql, values);
        ids.push(Number(result.lastInsertRowid));
      }
      this.db.run('COMMIT');
      this.save();
      return ids;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  public update<T extends TableName>(
    table: T,
    id: number,
    data: Partial<Omit<TableTypeMap[T], 'id' | 'createdAt'>>
  ): boolean {
    if (!this.db) throw new Error('Database not initialized');

    const updateData = { ...data, updatedAt: new Date().toISOString() } as Record<string, unknown>;
    const columns = Object.keys(updateData);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = [...columns.map(col => updateData[col]), id];

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const result = this.run(sql, values);
    this.save();
    return result.changes > 0;
  }

  public updateByCondition<T extends TableName>(
    table: T,
    condition: Partial<TableTypeMap[T]>,
    data: Partial<Omit<TableTypeMap[T], 'id' | 'createdAt'>>
  ): number {
    if (!this.db) throw new Error('Database not initialized');

    const updateData = { ...data, updatedAt: new Date().toISOString() } as Record<string, unknown>;
    const conditionData = condition as Record<string, unknown>;
    const setColumns = Object.keys(updateData);
    const whereColumns = Object.keys(conditionData);

    const setClause = setColumns.map(col => `${col} = ?`).join(', ');
    const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ');
    const values = [...setColumns.map(col => updateData[col]), ...whereColumns.map(col => conditionData[col])];

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const result = this.run(sql, values);
    this.save();
    return Number(result.changes);
  }

  public delete<T extends TableName>(table: T, id: number): boolean {
    if (!this.db) throw new Error('Database not initialized');
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = this.run(sql, [id]);
    this.save();
    return result.changes > 0;
  }

  public deleteByCondition<T extends TableName>(table: T, condition: Partial<TableTypeMap[T]>): number {
    if (!this.db) throw new Error('Database not initialized');

    const columns = Object.keys(condition) as (keyof TableTypeMap[T])[];
    const whereClause = columns.map(col => `${col.toString()} = ?`).join(' AND ');
    const values = columns.map(col => condition[col]);

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const result = this.run(sql, values);
    this.save();
    return Number(result.changes);
  }

  public findById<T extends TableName>(table: T, id: number): TableTypeMap[T] | null {
    if (!this.db) throw new Error('Database not initialized');
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    return this.execQueryOne<TableTypeMap[T]>(sql, [id]);
  }

  public findOne<T extends TableName>(
    table: T,
    condition: Partial<TableTypeMap[T]>
  ): TableTypeMap[T] | null {
    if (!this.db) throw new Error('Database not initialized');

    const columns = Object.keys(condition) as (keyof TableTypeMap[T])[];
    const whereClause = columns.map(col => `${col.toString()} = ?`).join(' AND ');
    const values = columns.map(col => condition[col]);

    const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
    return this.execQueryOne<TableTypeMap[T]>(sql, values);
  }

  public findAll<T extends TableName>(
    table: T,
    options: QueryOptions<TableTypeMap[T]> = {}
  ): TableTypeMap[T][] {
    if (!this.db) throw new Error('Database not initialized');

    const { where, orderBy, order = 'ASC', limit, offset, like } = options;
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (where) {
      const columns = Object.keys(where) as (keyof TableTypeMap[T])[];
      columns.forEach(col => {
        if (where[col] !== undefined) {
          clauses.push(`${col.toString()} = ?`);
          values.push(where[col]);
        }
      });
    }

    if (like) {
      const columns = Object.keys(like) as (keyof TableTypeMap[T])[];
      columns.forEach(col => {
        if (like[col]) {
          clauses.push(`${col.toString()} LIKE ?`);
          values.push(`%${like[col]}%`);
        }
      });
    }

    let sql = `SELECT * FROM ${table}`;
    if (clauses.length > 0) {
      sql += ` WHERE ${clauses.join(' AND ')}`;
    }
    if (orderBy) {
      sql += ` ORDER BY ${orderBy.toString()} ${order}`;
    }
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    if (offset) {
      sql += ` OFFSET ${offset}`;
    }

    return this.execQuery<TableTypeMap[T]>(sql, values);
  }

  public paginate<T extends TableName>(
    table: T,
    page: number = 1,
    pageSize: number = 10,
    options: QueryOptions<TableTypeMap[T]> = {}
  ): PaginationResult<TableTypeMap[T]> {
    if (!this.db) throw new Error('Database not initialized');

    const offset = (page - 1) * pageSize;
    const data = this.findAll(table, { ...options, limit: pageSize, offset });

    const total = this.count(table, {
      where: options.where,
      like: options.like,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  public count<T extends TableName>(
    table: T,
    condition: Pick<QueryOptions<TableTypeMap[T]>, 'where' | 'like'> = {}
  ): number {
    if (!this.db) throw new Error('Database not initialized');

    const { where, like } = condition;
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (where) {
      const columns = Object.keys(where) as (keyof TableTypeMap[T])[];
      columns.forEach(col => {
        if (where[col] !== undefined) {
          clauses.push(`${col.toString()} = ?`);
          values.push(where[col]);
        }
      });
    }

    if (like) {
      const columns = Object.keys(like) as (keyof TableTypeMap[T])[];
      columns.forEach(col => {
        if (like[col]) {
          clauses.push(`${col.toString()} LIKE ?`);
          values.push(`%${like[col]}%`);
        }
      });
    }

    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    if (clauses.length > 0) {
      sql += ` WHERE ${clauses.join(' AND ')}`;
    }

    const result = this.execQueryOne<{ count: number }>(sql, values);
    return result?.count || 0;
  }

  public exists<T extends TableName>(table: T, condition: Partial<TableTypeMap[T]>): boolean {
    return this.count(table, { where: condition }) > 0;
  }

  public executeSql(sql: string, params: unknown[] = []): unknown {
    if (!this.db) throw new Error('Database not initialized');
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return this.execQuery(sql, params);
    }
    const result = this.run(sql, params);
    this.save();
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  public transaction<T>(fn: () => T): T {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('BEGIN TRANSACTION');
    try {
      const result = fn();
      this.db.run('COMMIT');
      this.save();
      return result;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  public backup(destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) throw new Error('Database not initialized');
        const data = this.db.export();
        fs.writeFileSync(destination, Buffer.from(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public getCompanyById(id: number): Company | null {
    return this.findById('company', id);
  }

  public getEquipmentById(id: number): Equipment | null {
    return this.findById('equipment', id);
  }

  public getInspectorById(id: number): Inspector | null {
    return this.findById('inspector', id);
  }

  public getInspectionApplyById(id: number): InspectionApply | null {
    return this.findById('inspection_apply', id);
  }

  public getScheduleById(id: number): Schedule | null {
    return this.findById('schedule', id);
  }

  public getHydroTestById(id: number): HydroTest | null {
    return this.findById('hydro_test', id);
  }

  public getValveTestById(id: number): ValveTest | null {
    return this.findById('valve_test', id);
  }

  public getDefectById(id: number): Defect | null {
    return this.findById('defect', id);
  }

  public getReportById(id: number): Report | null {
    return this.findById('report', id);
  }

  public getCertificateById(id: number): Certificate | null {
    return this.findById('certificate', id);
  }

  public getEquipmentsByCompany(companyId: number): Equipment[] {
    return this.findAll('equipment', { where: { companyId } as Partial<Equipment> });
  }

  public getInspectionAppliesByCompany(companyId: number): InspectionApply[] {
    return this.findAll('inspection_apply', {
      where: { companyId } as Partial<InspectionApply>,
      orderBy: 'applyDate',
      order: 'DESC',
    });
  }

  public getSchedulesByInspector(inspectorId: number): Schedule[] {
    const sql = `
      SELECT s.*
      FROM schedule s
      WHERE s.mainInspectorId = ? OR s.inspectorIds LIKE ?
      ORDER BY s.planDate DESC
    `;
    return this.execQuery<Schedule>(sql, [inspectorId, `%${inspectorId}%`]);
  }

  public getDefectsByEquipment(equipmentId: number): Defect[] {
    return this.findAll('defect', {
      where: { equipmentId } as Partial<Defect>,
      orderBy: 'createdAt',
      order: 'DESC',
    });
  }

  public getReportsByEquipment(equipmentId: number): Report[] {
    return this.findAll('report', {
      where: { equipmentId } as Partial<Report>,
      orderBy: 'inspectionDate',
      order: 'DESC',
    });
  }

  public getCertificatesByEquipment(equipmentId: number): Certificate[] {
    return this.findAll('certificate', {
      where: { equipmentId } as Partial<Certificate>,
      orderBy: 'issueDate',
      order: 'DESC',
    });
  }

  public getPendingApplies(): InspectionApply[] {
    return this.findAll('inspection_apply', {
      where: { status: 'pending' } as Partial<InspectionApply>,
      orderBy: 'applyDate',
      order: 'ASC',
    });
  }

  public getUpcomingSchedules(days: number = 7): Schedule[] {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const endDate = date.toISOString().split('T')[0];
    const startDate = new Date().toISOString().split('T')[0];

    const sql = `
      SELECT * FROM schedule
      WHERE planDate BETWEEN ? AND ?
      AND status IN ('scheduled', 'postponed')
      ORDER BY planDate ASC
    `;
    return this.execQuery<Schedule>(sql, [startDate, endDate]);
  }

  public getExpiringCertificates(days: number = 30): Certificate[] {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const warningDate = date.toISOString().split('T')[0];

    const sql = `
      SELECT * FROM certificate
      WHERE validTo <= ? AND status = 'valid'
      ORDER BY validTo ASC
    `;
    return this.execQuery<Certificate>(sql, [warningDate]);
  }

  public getDefectsByLevel(level: 'minor' | 'general' | 'major' | 'critical'): Defect[] {
    return this.findAll('defect', {
      where: { defectLevel: level, status: 'pending' } as Partial<Defect>,
      orderBy: 'createdAt',
      order: 'DESC',
    });
  }
}

export const dbManager = DatabaseManager.getInstance();
export default dbManager;
