import { AuditLogsEntryManager } from './AuditLogsEntryManager';
import { default as data } from '../audit_log.json';
import type { JSONAuditLogsEntry } from './types';

const manager = new AuditLogsEntryManager(data.reverse() as JSONAuditLogsEntry[]);

manager.writeFileSync();
