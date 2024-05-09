# Open source audit log data incident 5/5/2024

> [!WARNING]
> Do not use the API data for any purposes other than understanding the incident. The disclosure of our audit log data is only for transparency concern.

## Table of Contents

- [`audit_log.md`](/audit_log.md) - Interpreted audit log entries
- [`audit_log.json`](/audit_log.json) - Raw audit log data

## Specification

- From `4 May 2024 22:06 UTC` to `5 May 2024 02:40 UTC`
- [discord.js v14.14.1 GuildAuditLogsEntry](https://old.discordjs.dev/#/docs/discord.js/14.14.1/class/GuildAuditLogsEntry)

```ts
import type { GuildAuditLogsEntry } from 'discord.js';

declare const logs: GuildAuditLogsEntry[];

JSON.stringify(logs, null, '\t'); // audit_log.json
```
