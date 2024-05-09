import type {
  GuildAuditLogsTargetType,
  GuildAuditLogsActionType,
  AuditLogEvent,
  AuditLogChange
} from 'discord.js';

export interface JSONAuditLogsEntry {
  targetType: GuildAuditLogsTargetType;
  actionType: GuildAuditLogsActionType;
  action: AuditLogEvent;
  reason: string | null;
  executorId: string | null;
  executor: string | null;
  changes: AuditLogChange[];
  id: string;
  extra: any;
  targetId: string | null;
  target: any;
  createdTimestamp: number;
}

export type SingleOrArray<T> = T | T[];
