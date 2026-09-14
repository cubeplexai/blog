import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outDir = resolve('static/img/blog/cubeplex-vs-deerflow-workspace-and-harness');

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const copy = {
  zh: {
    title: 'Harness 线程 vs Workspace 边界',
    subtitle: 'DeerFlow 2.0 以 Gateway + Thread/Run 跑长程任务；CubePlex 以 Workspace 固定团队 Agent 与治理入口。',
    deer: 'DeerFlow 2.0：Super Agent Harness',
    deerSub: 'Lead Agent 编排 skills、工具、sub-agent；sandbox 服务本次 run',
    gateway: 'Gateway',
    thread: 'Thread',
    run: 'Run',
    lead: 'Lead Agent',
    leadSub: 'LangGraph / LangChain',
    skills: 'Skills · Tools',
    subs: 'Sub-agents',
    sand: 'Sandbox',
    sandSub: 'Local / Docker / K8s',
    channels: 'IM 通道（可选）',
    cube: 'CubePlex：团队 Agent Workspace',
    cubeSub: '先定 Workspace Agent，再由入口切会话、身份与执行',
    org: 'Org',
    workspace: 'Workspace',
    agent: 'Team Agent',
    agentItems: 'Persona · Skills · MCP · memory',
    durable: 'Durable Sandbox',
    durableSub: '跨重启保留工作现场',
    entries: 'Web · Slack · Discord · Teams · 飞书 · 钉钉 · 企微',
    gov: '角色 · 审批 · 共享策略',
    foot: '怎么选',
    footCopy: '要一条可编排的长程 harness 线程，看 DeerFlow 2.0。要团队共用、可治理的长期工作现场，看 CubePlex Workspace。',
  },
  en: {
    title: 'Harness Thread vs Workspace Boundary',
    subtitle: 'DeerFlow 2.0 runs long-horizon work through Gateway + Thread/Run. CubePlex fixes a team Agent under Workspace governance.',
    deer: 'DeerFlow 2.0: Super Agent Harness',
    deerSub: 'A lead agent orchestrates skills, tools, and sub-agents; the sandbox serves the current run',
    gateway: 'Gateway',
    thread: 'Thread',
    run: 'Run',
    lead: 'Lead Agent',
    leadSub: 'LangGraph / LangChain',
    skills: 'Skills · Tools',
    subs: 'Sub-agents',
    sand: 'Sandbox',
    sandSub: 'Local / Docker / K8s',
    channels: 'IM channels (optional)',
    cube: 'CubePlex: Team Agent Workspace',
    cubeSub: 'Define the Workspace Agent first; entry points split conversation, identity, and execution',
    org: 'Org',
    workspace: 'Workspace',
    agent: 'Team Agent',
    agentItems: 'Persona · Skills · MCP · memory',
    durable: 'Durable Sandbox',
    durableSub: 'keeps the work site across restarts',
    entries: 'Web · Slack · Discord · Teams · Feishu · DingTalk · WeCom',
    gov: 'roles · approvals · sharing policy',
    foot: 'Fit',
    footCopy: 'For an orchestrated long-horizon harness thread, look at DeerFlow 2.0. For a shared, governed team work site, look at a CubePlex Workspace.',
  },
};

function box(x, y, w, h, cls, title, sub = '', titleSize = 15) {
  const cx = x + w / 2;
  const titleY = sub ? y + h / 2 - 6 : y + h / 2 + 5;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="${cls}"/>
    <text x="${cx}" y="${titleY}" text-anchor="middle" class="box-title" style="font-size:${titleSize}px">${escapeXml(title)}</text>
    ${sub ? `<text x="${cx}" y="${y + h / 2 + 16}" text-anchor="middle" class="box-sub">${escapeXml(sub)}</text>` : ''}`;
}

function diagram(locale) {
  const t = copy[locale];
  const footX = locale === 'zh' ? 150 : 140;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 920" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(t.title)}</title>
  <desc id="desc">${escapeXml(t.footCopy)}</desc>
  <defs>
    <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4 0 8Z" fill="#1463E9"/></marker>
    <marker id="arrow-ink" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4 0 8Z" fill="#17191C"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:30px; font-weight:750; letter-spacing:-.6px; }
      .subtitle { fill:#536171; font-size:15px; }
      .panel { fill:#FFFFFF; stroke:#17191C; stroke-width:2; }
      .panel-title { fill:#17191C; font-size:17px; font-weight:700; }
      .panel-copy { fill:#536171; font-size:12.5px; }
      .entry { fill:#FFFFFF; stroke:#17191C; stroke-width:1.7; }
      .key { fill:#EAF2FE; stroke:#1463E9; stroke-width:2.2; }
      .agent { fill:#1463E9; stroke:#17191C; stroke-width:2; }
      .sandbox { fill:#EAF2FE; stroke:#17191C; stroke-width:1.7; }
      .workspace { fill:#EAF2FE; stroke:#1463E9; stroke-width:2.5; }
      .box-title { fill:#17191C; font-weight:700; }
      .agent-title { fill:#FFFFFF; }
      .box-sub { fill:#536171; font-size:12px; }
      .agent-copy { fill:#FFFFFF; font-size:13px; }
      .line-blue { fill:none; stroke:#1463E9; stroke-width:2.2; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .line-ink { fill:none; stroke:#17191C; stroke-width:1.6; marker-end:url(#arrow-ink); stroke-linecap:round; stroke-linejoin:round; }
      .chip { fill:#FFE24A; opacity:.78; }
      .foot { fill:#FFFFFF; stroke:#17191C; stroke-width:1.5; }
      .foot-title { fill:#17191C; font-size:14px; font-weight:750; }
      .foot-copy { fill:#394554; font-size:13.5px; }
    </style>
  </defs>
  <rect width="1600" height="920" fill="#FCFCFA"/><rect width="1600" height="920" fill="url(#grid)"/>
  <path d="M48 88C210 28 380 36 470 96" fill="none" stroke="#EAF2FE" stroke-width="28" stroke-linecap="round"/>
  <text x="48" y="52" class="title">${escapeXml(t.title)}</text>
  <text x="48" y="78" class="subtitle">${escapeXml(t.subtitle)}</text>

  <rect x="40" y="110" width="740" height="680" rx="22" class="panel"/>
  <text x="68" y="148" class="panel-title">${escapeXml(t.deer)}</text>
  <text x="68" y="172" class="panel-copy">${escapeXml(t.deerSub)}</text>
  ${box(250, 198, 320, 52, 'entry', t.gateway, '', 16)}
  <path d="M410 250V284" class="line-blue"/>
  ${box(160, 284, 220, 56, 'entry', t.thread, '', 15)}
  ${box(440, 284, 220, 56, 'key', t.run, '', 15)}
  <path d="M550 340V372" class="line-blue"/>
  <rect x="200" y="372" width="420" height="78" rx="12" class="agent"/>
  <text x="410" y="404" text-anchor="middle" class="agent-title" style="font-size:17px;font-weight:700">${escapeXml(t.lead)}</text>
  <text x="410" y="428" text-anchor="middle" class="agent-copy">${escapeXml(t.leadSub)}</text>
  <path d="M300 450V480" class="line-ink"/><path d="M520 450V480" class="line-ink"/>
  ${box(120, 480, 260, 56, 'entry', t.skills, '', 14)}
  ${box(440, 480, 260, 56, 'entry', t.subs, '', 14)}
  <path d="M410 536V566" class="line-blue"/>
  ${box(200, 566, 420, 88, 'sandbox', t.sand, t.sandSub, 16)}
  <path d="M410 654V682" class="line-ink"/>
  ${box(200, 682, 420, 52, 'entry', t.channels, '', 14)}

  <rect x="820" y="110" width="740" height="680" rx="22" class="panel"/>
  <rect x="846" y="128" width="90" height="22" rx="4" class="chip"/>
  <text x="848" y="148" class="panel-title">${escapeXml(t.cube)}</text>
  <text x="848" y="172" class="panel-copy">${escapeXml(t.cubeSub)}</text>
  ${box(1040, 198, 300, 52, 'entry', t.org, '', 16)}
  <path d="M1190 250V280" class="line-blue"/>
  <rect x="900" y="280" width="580" height="430" rx="18" class="workspace"/>
  <text x="930" y="314" class="box-title" style="font-size:15px">${escapeXml(t.workspace)}</text>
  <rect x="940" y="336" width="500" height="78" rx="12" class="agent"/>
  <text x="1190" y="368" text-anchor="middle" class="agent-title" style="font-size:16px;font-weight:700">${escapeXml(t.agent)}</text>
  <text x="1190" y="392" text-anchor="middle" class="agent-copy">${escapeXml(t.agentItems)}</text>
  <path d="M1190 414V444" class="line-blue"/>
  ${box(940, 444, 500, 88, 'sandbox', t.durable, t.durableSub, 16)}
  <path d="M1190 532V560" class="line-ink"/>
  ${box(940, 560, 500, 56, 'entry', t.entries, '', locale === 'zh' ? 13 : 12)}
  <path d="M1190 616V640" class="line-ink"/>
  ${box(940, 640, 500, 40, 'entry', t.gov, '', 13)}

  <rect x="40" y="816" width="1520" height="70" rx="15" class="foot"/>
  <rect x="64" y="836" width="70" height="20" rx="3" class="chip"/>
  <text x="68" y="852" class="foot-title">${escapeXml(t.foot)}</text>
  <text x="${footX}" y="853" class="foot-copy">${escapeXml(t.footCopy)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  const svg = diagram(locale).trim();
  const svgPath = resolve(outDir, `harness-and-workspace${suffix}.svg`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 3200 }).png().toFile(svgPath.replace('.svg', '@2x.png'));
  console.log(`Created ${svgPath}`);
}
