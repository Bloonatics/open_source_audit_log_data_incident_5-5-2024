import type { JSONAuditLogsEntry } from './types';
import type { AuditLogsEntryManager } from './AuditLogsEntryManager';
import {
  spacePascalCase,
  parseUTCDate,
  timeDelta,
  resolveName
} from './functions';
import {
  AuditLogEvent,
  PermissionsBitField,
  codeBlock,
  type AuditLogChange,
  type APIRole
} from 'discord.js';

export class AuditLogsEntry {
  public constructor (
    public readonly manager: AuditLogsEntryManager,
    public readonly data: JSONAuditLogsEntry
  ) {};

  /**
   * @readonly
   */
  public get id () {
    return this.data.id;
  }

  /**
   * @readonly
   */
  public get action () {
    return this.data.action;
  }

  /**
   * @readonly
   */
  public get actionType () {
    return this.data.actionType;
  }

  /**
   * @readonly
   */
  public get targetType () {
    return this.data.targetType;
  }

  /**
   * @readonly
   */
  public get reason () {
    return this.data.reason;
  }

  /**
   * @readonly
   */
  public get executorId () {
    return this.data.executorId;
  }

  /**
   * @readonly
   */
  public get executor () {
    return this.data.executor;
  }

  /**
   * @readonly
   */
  public get changes () {
    return this.data.changes;
  }

  /**
   * @readonly
   */
  public get extra () {
    return this.data.extra;
  }

  /**
   * @readonly
   */
  public get targetId () {
    return this.data.targetId;
  }

  /**
   * @readonly
   */
  public get target () {
    return this.data.target;
  }

  /**
   * @readonly
   */
  public get createdTimestamp () {
    return this.data.createdTimestamp;
  }

  /**
   * @readonly
   */
  public get lineNumber () {
    return this.manager.findLineNumber(this.id);
  }

  /**
   * @readonly
   */
  public get lineURL () {
    return this.manager.createLineURL(this.id);
  }

  /**
   * @readonly
   */
  public get permissionsChange () {
    const perms = this.findChange('permissions');
    const allow = this.findChange('allow');
    const deny = this.findChange('deny');
    const p = {
      oldPerms: new PermissionsBitField(perms?.old as any ?? 0n).freeze(),
      newPerms: new PermissionsBitField(perms?.new as any ?? 0n).freeze(),
      oldAllow: new PermissionsBitField(allow?.old as any ?? 0n).freeze(),
      newAllow: new PermissionsBitField(allow?.new as any ?? 0n).freeze(),
      oldDeny: new PermissionsBitField(deny?.old as any ?? 0n).freeze(),
      newDeny: new PermissionsBitField(deny?.new as any ?? 0n).freeze()
    }

    const c = {
      permsGrant: p.oldPerms.missing(p.newPerms, false),
      permsDeny: perms?.new ? p.newPerms.missing(p.oldPerms, false) : [],
      overwriteGrant: p.oldAllow.missing(p.newAllow, false),
      overwriteDeny: p.oldDeny.missing(p.newDeny, false),
      overwriteReset: allow?.new || deny?.new
        ? p.newAllow.add(p.newDeny).missing(p.oldAllow.add(p.oldDeny), false)
        : []
    }

    const descriptions: string[] = [];

    if (c.permsGrant.length || c.overwriteGrant.length) descriptions.push(
      `**Granted** permission${c.permsGrant.concat(c.overwriteGrant).length > 1 ? 's' : ''}\n` +
      codeBlock(
        c.permsGrant.map(s => spacePascalCase(s)).join('\n') ||
        c.overwriteGrant.map(s => spacePascalCase(s)).join('\n')
      )
    );

    if (c.permsDeny.length || c.overwriteDeny.length) descriptions.push(
      `**Denied** permission${c.permsDeny.concat(c.overwriteDeny).length > 1 ? 's' : ''}\n` +
      codeBlock(
        c.permsDeny.map(s => spacePascalCase(s)).join('\n') ||
        c.overwriteDeny.map(s => spacePascalCase(s)).join('\n')
      )
    );

    if (c.overwriteReset.length) descriptions.push(
      `**Reset** permission${c.overwriteReset.length > 1 ? 's' : ''}\n` +
      codeBlock(c.overwriteReset.map(s => spacePascalCase(s)).join('\n'))
    );

    return {
      ...c,
      descriptions
    }
  }

  /**
   * @readonly
   */
  public get memberRoleChange () {
    const adds = (this.findChange('$add')?.new ?? []) as APIRole[];
    const removes = (this.findChange('$remove')?.new ?? []) as APIRole[];
    const descriptions: string[] = [];

    if (adds.length) descriptions.push(
      `**Added** ${adds.length > 1 ? 'some' : 'a'} role${adds.length > 1 ? 's' : ''}\n` +
      codeBlock(adds.map(r => `${r.name} (${r.id})`).join('\n'))
    );

    if (removes.length) descriptions.push(
      `**Removed** ${removes.length > 1 ? 'some' : 'a'} role${removes.length > 1 ? 's' : ''}\n` +
      codeBlock(removes.map(r => `${r.name} (${r.id})`).join('\n'))
    );

    return {
      adds,
      removes,
      descriptions
    }
  }

  public findChange (key: AuditLogChange['key']) {
    return this.changes.find(c => c.key === key) ?? null;
  }

  public toString () {
    const det: string[] = [];
    let desc = `*Description not supported*. Executor and target are ${resolveName(this.executorId)} and ${resolveName(this.targetId)} respectively.`;

    if (this.reason) det.push(`With reason \`${this.reason}\``);

    const { descriptions: pChanges } = this.permissionsChange;

    if (pChanges.length) det.push(...pChanges);

    switch (this.action) {
      case AuditLogEvent.MemberBanAdd:
        desc = `${resolveName(this.executorId)} banned ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.MemberKick:
        desc = `${resolveName(this.executorId)} kicked ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.IntegrationDelete:
        desc = `${resolveName(this.executorId)} deleted the integration for \`${this.findChange('name')?.old}\``;
        break;
      case AuditLogEvent.RoleUpdate:
        desc = `${resolveName(this.executorId)} updated the role ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.MemberRoleUpdate:
        desc = `${resolveName(this.executorId)} updated roles for ${resolveName(this.targetId)}`;

        const { descriptions: rChanges } = this.memberRoleChange;

        if (rChanges.length) det.push(...rChanges);
        break;
      case AuditLogEvent.RoleCreate:
        desc = `${resolveName(this.executorId)} created the role \`${this.findChange('name')?.new}\` (\`${this.targetId}\`)`;
        break;
      case AuditLogEvent.ChannelUpdate:
        desc = `${resolveName(this.executorId)} made changes to ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.GuildUpdate:
        desc = `${resolveName(this.executorId)} made changes to \`The Sky\` (\`${this.targetId}\`)`;
        break;
      case AuditLogEvent.RoleDelete:
        desc = `${resolveName(this.executorId)} deleted the role \`${this.findChange('name')?.old}\` (\`${this.targetId}\`)`;
        break;
      case AuditLogEvent.MemberPrune:
        desc = `${resolveName(this.executorId)} pruned \`${this.extra?.removed?.toLocaleString()}\` members`;

        if (this.extra?.days) det.push(`For **${this.extra.days} days** of inactivity`);
        break;
      case AuditLogEvent.ChannelDelete:
        desc = `${resolveName(this.executorId)} removed \`${this.findChange('name')?.old}\` (\`${this.targetId}\`)`;
        break;
      case AuditLogEvent.ChannelOverwriteUpdate:
        desc = `${resolveName(this.executorId)} updated channel override ${resolveName(this.extra?.id ?? this.extra)} for ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.ChannelOverwriteCreate:
        desc = `${resolveName(this.executorId)} created channel override ${resolveName(this.extra?.id ?? this.extra)} for ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.BotAdd:
        desc = `${resolveName(this.executorId)} added ${resolveName(this.targetId)} to the server`;
        break;
      case AuditLogEvent.IntegrationCreate:
        desc = `${resolveName(this.executorId)} added an integration for \`${this.findChange('name')?.new}\``;
        break;
      case AuditLogEvent.InviteCreate:
        desc = `${resolveName(this.executorId)} created an invite \`${this.findChange('code')?.new}\``;
        break;
      case AuditLogEvent.EmojiDelete:
        desc = `${resolveName(this.executorId)} deleted the emoji \`${this.findChange('name')?.old}\` (\`${this.targetId}\`)`;
        break;
      case AuditLogEvent.ChannelCreate:
        desc = `${resolveName(this.executorId)} created a channel \`${this.findChange('name')?.new}\` (\`${this.targetId}\`)`;
        break;
      case AuditLogEvent.MessageDelete:
        desc = `${resolveName(this.executorId)} deleted \`${this.extra?.count}\` messages by ${resolveName(this.targetId)} in ${resolveName(this.extra?.channel?.id ?? this.extra?.channel)}`;
        break;
      case AuditLogEvent.MemberBanRemove:
        desc = `${resolveName(this.executorId)} removed the ban for ${resolveName(this.targetId)}`;
        break;
      case AuditLogEvent.MessageBulkDelete:
        desc = `${resolveName(this.executorId)} deleted \`${this.extra?.count}\` messages in ${resolveName(this.extra?.channel?.id ?? this.targetId)}`;
        break;
      case AuditLogEvent.ChannelOverwriteDelete:
        desc = `${resolveName(this.executorId)} removed channel override ${resolveName(this.extra?.id ?? this.extra)} for ${resolveName(this.targetId)}`;
    }

    const arr = [
      '[!NOTE]',
      [
        `**${spacePascalCase(AuditLogEvent[this.action])}**`,
        `\`${parseUTCDate(this.createdTimestamp)}\``,
        `t = \`${timeDelta(this.createdTimestamp - this.manager.data[0].createdTimestamp)}\``,
        `[\`raw data\`](${this.lineURL})`
      ].join(' | '),
      '',
      desc
    ];

    if (det.length) arr.push(
      '',
      ...det
        .map((d, i) => {
          const ret = d.split('\n');

          ret[0] = `${i + 1}. ${ret[0]}`;

          return ret;
        })
        .flat()
    );

    return arr
      .map(str => `> ${str}`)
      .join('\n');
  }
}
