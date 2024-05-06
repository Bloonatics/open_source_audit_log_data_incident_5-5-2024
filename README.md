# Open source audit log data incident 5/5/2024

## Specification

- From `4 May 2024 22:06 UTC` to `5 May 2024 02:40 UTC`
- [discord.js v14.14.1 GuildAuditLogsEntry](https://old.discordjs.dev/#/docs/discord.js/14.14.1/class/GuildAuditLogsEntry)

```ts
import type { GuildAuditLogsEntry } from 'discord.js';

declare const logs: GuildAuditLogsEntry[];

JSON.stringify(logs, null, '\t'); // audit_log.json
```
