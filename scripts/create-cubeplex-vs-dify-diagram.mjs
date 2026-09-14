import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outDir = resolve('static/img/blog/cubeplex-vs-dify-team-agent-workspace');

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const copy = {
  zh: {
    title: 'Sandbox 挂在谁的边界上',
    subtitle: 'Dify New Agent 的沙箱跟任务会话走；CubePlex 的沙箱挂在 Workspace 下，跟着团队治理一起留着。',
    dify: 'Dify：Studio 资源 → 发布为 App / Workflow',
    difySub: 'New Agent 自带 Linux sandbox：shell、装 CLI、读写文件',
    studio: 'Studio',
    app: 'Chat App / API',
    workflow: 'Workflow 中的 Agent 节点',
    newAgent: 'New Agent（beta）',
    agentCfg: 'prompt · skills · tools · env',
    sandbox: 'Agent Sandbox',
    sandboxSub: '任务 / 会话边界',
    classic: '另有 Code 节点 sandbox（Python/JS）',
    cube: 'CubePlex：Workspace 下的长期工作机',
    cubeSub: 'Org / Workspace 角色与审批；IM 与 Web 共用同一 Workspace Agent',
    org: 'Org',
    workspace: 'Workspace',
    agent: 'Team Agent',
    agentItems: 'Persona · Skills · MCP · memory',
    durable: 'Durable Sandbox',
    durableSub: '文件 / 包 / worktree 跨重启',
    entries: 'Web · Slack · Discord · Teams · 飞书 · 钉钉 · 企微',
    governance: '角色 · 审批 · 共享策略',
    foot: '边界差异',
    footCopy: '两边都能在隔离环境里跑命令。差别在于沙箱属于 Agent 任务会话，还是属于团队 Workspace 的持久电脑。',
  },
  en: {
    title: 'Whose Boundary Owns the Sandbox',
    subtitle: 'Dify New Agent sandboxes follow the task session. CubePlex sandboxes hang under the Workspace with team governance.',
    dify: 'Dify: Studio resource → publish as App / Workflow',
    difySub: 'Each New Agent has its own Linux sandbox: shell, CLI installs, file I/O',
    studio: 'Studio',
    app: 'Chat App / API',
    workflow: 'Agent node in a Workflow',
    newAgent: 'New Agent (beta)',
    agentCfg: 'prompt · skills · tools · env',
    sandbox: 'Agent Sandbox',
    sandboxSub: 'task / session boundary',
    classic: 'Separate Code-node sandbox (Python/JS) still exists',
    cube: 'CubePlex: durable work computer under a Workspace',
    cubeSub: 'Org / Workspace roles and approvals; IM and Web share one Workspace Agent',
    org: 'Org',
    workspace: 'Workspace',
    agent: 'Team Agent',
    agentItems: 'Persona · Skills · MCP · memory',
    durable: 'Durable Sandbox',
    durableSub: 'files / packages / worktree across restarts',
    entries: 'Web · Slack · Discord · Teams · Feishu · DingTalk · WeCom',
    governance: 'roles · approvals · sharing policy',
    foot: 'Boundary cut',
    footCopy: 'Both run commands in isolation. The cut is whether the sandbox belongs to an Agent task session or to the team Workspace durable computer.',
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
  const footX = locale === 'zh' ? 170 : 200;
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
      .agent .box-title, .agent-title { fill:#FFFFFF; }
      .box-sub { fill:#536171; font-size:12px; }
      .agent-copy { fill:#FFFFFF; font-size:13px; }
      .line-blue { fill:none; stroke:#1463E9; stroke-width:2.2; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .line-ink { fill:none; stroke:#17191C; stroke-width:1.6; marker-end:url(#arrow-ink); stroke-linecap:round; stroke-linejoin:round; }
      .note { fill:#536171; font-size:12.5px; }
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
  <text x="68" y="148" class="panel-title">${escapeXml(t.dify)}</text>
  <text x="68" y="172" class="panel-copy">${escapeXml(t.difySub)}</text>
  ${box(250, 198, 320, 54, 'entry', t.studio, '', 16)}
  <path d="M410 252V286" class="line-ink"/>
  ${box(90, 286, 280, 68, 'entry', t.app, '', 14)}
  ${box(410, 286, 320, 68, 'entry', t.workflow, '', 14)}
  <path d="M230 354V386H410V416" class="line-blue"/><path d="M570 354V386H410V416" class="line-blue"/>
  ${box(200, 416, 420, 86, 'key', t.newAgent, t.agentCfg, 16)}
  <path d="M410 502V534" class="line-blue"/>
  ${box(200, 534, 420, 96, 'sandbox', t.sandbox, t.sandboxSub, 17)}
  <text x="410" y="680" text-anchor="middle" class="note">${escapeXml(t.classic)}</text>

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
  ${box(940, 640, 500, 40, 'entry', t.governance, '', 13)}

  <rect x="40" y="816" width="1520" height="70" rx="15" class="foot"/>
  <rect x="64" y="836" width="82" height="20" rx="3" class="chip"/>
  <text x="68" y="852" class="foot-title">${escapeXml(t.foot)}</text>
  <text x="${footX}" y="853" class="foot-copy">${escapeXml(t.footCopy)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  const svg = diagram(locale).trim();
  const svgPath = resolve(outDir, `sandbox-boundary${suffix}.svg`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 3200 }).png().toFile(svgPath.replace('.svg', '@2x.png'));
  console.log(`Created ${svgPath}`);
}
