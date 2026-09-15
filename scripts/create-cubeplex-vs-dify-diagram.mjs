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
    title: '长期 Agent 与场景化 App',
    subtitle: '两种产品从不同位置开始一次工作',
    dify: 'Dify：先选择场景 App',
    difySub: '每个 App 封装一类问题的模型、流程、知识与工具',
    user: '用户',
    app1: '知识问答 App',
    app2: '合同审核 App',
    app3: '报告 Workflow',
    appConfig: '独立配置 · 独立发布 · 独立入口',
    published: 'Web App · API · Embed · MCP',
    cube: 'CubePlex：先进入长期 Agent',
    cubeSub: '不同工作复用同一 Workspace Agent 的能力与长期上下文',
    team: '个人 / 团队',
    agent: 'Workspace Agent',
    context: 'Persona · memory · Skills · MCP',
    task1: '研究',
    task2: '开发',
    task3: '运维',
    task4: '内容',
    computer: '持续电脑环境',
    computerSub: '按用户 / 会话 / Topic 划分',
    footLabel: '设计起点',
    foot: 'Dify 把能力封装成不同 App；CubePlex 让不同工作进入同一个长期 Agent。',
  },
  en: {
    title: 'Long-lived Agent vs Scenario Apps',
    subtitle: 'Two products start work from different places',
    dify: 'Dify: choose a scenario App first',
    difySub: 'Each App packages the model, flow, knowledge, and tools for one problem',
    user: 'User',
    app1: 'Knowledge Q&A App',
    app2: 'Contract Review App',
    app3: 'Report Workflow',
    appConfig: 'separate config · publish · entry',
    published: 'Web App · API · Embed · MCP',
    cube: 'CubePlex: enter a long-lived Agent first',
    cubeSub: 'Different work reuses one Workspace Agent and its long-term context',
    team: 'Person / Team',
    agent: 'Workspace Agent',
    context: 'Persona · memory · Skills · MCP',
    task1: 'Research',
    task2: 'Coding',
    task3: 'Operations',
    task4: 'Content',
    computer: 'Durable computer environment',
    computerSub: 'scoped by user / conversation / topic',
    footLabel: 'Starting point',
    foot: 'Dify packages capabilities into Apps; CubePlex brings different work to one long-lived Agent.',
  },
};

function card(x, y, w, h, title, sub = '', className = 'card', titleSize = 15) {
  const cx = x + w / 2;
  const titleY = sub ? y + h / 2 - 5 : y + h / 2 + 5;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="${className}"/>
    <text x="${cx}" y="${titleY}" text-anchor="middle" class="card-title" style="font-size:${titleSize}px">${escapeXml(title)}</text>
    ${sub ? `<text x="${cx}" y="${y + h / 2 + 18}" text-anchor="middle" class="card-sub">${escapeXml(sub)}</text>` : ''}`;
}

function personIcon(x, y) {
  return `<circle cx="${x}" cy="${y}" r="17" class="icon-fill"/>
    <path d="M${x - 30} ${y + 42}C${x - 26} ${y + 12} ${x + 26} ${y + 12} ${x + 30} ${y + 42}" class="icon-line"/>`;
}

function appIcon(x, y) {
  return `<rect x="${x - 23}" y="${y - 22}" width="46" height="44" rx="8" class="icon-box"/>
    <circle cx="${x - 10}" cy="${y - 9}" r="3" fill="#1463E9"/>
    <path d="M${x - 14} ${y + 2}H${x + 13}M${x - 14} ${y + 11}H${x + 7}" class="icon-line-small"/>`;
}

function agentIcon(x, y) {
  return `<rect x="${x - 34}" y="${y - 25}" width="68" height="50" rx="17" class="agent-head"/>
    <path d="M${x} ${y - 25}V${y - 37}M${x - 22} ${y + 29}L${x - 30} ${y + 49}M${x + 22} ${y + 29}L${x + 30} ${y + 49}" class="icon-line"/>
    <circle cx="${x - 14}" cy="${y}" r="4" fill="#FFFFFF"/><circle cx="${x + 14}" cy="${y}" r="4" fill="#FFFFFF"/>`;
}

function diagram(locale) {
  const t = copy[locale];
  const en = locale === 'en';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(t.title)}</title>
  <desc id="desc">${escapeXml(t.foot)}</desc>
  <defs>
    <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4 0 8Z" fill="#1463E9"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:31px; font-weight:760; letter-spacing:-.6px; }
      .subtitle { fill:#536171; font-size:15px; }
      .panel { fill:#FFFFFF; stroke:#17191C; stroke-width:2; }
      .panel-title { fill:#17191C; font-size:19px; font-weight:730; }
      .panel-sub { fill:#536171; font-size:13px; }
      .card { fill:#FFFFFF; stroke:#17191C; stroke-width:1.7; }
      .app-card { fill:#EAF2FE; stroke:#1463E9; stroke-width:2.1; }
      .agent-card { fill:#1463E9; stroke:#17191C; stroke-width:2.1; }
      .computer-card { fill:#EAF2FE; stroke:#17191C; stroke-width:1.7; }
      .task-card { fill:#FFFFFF; stroke:#1463E9; stroke-width:1.7; }
      .card-title { fill:#17191C; font-weight:700; }
      .agent-card + text, .agent-title { fill:#FFFFFF; }
      .card-sub { fill:#536171; font-size:12px; }
      .agent-sub { fill:#FFFFFF; font-size:12.5px; }
      .line { fill:none; stroke:#1463E9; stroke-width:2.3; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .line-dashed { fill:none; stroke:#1463E9; stroke-width:1.8; stroke-dasharray:7 7; stroke-linecap:round; }
      .label { fill:#536171; font-size:12.5px; }
      .chip { fill:#FFE24A; opacity:.78; }
      .foot { fill:#FFFFFF; stroke:#17191C; stroke-width:1.5; }
      .foot-title { fill:#17191C; font-size:14px; font-weight:750; }
      .foot-copy { fill:#394554; font-size:13.5px; }
      .icon-fill { fill:#EAF2FE; stroke:#17191C; stroke-width:2; }
      .icon-line { fill:none; stroke:#17191C; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
      .icon-line-small { fill:none; stroke:#17191C; stroke-width:1.7; stroke-linecap:round; }
      .icon-box { fill:#FFFFFF; stroke:#17191C; stroke-width:1.8; }
      .agent-head { fill:#1463E9; stroke:#17191C; stroke-width:2.2; }
    </style>
  </defs>
  <rect width="1600" height="900" fill="#FCFCFA"/><rect width="1600" height="900" fill="url(#grid)"/>
  <path d="M45 88C205 26 370 38 480 100" fill="none" stroke="#EAF2FE" stroke-width="28" stroke-linecap="round"/>
  <text x="48" y="51" class="title">${escapeXml(t.title)}</text>
  <text x="48" y="78" class="subtitle">${escapeXml(t.subtitle)}</text>

  <rect x="40" y="110" width="740" height="650" rx="22" class="panel"/>
  <text x="70" y="151" class="panel-title">${escapeXml(t.dify)}</text>
  <text x="70" y="176" class="panel-sub">${escapeXml(t.difySub)}</text>
  ${personIcon(122, 255)}
  <text x="122" y="322" text-anchor="middle" class="label">${escapeXml(t.user)}</text>
  <path d="M156 263H214" class="line"/>
  <path d="M214 263V236H274M214 263H274M214 263V290H274" class="line-dashed"/>
  ${appIcon(310, 236)}${card(350, 202, 350, 68, t.app1, '', 'app-card', en ? 14 : 15)}
  ${appIcon(310, 320)}${card(350, 286, 350, 68, t.app2, '', 'app-card', en ? 14 : 15)}
  ${appIcon(310, 404)}${card(350, 370, 350, 68, t.app3, '', 'app-card', en ? 14 : 15)}
  <path d="M525 438V478" class="line"/>
  ${card(215, 478, 485, 76, t.appConfig, '', 'card', en ? 13 : 14)}
  <path d="M458 554V590" class="line"/>
  ${card(215, 590, 485, 68, t.published, '', 'card', 14)}

  <rect x="820" y="110" width="740" height="650" rx="22" class="panel"/>
  <rect x="846" y="130" width="98" height="23" rx="4" class="chip"/>
  <text x="850" y="151" class="panel-title">${escapeXml(t.cube)}</text>
  <text x="850" y="176" class="panel-sub">${escapeXml(t.cubeSub)}</text>
  ${personIcon(900, 255)}
  <text x="900" y="322" text-anchor="middle" class="label">${escapeXml(t.team)}</text>
  <path d="M935 263H1000" class="line"/>
  <rect x="1000" y="208" width="470" height="112" rx="17" class="agent-card"/>
  ${agentIcon(1060, 263)}
  <text x="1230" y="253" text-anchor="middle" class="agent-title" style="font-size:18px;font-weight:730">${escapeXml(t.agent)}</text>
  <text x="1230" y="281" text-anchor="middle" class="agent-sub">${escapeXml(t.context)}</text>
  <path d="M1235 320V370" class="line"/>
  ${card(995, 370, 120, 62, t.task1, '', 'task-card', 14)}
  ${card(1130, 370, 120, 62, t.task2, '', 'task-card', 14)}
  ${card(1265, 370, 120, 62, t.task3, '', 'task-card', 14)}
  ${card(1400, 370, 120, 62, t.task4, '', 'task-card', 14)}
  <path d="M1055 370V350H1460V370M1190 350V370M1325 350V370" class="line-dashed"/>
  <path d="M1235 432V492" class="line"/>
  ${card(1000, 492, 470, 94, t.computer, t.computerSub, 'computer-card', en ? 15 : 16)}
  <path d="M1035 610C1100 650 1380 650 1445 610" fill="none" stroke="#EAF2FE" stroke-width="22" stroke-linecap="round"/>

  <rect x="40" y="790" width="1520" height="72" rx="15" class="foot"/>
  <rect x="64" y="811" width="${en ? 105 : 82}" height="21" rx="3" class="chip"/>
  <text x="68" y="828" class="foot-title">${escapeXml(t.footLabel)}</text>
  <text x="${en ? 190 : 170}" y="829" class="foot-copy">${escapeXml(t.foot)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  const svg = diagram(locale)
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
  const svgPath = resolve(outDir, `sandbox-boundary${suffix}.svg`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 3200 }).png().toFile(svgPath.replace('.svg', '@2x.png'));
  console.log(`Created ${svgPath}`);
}
