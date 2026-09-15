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
    title: '持久文件跟随什么？',
    subtitle: '两者都可以重建容器并重新挂载文件；区别在于持久目录属于 Thread，还是 Workspace 中的工作现场。',
    deer: 'DeerFlow 2.0',
    deerSub: '一条 Thread 对应一套独立文件',
    threadA: 'Thread A',
    threadB: '新建 Thread B',
    sandboxA: 'Sandbox A',
    sandboxB: 'Sandbox B',
    compute: '计算环境可回收',
    filesA: 'Thread A 文件',
    filesB: 'Thread B 文件',
    persistent: '持久存储',
    deerClaim: '要继续原来的文件，回到原 Thread',
    cube: 'CubePlex',
    cubeSub: '对话可以更换，工作目录继续使用',
    workspace: 'Workspace A（Organization 中的一个 Workspace）',
    conversationA: 'Conversation A',
    conversationB: '新建 Conversation B',
    memberSandbox: '成员的 Workspace Sandbox',
    memberFiles: '个人工作目录',
    group: '群聊 / Topic',
    sharedSandbox: '共享 Sandbox',
    sharedFiles: '团队工作目录',
    cubeClaim: '新开对话仍可继续已有文件；团队成员可接手共享现场',
    legendCompute: '可替换的计算容器',
    legendStorage: '持续保留的文件目录',
    footer: '计算资源都可以临时存在。DeerFlow 把文件绑定到个人 Thread；CubePlex 把文件绑定到 Workspace 内的个人或共享工作范围。',
  },
  en: {
    title: 'What Do Persistent Files Follow?',
    subtitle: 'Both can rebuild containers and remount files. The durable directory belongs to a Thread or to a working context inside a Workspace.',
    deer: 'DeerFlow 2.0',
    deerSub: 'Each Thread carries a separate set of files',
    threadA: 'Thread A',
    threadB: 'New Thread B',
    sandboxA: 'Sandbox A',
    sandboxB: 'Sandbox B',
    compute: 'compute can be reclaimed',
    filesA: 'Thread A files',
    filesB: 'Thread B files',
    persistent: 'persistent storage',
    deerClaim: 'Return to the original Thread to continue its files',
    cube: 'CubePlex',
    cubeSub: 'Change the conversation and keep the working directory',
    workspace: 'Workspace A (one of many in the Organization)',
    conversationA: 'Conversation A',
    conversationB: 'New Conversation B',
    memberSandbox: "Member's Workspace Sandbox",
    memberFiles: 'Personal working directory',
    group: 'Group / Topic',
    sharedSandbox: 'Shared Sandbox',
    sharedFiles: 'Team working directory',
    cubeClaim: 'A new chat can continue existing files; teammates can take over shared work',
    legendCompute: 'replaceable compute container',
    legendStorage: 'durable file directory',
    footer: 'Compute can be temporary in both products. DeerFlow binds files to a personal Thread; CubePlex binds them to personal or shared work inside a Workspace.',
  },
};

function conversation(x, y, w, label, active = false) {
  return `<g>
    <path d="M${x + 16} ${y}H${x + w - 16}Q${x + w} ${y} ${x + w} ${y + 16}V${y + 48}Q${x + w} ${y + 64} ${x + w - 16} ${y + 64}H${x + 46}L${x + 28} ${y + 80}L${x + 31} ${y + 64}H${x + 16}Q${x} ${y + 64} ${x} ${y + 48}V${y + 16}Q${x} ${y} ${x + 16} ${y}Z" class="${active ? 'conversation-active' : 'conversation'}"/>
    <circle cx="${x + 24}" cy="${y + 31}" r="7" fill="${active ? '#FFE24A' : '#9CBDEA'}"/>
    <text x="${x + w / 2 + 8}" y="${y + 37}" text-anchor="middle" class="conversation-text${active ? ' conversation-text-active' : ''}">${escapeXml(label)}</text>
  </g>`;
}

function sandbox(x, y, w, h, title, sub) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" class="sandbox"/>
    <path d="M${x + 30} ${y + 34}l12 9-12 9M${x + 49} ${y + 52}h18" fill="none" stroke="#1463E9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${x + w / 2 + 18}" y="${y + 42}" text-anchor="middle" class="box-title">${escapeXml(title)}</text>
    <text x="${x + w / 2}" y="${y + 72}" text-anchor="middle" class="box-sub">${escapeXml(sub)}</text>
    <path d="M${x + 24} ${y + h - 18}q28-13 56 0t56 0t56 0" fill="none" stroke="#9CBDEA" stroke-width="2" stroke-linecap="round"/>
  </g>`;
}

function storage(x, y, w, h, title, sub) {
  return `<g>
    <path d="M${x} ${y + 20}Q${x} ${y} ${x + 20} ${y}H${x + 58}L${x + 76} ${y + 18}H${x + w - 18}Q${x + w} ${y + 18} ${x + w} ${y + 36}V${y + h - 18}Q${x + w} ${y + h} ${x + w - 18} ${y + h}H${x + 18}Q${x} ${y + h} ${x} ${y + h - 18}Z" class="storage"/>
    <path d="M${x + 22} ${y + 43}h${w - 44}M${x + 22} ${y + 58}h${w - 62}" stroke="#5CAFB3" stroke-width="3" stroke-linecap="round"/>
    <text x="${x + w / 2}" y="${y + h + 25}" text-anchor="middle" class="box-title">${escapeXml(title)}</text>
    <text x="${x + w / 2}" y="${y + h + 46}" text-anchor="middle" class="box-sub">${escapeXml(sub)}</text>
  </g>`;
}

function diagram(locale) {
  const t = copy[locale];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 920" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(t.title)}</title>
  <desc id="desc">${escapeXml(t.footer)}</desc>
  <defs>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#1463E9"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:31px; font-weight:760; letter-spacing:-.7px; }
      .subtitle { fill:#536171; font-size:15px; }
      .panel { fill:#FFFFFF; stroke:#17191C; stroke-width:2; }
      .panel-title { fill:#17191C; font-size:21px; font-weight:750; }
      .panel-sub { fill:#536171; font-size:14px; }
      .conversation { fill:#FFFFFF; stroke:#9CBDEA; stroke-width:1.8; }
      .conversation-active { fill:#1463E9; stroke:#17191C; stroke-width:2; }
      .conversation-text { fill:#394554; font-size:13px; font-weight:700; }
      .conversation-text-active { fill:#FFFFFF; }
      .sandbox { fill:#F8FBFF; stroke:#1463E9; stroke-width:2; stroke-dasharray:8 6; }
      .storage { fill:#E8F7F6; stroke:#17191C; stroke-width:2; }
      .box-title { fill:#17191C; font-size:13px; font-weight:720; }
      .box-sub { fill:#536171; font-size:11.5px; }
      .line { fill:none; stroke:#1463E9; stroke-width:2.2; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .workspace { fill:#EAF2FE; stroke:#1463E9; stroke-width:2.5; }
      .workspace-title { fill:#1463E9; font-size:14px; font-weight:750; }
      .claim { fill:#17191C; font-size:14px; font-weight:730; }
      .legend { fill:#FFFFFF; stroke:#CDD7E3; stroke-width:1.2; }
      .legend-text { fill:#536171; font-size:12px; }
      .footer { fill:#FFFFFF; stroke:#17191C; stroke-width:1.5; }
      .footer-copy { fill:#394554; font-size:13.5px; }
    </style>
  </defs>
  <rect width="1600" height="920" fill="#FCFCFA"/><rect width="1600" height="920" fill="url(#grid)"/>
  <path d="M52 92C230 28 400 34 500 96" fill="none" stroke="#EAF2FE" stroke-width="30" stroke-linecap="round"/>
  <text x="48" y="52" class="title">${escapeXml(t.title)}</text>
  <text x="48" y="79" class="subtitle">${escapeXml(t.subtitle)}</text>

  <rect x="40" y="112" width="730" height="664" rx="24" class="panel"/>
  <text x="68" y="151" class="panel-title">${escapeXml(t.deer)}</text>
  <text x="68" y="177" class="panel-sub">${escapeXml(t.deerSub)}</text>
  ${conversation(78, 250, 176, t.threadA, true)}
  ${sandbox(290, 236, 220, 112, t.sandboxA, t.compute)}
  ${storage(574, 240, 146, 86, t.filesA, t.persistent)}
  <path d="M254 287H284M510 292H566" class="line"/>
  ${conversation(78, 482, 176, t.threadB)}
  ${sandbox(290, 468, 220, 112, t.sandboxB, t.compute)}
  ${storage(574, 472, 146, 86, t.filesB, t.persistent)}
  <path d="M254 519H284M510 524H566" class="line"/>
  <path d="M100 674H708" stroke="#FFE24A" stroke-width="24" stroke-linecap="round" opacity=".72"/>
  <text x="404" y="680" text-anchor="middle" class="claim">${escapeXml(t.deerClaim)}</text>

  <rect x="830" y="112" width="730" height="664" rx="24" class="panel"/>
  <text x="858" y="151" class="panel-title">${escapeXml(t.cube)}</text>
  <text x="858" y="177" class="panel-sub">${escapeXml(t.cubeSub)}</text>
  <rect x="856" y="208" width="678" height="424" rx="20" class="workspace"/>
  <text x="880" y="238" class="workspace-title">${escapeXml(t.workspace)}</text>
  ${conversation(882, 276, 188, t.conversationA, true)}
  ${conversation(882, 382, 188, t.conversationB)}
  ${sandbox(1110, 306, 238, 132, t.memberSandbox, t.compute)}
  ${storage(1382, 316, 128, 82, t.memberFiles, t.persistent)}
  <path d="M1070 313C1088 313 1090 339 1104 348M1070 419C1088 419 1090 401 1104 394M1348 372H1374" class="line"/>
  ${conversation(882, 514, 188, t.group)}
  ${sandbox(1110, 500, 238, 102, t.sharedSandbox, t.compute)}
  ${storage(1382, 508, 128, 70, t.sharedFiles, t.persistent)}
  <path d="M1070 551H1104M1348 551H1374" class="line"/>
  <path d="M896 674H1496" stroke="#FFE24A" stroke-width="24" stroke-linecap="round" opacity=".72"/>
  <text x="1196" y="680" text-anchor="middle" class="claim">${escapeXml(t.cubeClaim)}</text>

  <rect x="40" y="800" width="1520" height="82" rx="16" class="footer"/>
  <rect x="68" y="820" width="26" height="20" rx="6" class="sandbox"/>
  <text x="105" y="836" class="legend-text">${escapeXml(t.legendCompute)}</text>
  <path d="M330 820h28l8 8h30v20h-66Z" class="storage"/>
  <text x="410" y="836" class="legend-text">${escapeXml(t.legendStorage)}</text>
  <text x="68" y="864" class="footer-copy">${escapeXml(t.footer)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  const svg = diagram(locale).trim().replace(/[ \t]+$/gm, '');
  const svgPath = resolve(outDir, `sandbox-persistence${suffix}.svg`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 3200 }).png().toFile(svgPath.replace('.svg', '@2x.png'));
  console.log(`Created ${svgPath}`);
}
