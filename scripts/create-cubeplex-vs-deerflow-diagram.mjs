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
    title: 'Agent 和工作状态归谁所有？',
    subtitle: '两者都支持多用户，区别在于每位用户拥有自己的 Agent，还是团队共同拥有一个 Workspace Agent。',
    deer: 'DeerFlow 2.0',
    deerSub: '每位用户拥有一套个人 Agent 环境',
    deployment: '同一套 DeerFlow 部署',
    users: ['用户 A', '用户 B', '用户 C'],
    personalAgent: '个人 Agent',
    personalItems: ['Memory', 'Skills', 'Files'],
    deerClaim: '多个用户 · 各自独立的 Agent 环境',
    cube: 'CubePlex',
    cubeSub: 'Workspace 成员共同使用和管理一个 Agent',
    organization: 'Organization（可包含多个 Workspace）',
    workspaces: ['Workspace A', 'Workspace B', 'Workspace C'],
    members: ['成员 A', '成员 B', '成员 C'],
    workspace: 'Workspace A（当前）',
    sharedAgent: 'Workspace Agent',
    persona: 'Persona',
    teamMemory: '团队 Memory',
    skillsMcp: 'Skills + MCP',
    files: '长期工作现场',
    governance: '成员角色 · 凭据授权 · 审批策略',
    cubeClaim: '一个 Workspace · 团队共享的 Agent 与工作状态',
    footer: 'DeerFlow 把 Agent 状态留给个人账号；CubePlex 把 Agent 状态留在 Workspace，成员更替后团队仍可继续。',
  },
  en: {
    title: 'Who Owns the Agent and Its Working State?',
    subtitle: 'Both support multiple users. The difference is personal ownership or one Workspace Agent owned by the team.',
    deer: 'DeerFlow 2.0',
    deerSub: 'Each user owns a personal Agent environment',
    deployment: 'One DeerFlow deployment',
    users: ['User A', 'User B', 'User C'],
    personalAgent: 'Personal Agent',
    personalItems: ['Memory', 'Skills', 'Files'],
    deerClaim: 'Many users · Separate Agent environments',
    cube: 'CubePlex',
    cubeSub: 'Workspace members share and manage one Agent',
    organization: 'Organization (multiple Workspaces)',
    workspaces: ['Workspace A', 'Workspace B', 'Workspace C'],
    members: ['Member A', 'Member B', 'Member C'],
    workspace: 'Workspace A (selected)',
    sharedAgent: 'Workspace Agent',
    persona: 'Persona',
    teamMemory: 'Team Memory',
    skillsMcp: 'Skills + MCP',
    files: 'Persistent worksite',
    governance: 'member roles · credential grants · approval policy',
    cubeClaim: 'One Workspace · Shared Agent and working state',
    footer: 'DeerFlow keeps Agent state with each user account. CubePlex keeps it in the Workspace so the team can continue when members change.',
  },
};

function person(x, y, label, accent = '#EAF2FE') {
  return `<g>
    <circle cx="${x}" cy="${y}" r="20" fill="${accent}" stroke="#17191C" stroke-width="2"/>
    <path d="M${x - 30} ${y + 48}C${x - 28} ${y + 20} ${x + 28} ${y + 20} ${x + 30} ${y + 48}" fill="${accent}" stroke="#17191C" stroke-width="2" stroke-linecap="round"/>
    <path d="M${x - 13} ${y - 3}q13 9 26 0" fill="none" stroke="#17191C" stroke-width="1.5" stroke-linecap="round"/>
    <text x="${x}" y="${y + 70}" text-anchor="middle" class="person-label">${escapeXml(label)}</text>
  </g>`;
}

function bot(x, y, label, large = false) {
  const w = large ? 148 : 116;
  const h = large ? 92 : 76;
  const rx = large ? 22 : 18;
  const faceW = large ? 88 : 68;
  const faceH = large ? 38 : 30;
  return `<g>
    <path d="M${x} ${y - h / 2 - 17}v14" stroke="#17191C" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y - h / 2 - 21}" r="5" fill="#FFE24A" stroke="#17191C" stroke-width="2"/>
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="#1463E9" stroke="#17191C" stroke-width="2.4"/>
    <rect x="${x - faceW / 2}" y="${y - faceH / 2 - 7}" width="${faceW}" height="${faceH}" rx="${faceH / 2}" fill="#FFFFFF" stroke="#17191C" stroke-width="2"/>
    <circle cx="${x - faceW / 4}" cy="${y - 7}" r="4" fill="#17191C"/>
    <circle cx="${x + faceW / 4}" cy="${y - 7}" r="4" fill="#17191C"/>
    <path d="M${x - 13} ${y + 5}q13 10 26 0" fill="none" stroke="#17191C" stroke-width="2" stroke-linecap="round"/>
    <text x="${x}" y="${y + h / 2 + 23}" text-anchor="middle" class="bot-label">${escapeXml(label)}</text>
  </g>`;
}

function chip(x, y, w, label, blue = false) {
  return `<rect x="${x}" y="${y}" width="${w}" height="34" rx="9" class="${blue ? 'chip-blue' : 'chip'}"/>
    <text x="${x + w / 2}" y="${y + 22}" text-anchor="middle" class="chip-text${blue ? ' chip-text-blue' : ''}">${escapeXml(label)}</text>`;
}

function diagram(locale) {
  const t = copy[locale];
  const cardXs = [78, 302, 526];
  const memberXs = [970, 1195, 1420];
  const personalCards = cardXs.map((x, index) => `
    <rect x="${x}" y="274" width="198" height="354" rx="18" class="personal-card"/>
    ${person(x + 99, 318, t.users[index], index === 1 ? '#FFF4C8' : '#EAF2FE')}
    <path d="M${x + 99} 390V416" class="line-ink"/>
    ${bot(x + 99, 468, t.personalAgent)}
    ${t.personalItems.map((item, itemIndex) => chip(x + 27, 538 + itemIndex * 30, 144, item)).join('')}
  `).join('');

  const members = memberXs.map((x, index) => `${person(x, 315, t.members[index], index === 1 ? '#FFF4C8' : '#EAF2FE')}
    <path d="M${x} 394C${x} 405 ${1195 + (index - 1) * 58} 404 ${1195 + (index - 1) * 36} 422" class="line-blue"/>`).join('');
  const workspaceTabs = t.workspaces.map((workspace, index) => {
    const x = 1050 + (index * 138);
    return `<rect x="${x}" y="247" width="126" height="34" rx="9" class="workspace-tab${index === 0 ? ' workspace-tab-active' : ''}"/>
      <circle cx="${x + 16}" cy="264" r="5" class="workspace-dot${index === 0 ? ' workspace-dot-active' : ''}"/>
      <text x="${x + 71}" y="269" text-anchor="middle" class="workspace-tab-text${index === 0 ? ' workspace-tab-text-active' : ''}">${escapeXml(workspace)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 920" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(t.title)}</title>
  <desc id="desc">${escapeXml(t.footer)}</desc>
  <defs>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#1463E9"/></marker>
    <marker id="arrow-ink" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#17191C"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:31px; font-weight:760; letter-spacing:-.7px; }
      .subtitle { fill:#536171; font-size:15px; }
      .panel { fill:#FFFFFF; stroke:#17191C; stroke-width:2; }
      .panel-title { fill:#17191C; font-size:21px; font-weight:750; }
      .panel-sub { fill:#536171; font-size:14px; }
      .scope { fill:#F8FBFF; stroke:#9CBDEA; stroke-width:1.8; stroke-dasharray:7 6; }
      .scope-blue { fill:#F5F9FF; stroke:#1463E9; stroke-width:2.4; }
      .scope-label { fill:#394554; font-size:13px; font-weight:700; letter-spacing:.2px; }
      .personal-card { fill:#FFFFFF; stroke:#B6C7DC; stroke-width:1.6; }
      .workspace { fill:#EAF2FE; stroke:#1463E9; stroke-width:2.6; }
      .workspace-label { fill:#1463E9; font-size:16px; font-weight:760; }
      .workspace-tab { fill:#FFFFFF; stroke:#9CBDEA; stroke-width:1.4; }
      .workspace-tab-active { fill:#1463E9; stroke:#17191C; stroke-width:1.7; }
      .workspace-dot { fill:#9CBDEA; }
      .workspace-dot-active { fill:#FFE24A; }
      .workspace-tab-text { fill:#536171; font-size:10.5px; font-weight:650; }
      .workspace-tab-text-active { fill:#FFFFFF; }
      .person-label { fill:#394554; font-size:12.5px; font-weight:650; }
      .bot-label { fill:#17191C; font-size:13px; font-weight:720; }
      .chip { fill:#F6F8FB; stroke:#CDD7E3; stroke-width:1.2; }
      .chip-blue { fill:#FFFFFF; stroke:#1463E9; stroke-width:1.5; }
      .chip-text { fill:#536171; font-size:11.5px; font-weight:620; }
      .chip-text-blue { fill:#1D4F9C; }
      .line-blue { fill:none; stroke:#1463E9; stroke-width:2.2; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .line-ink { fill:none; stroke:#17191C; stroke-width:1.5; marker-end:url(#arrow-ink); stroke-linecap:round; }
      .claim { fill:#17191C; font-size:14px; font-weight:730; }
      .governance { fill:#FFFFFF; stroke:#17191C; stroke-width:1.4; }
      .governance-text { fill:#394554; font-size:12px; font-weight:650; }
      .footer { fill:#FFFFFF; stroke:#17191C; stroke-width:1.5; }
      .footer-copy { fill:#394554; font-size:13.5px; }
    </style>
  </defs>
  <rect width="1600" height="920" fill="#FCFCFA"/><rect width="1600" height="920" fill="url(#grid)"/>
  <path d="M52 92C230 28 400 34 500 96" fill="none" stroke="#EAF2FE" stroke-width="30" stroke-linecap="round"/>
  <path d="M1360 55q95 25 170 105" fill="none" stroke="#EAF2FE" stroke-width="18" stroke-linecap="round"/>
  <text x="48" y="52" class="title">${escapeXml(t.title)}</text>
  <text x="48" y="79" class="subtitle">${escapeXml(t.subtitle)}</text>

  <rect x="40" y="112" width="730" height="664" rx="24" class="panel"/>
  <text x="68" y="151" class="panel-title">${escapeXml(t.deer)}</text>
  <text x="68" y="177" class="panel-sub">${escapeXml(t.deerSub)}</text>
  <rect x="66" y="204" width="678" height="448" rx="20" class="scope"/>
  <text x="88" y="235" class="scope-label">${escapeXml(t.deployment)}</text>
  ${personalCards}
  <path d="M101 696H710" stroke="#FFE24A" stroke-width="24" stroke-linecap="round" opacity=".72"/>
  <text x="405" y="702" text-anchor="middle" class="claim">${escapeXml(t.deerClaim)}</text>

  <rect x="830" y="112" width="730" height="664" rx="24" class="panel"/>
  <text x="858" y="151" class="panel-title">${escapeXml(t.cube)}</text>
  <text x="858" y="177" class="panel-sub">${escapeXml(t.cubeSub)}</text>
  <rect x="856" y="204" width="678" height="448" rx="20" class="scope-blue"/>
  <text x="878" y="235" class="scope-label">${escapeXml(t.organization)}</text>
  ${workspaceTabs}
  ${members}
  <rect x="894" y="418" width="602" height="202" rx="20" class="workspace"/>
  <text x="918" y="447" class="workspace-label">${escapeXml(t.workspace)}</text>
  ${bot(1195, 490, t.sharedAgent, true)}
  ${chip(918, 458, 142, t.persona, true)}
  ${chip(918, 506, 142, t.teamMemory, true)}
  ${chip(1330, 458, 142, t.skillsMcp, true)}
  ${chip(1330, 506, 142, t.files, true)}
  <rect x="1020" y="578" width="350" height="28" rx="8" class="governance"/>
  <text x="1195" y="597" text-anchor="middle" class="governance-text">${escapeXml(t.governance)}</text>
  <path d="M908 696H1482" stroke="#FFE24A" stroke-width="24" stroke-linecap="round" opacity=".72"/>
  <text x="1195" y="702" text-anchor="middle" class="claim">${escapeXml(t.cubeClaim)}</text>

  <rect x="40" y="812" width="1520" height="70" rx="16" class="footer"/>
  <circle cx="74" cy="847" r="10" fill="#1463E9"/>
  <path d="M70 847l3 3 6-7" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="98" y="852" class="footer-copy">${escapeXml(t.footer)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  const svg = diagram(locale).trim().replace(/[ \t]+$/gm, '');
  const svgPath = resolve(outDir, `harness-and-workspace${suffix}.svg`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 3200 }).png().toFile(svgPath.replace('.svg', '@2x.png'));
  console.log(`Created ${svgPath}`);
}
