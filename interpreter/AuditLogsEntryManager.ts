import { AuditLogsEntry } from './AuditLogsEntry';
import type { JSONAuditLogsEntry } from './types';
import { timeDelta } from './functions';
import { writeFileSync } from 'fs';
import { default as packageJSON } from '../package.json';

export class AuditLogsEntryManager {
  public readonly dataLines;

  public constructor (public readonly data: JSONAuditLogsEntry[]) {
    this.dataLines = JSON.stringify([...data].reverse(), null, '\t').split('\n');
  }

  public writeFileSync () {
    let content = '# Open source audit log data incident 5/5/2024';

    this.data.forEach((d, i) => {
      content += `${i ? `\n\nΔt = ${timeDelta(d.createdTimestamp - this.data[i - 1].createdTimestamp)}` : ''}\n\n${new AuditLogsEntry(this, d)}`;
    });

    writeFileSync('./audit_log.md', content);
  }

  public findLineNumber (auditLogsEntryId: string) {
    return this.dataLines.findIndex(l => l.includes(auditLogsEntryId)) + 1;
  }

  public createLineURL (auditLogsEntryId: string) {
    return `${packageJSON.repository.url}/blob/main/audit_log.json#L${this.findLineNumber(auditLogsEntryId)}`;
  }
}
