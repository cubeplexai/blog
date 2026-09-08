import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outDir = resolve('static/img/blog/qm-cubeplex-team-agent-collaboration');

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const copy = {
  zh: {
    title: '两种组织 Agent 状态的方式',
    subtitle: 'QM 从 Slack 位置得到 Scope；CubePlex 先定义 Workspace Agent，再切分每次运行的上下文。',
    qm: 'QM：每个 Scope 是独立的工作环境边界',
    qmSub: 'Slack 的人、频道、多人私信和项目映射为不同 Scope',
    slack: 'Slack',
    personal: '个人 Scope', channel: '频道 Scope', group: '项目 / 群组 Scope',
    scopeItems1: 'memory · files · skills', scopeItems2: 'credentials · sandbox',
    cube: 'CubePlex：Workspace 复用长期 Agent 定义',
    cubeSub: 'IM 入口只决定本次会话、身份、授权和执行边界',
    workspace: 'Workspace',
    agent: '一个长期 Team Agent',
    agentItems: 'Persona · Skills · MCP connectors · Workspace memory',
    surfaces: 'Web · Slack · Discord · Teams · 飞书 · 钉钉 · 企业微信',
    dm: '私聊', dmSub: '个人历史 · 个人记忆 · 用户凭据',
    groupChat: '群聊', groupSub: '路由决定共享或按成员隔离',
    directSandbox: '私聊 Sandbox', directSandboxSub: '隔离：当前用户 / 会话',
    sharedSandbox: '群聊共享 Sandbox', sharedSandboxSub: '共享路由：共同上下文',
    isolatedSandbox: '群聊成员 Sandbox', isolatedSandboxSub: '隔离路由：每位成员独立',
    conclusion: '关键差异',
    conclusionCopy: 'QM 让资源随 Scope 分开组织；CubePlex 让能力在 Workspace 中复用，并把不同入口的状态和执行留在各自边界。',
  },
  en: {
    title: 'Two Ways to Organize Agent State',
    subtitle: 'QM derives scopes from Slack locations. CubePlex defines a Workspace Agent first, then separates the context of each run.',
    qm: 'QM: every scope is a separate work-environment boundary',
    qmSub: 'Slack people, channels, group DMs, and projects resolve to distinct scopes',
    slack: 'Slack',
    personal: 'Personal scope', channel: 'Channel scope', group: 'Project / group scope',
    scopeItems1: 'memory · files · skills', scopeItems2: 'credentials · sandbox',
    cube: 'CubePlex: a Workspace reuses the long-lived agent definition',
    cubeSub: 'An IM entry point determines the conversation, identity, authorization, and execution boundary for a run',
    workspace: 'Workspace',
    agent: 'One long-lived Team Agent',
    agentItems: 'Persona · Skills · MCP connectors · Workspace memory',
    surfaces: 'Web · Slack · Discord · Teams · Feishu · DingTalk · WeCom',
    dm: 'Direct message', dmSub: 'personal history · memory · credentials',
    groupChat: 'Group chat', groupSub: 'routing selects sharing or per-member isolation',
    directSandbox: 'DM Sandbox', directSandboxSub: 'isolated user / conversation',
    sharedSandbox: 'Shared group Sandbox', sharedSandboxSub: 'shared context',
    isolatedSandbox: 'Per-member Sandbox', isolatedSandboxSub: 'isolated per member',
    conclusion: 'Key distinction',
    conclusionCopy: 'QM organizes resources separately with each scope. CubePlex reuses capabilities in a workspace while keeping state and execution at the appropriate entry-point boundary.',
  },
};

function box(x, y, width, height, className, title, subtitle = '', titleSize = 18) {
  const cx = x + width / 2;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" class="${className}"/>
    <text x="${cx}" y="${y + height / 2 - (subtitle ? 5 : -6)}" text-anchor="middle" class="box-title" style="font-size:${titleSize}px">${escapeXml(title)}</text>
    ${subtitle ? `<text x="${cx}" y="${y + height / 2 + 22}" text-anchor="middle" class="box-sub">${escapeXml(subtitle)}</text>` : ''}`;
}

function diagram(locale) {
  const t = copy[locale];
  const scopeXs = [83, 309, 535];
  const scopeNames = [t.personal, t.channel, t.group];
  const scopeTitleSize = locale === 'zh' ? 19 : 16;
  const footCopyX = locale === 'zh' ? 170 : 285;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 950" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(t.title)}</title>
  <desc id="desc">${escapeXml(t.conclusionCopy)}</desc>
  <defs>
    <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4 0 8Z" fill="#1463E9"/></marker>
    <marker id="arrow-ink" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4 0 8Z" fill="#17191C"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:33px; font-weight:750; letter-spacing:-.8px; }
      .subtitle { fill:#536171; font-size:16px; }
      .panel { fill:#FFFFFF; stroke:#17191C; stroke-width:2; }
      .panel-title { fill:#17191C; font-size:20px; font-weight:700; }
      .panel-copy { fill:#536171; font-size:13px; }
      .scope { fill:#EAF2FE; stroke:#17191C; stroke-width:1.7; }
      .workspace { fill:#EAF2FE; stroke:#1463E9; stroke-width:2.5; }
      .agent { fill:#1463E9; stroke:#17191C; stroke-width:2; }
      .entry { fill:#FFFFFF; stroke:#17191C; stroke-width:1.7; }
      .run { fill:#FFFFFF; stroke:#1463E9; stroke-width:2; }
      .sandbox { fill:#EAF2FE; stroke:#17191C; stroke-width:1.7; }
      .box-title { fill:#17191C; font-weight:700; }
      .agent .box-title { fill:#FFFFFF; }
      .box-sub { fill:#536171; font-size:12.5px; }
      .agent-copy { fill:#FFFFFF; font-size:14px; }
      .scope-copy { fill:#536171; font-size:11px; }
      .line-blue { fill:none; stroke:#1463E9; stroke-width:2.3; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .line-ink { fill:none; stroke:#17191C; stroke-width:1.7; marker-end:url(#arrow-ink); stroke-linecap:round; stroke-linejoin:round; }
      .line-quiet { fill:none; stroke:#7B8794; stroke-width:1.5; stroke-dasharray:6 6; stroke-linecap:round; }
      .chip { fill:#FFE24A; opacity:.78; }
      .foot { fill:#FFFFFF; stroke:#17191C; stroke-width:1.5; }
      .foot-title { fill:#17191C; font-size:14px; font-weight:750; }
      .foot-copy { fill:#394554; font-size:14px; }
    </style>
  </defs>
  <rect width="1600" height="950" fill="#FCFCFA"/><rect width="1600" height="950" fill="url(#grid)"/>
  <path d="M43 102C220 25 402 40 508 111" fill="none" stroke="#EAF2FE" stroke-width="34" stroke-linecap="round"/>
  <text x="48" y="62" class="title">${escapeXml(t.title)}</text>
  <text x="48" y="90" class="subtitle">${escapeXml(t.subtitle)}</text>

  <rect x="42" y="126" width="750" height="682" rx="22" class="panel"/>
  <text x="72" y="165" class="panel-title">${escapeXml(t.qm)}</text><text x="72" y="189" class="panel-copy">${escapeXml(t.qmSub)}</text>
  ${box(305, 220, 224, 64, 'entry', t.slack, '', 20)}
  <path d="M417 284V327H183V360" class="line-ink"/><path d="M417 327H409V360" class="line-ink"/><path d="M417 327H635V360" class="line-ink"/>
  ${scopeXs.map((x, index) => `${box(x, 360, 200, 150, 'scope', scopeNames[index], '', scopeTitleSize)}<rect x="${x + 20}" y="460" width="160" height="43" rx="8" fill="#FFFFFF" stroke="#17191C" stroke-width="1"/><text x="${x + 100}" y="478" text-anchor="middle" class="scope-copy">${escapeXml(t.scopeItems1)}</text><text x="${x + 100}" y="495" text-anchor="middle" class="scope-copy">${escapeXml(t.scopeItems2)}</text>`).join('')}
  <path d="M183 510V569" class="line-ink"/><path d="M409 510V569" class="line-ink"/><path d="M635 510V569" class="line-ink"/>
  ${scopeXs.map((x) => box(x, 570, 200, 85, 'sandbox', 'Sandbox', '', 17)).join('')}
  <path d="M83 700H735" class="line-quiet"/><text x="409" y="731" text-anchor="middle" class="panel-copy">${escapeXml(locale === 'zh' ? '资源与访问关系随 Scope 分别组织' : 'Resources and access relationships are organized per scope')}</text>

  <rect x="808" y="126" width="750" height="682" rx="22" class="panel"/>
  <rect x="834" y="143" width="147" height="23" rx="4" class="chip"/>
  <text x="838" y="165" class="panel-title">${escapeXml(t.cube)}</text><text x="838" y="189" class="panel-copy">${escapeXml(t.cubeSub)}</text>
  <rect x="874" y="220" width="620" height="178" rx="19" class="workspace"/>
  <text x="904" y="252" class="box-title" style="font-size:16px">${escapeXml(t.workspace)}</text>
  <rect x="919" y="270" width="530" height="92" rx="14" class="agent"/>
  <text x="1184" y="306" text-anchor="middle" class="box-title" style="font-size:21px;fill:#FFFFFF">${escapeXml(t.agent)}</text>
  <text x="1184" y="334" text-anchor="middle" class="agent-copy">${escapeXml(t.agentItems)}</text>
  <path d="M1184 398V435" class="line-blue"/>
  ${box(888, 436, 592, 58, 'entry', t.surfaces, '', locale === 'zh' ? 15 : 14)}
  <path d="M986 494V535" class="line-blue"/><path d="M1285 494V535" class="line-blue"/>
  ${box(850, 536, 272, 90, 'run', t.dm, t.dmSub, 18)}
  ${box(1150, 536, 340, 90, 'run', t.groupChat, t.groupSub, 18)}
  <path d="M986 626V655H950V681" class="line-blue"/><path d="M1320 626V655H1183V681" class="line-blue"/><path d="M1320 655H1416V681" class="line-blue"/>
  ${box(850, 682, 200, 78, 'sandbox', t.directSandbox, t.directSandboxSub, locale === 'zh' ? 15 : 14)}
  ${box(1083, 682, 200, 78, 'sandbox', t.sharedSandbox, t.sharedSandboxSub, locale === 'zh' ? 14 : 12.5)}
  ${box(1316, 682, 200, 78, 'sandbox', t.isolatedSandbox, t.isolatedSandboxSub, locale === 'zh' ? 14 : 12.5)}

  <rect x="42" y="840" width="1516" height="66" rx="15" class="foot"/>
  <rect x="66" y="858" width="82" height="20" rx="3" class="chip"/>
  <text x="69" y="874" class="foot-title">${escapeXml(t.conclusion)}</text>
  <text x="${footCopyX}" y="875" class="foot-copy">${escapeXml(t.conclusionCopy)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  const svg = diagram(locale).trim();
  const svgPath = resolve(outDir, `scope-and-workspace${suffix}.svg`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 3200 }).png().toFile(svgPath.replace('.svg', '@2x.png'));
  console.log(`Created ${svgPath}`);
}
