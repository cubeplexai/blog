import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outDir = resolve('static/img/blog/managed-agents-architecture');

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const base = (width, height, title, description) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#27272a" stroke-width=".7"/></pattern>
    <marker id="arrow-blue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#6a83e3"/></marker>
    <marker id="arrow-gray" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#71717a"/></marker>
    <style>
      text{font-family:Inter,'PingFang SC','Noto Sans SC',sans-serif}
      .mono{font-family:'JetBrains Mono','PingFang SC','Noto Sans SC',monospace}
      .title{fill:#f4f4f5;font-size:30px;font-weight:700;letter-spacing:-.5px}
      .subtitle{fill:#a1a1aa;font-size:15px}
      .panel{fill:#0a0a0b;stroke:#3f3f46;stroke-width:1.3}
      .panel-title{fill:#93a6ec;font-size:17px;font-weight:650}
      .panel-copy{fill:#71717a;font-size:12px}
      .box{fill:#0a0a0b;stroke:#3f3f46;stroke-width:1.25}
      .key{fill:#14213d;stroke:#6a83e3;stroke-width:1.7}
      .sandbox-frame{fill:#0c2f28;stroke:#34d399;stroke-width:1.7}
      .secret{fill:#101014;stroke:#52525b;stroke-width:1.25}
      .name{fill:#f4f4f5;font-size:15px;font-weight:600}
      .sub{fill:#a1a1aa;font-size:11.5px}
      .tiny{fill:#71717a;font-size:10.5px}
      .label{fill:#93a6ec;font-size:10.5px;font-weight:600}
      .line-blue{fill:none;stroke:#6a83e3;stroke-width:1.8;marker-end:url(#arrow-blue);stroke-linejoin:round}
      .line-gray{fill:none;stroke:#71717a;stroke-width:1.4;marker-end:url(#arrow-gray);stroke-linejoin:round}
      .line-secret{fill:none;stroke:#6a83e3;stroke-width:1.3;stroke-dasharray:5 5;marker-end:url(#arrow-blue);stroke-linejoin:round}
      .chip{fill:#18181b;stroke:#3f3f46;stroke-width:1}
      .chip-text{fill:#d4d4d8;font-size:10.5px}
      .foot{fill:#0a0a0b;stroke:#3f3f46;stroke-width:1.1}
      .foot-title{fill:#93a6ec;font-size:11px;font-weight:650}
      .foot-copy{fill:#a1a1aa;font-size:11px}
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="#18181b"/><rect width="${width}" height="${height}" fill="url(#grid)"/>
`;

const box = ({ x, y, w, h, kind = 'box', name, sub = '', tiny = '', nameSize, anchor = 'middle' }) => {
  const tx = anchor === 'middle' ? x + w / 2 : x + 18;
  const style = nameSize ? ` style="font-size:${nameSize}px"` : '';
  const firstY = tiny ? y + 29 : sub ? y + h / 2 - 4 : y + h / 2 + 5;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="${kind}"/>
  <text x="${tx}" y="${firstY}" text-anchor="${anchor}" class="name"${style}>${escapeXml(name)}</text>
  ${sub ? `<text x="${tx}" y="${firstY + 21}" text-anchor="${anchor}" class="sub">${escapeXml(sub)}</text>` : ''}
  ${tiny ? `<text x="${tx}" y="${firstY + 41}" text-anchor="${anchor}" class="tiny mono">${escapeXml(tiny)}</text>` : ''}`;
};

const chip = (x, y, w, label) => `<rect x="${x}" y="${y}" width="${w}" height="25" rx="4" class="chip"/><text x="${x + w / 2}" y="${y + 17}" text-anchor="middle" class="chip-text">${escapeXml(label)}</text>`;

function placementDiagram(locale) {
  const zh = locale === 'zh';
  const t = zh ? {
    title: 'Managed Agents 的两种 Harness 架构',
    subtitle: '比较 Agent loop、持久状态与运行凭据分别位于控制面还是单个 Sandbox。',
    leftTitle: 'Sandbox 内 Harness', leftCopy: '模型循环、工具进程与运行凭据共享一个隔离环境',
    rightTitle: '控制面 Harness', rightCopy: 'Agent 状态与长期凭据独立存在，Sandbox 是执行租约',
    cp: 'Managed Agent 管控面', cpSub: 'definition · queue · status', provider: 'Model Provider', providerSub: 'remote inference API',
    sandbox: 'SANDBOX · ONE AGENT', harness: 'Agent Harness', harnessSub: 'context · model loop · retry · approval',
    runtime: 'Local Tool Runtime', runtimeSub: 'Shell / PTY · Files · Browser · Workspace / MCP',
    env: 'Sandbox env / secrets', envSub: '模型密钥 · MCP token · 应用环境变量', envTiny: '与 Harness 和工具进程处于同一边界',
    definition: 'Agent Definition', definitionSub: 'version · policy', state: 'Durable State', stateSub: 'trajectory · events',
    vault: 'Secret Vault / Broker', vaultSub: '长期凭据 · RBAC', cloud: 'Cloud Agent Harness', cloudSub: 'model loop · scheduling · recovery',
    api: 'Execution API / Lease Manager', apiSub: '创建、替换、回收并注入任务级环境', leases: 'SANDBOX LEASES',
    a: 'Sandbox A', aSub: 'Code · task env', b: 'Sandbox B', bSub: 'Browser · session token', c: 'Sandbox C', cSub: 'GPU · job env',
    inject: '仅注入 scoped env / short-lived token',
    lifecycle: 'Harness、tool runtime、env / secrets 随 Sandbox 一起启动与回收',
    footTitle: '凭据边界', foot: '左：运行凭据进入 Sandbox，并与 Harness 共享故障边界。右：长期 secrets 留在控制面，Sandbox 只接收当前任务所需的短期权限。',
  } : {
    title: 'Two Harness Architectures for Managed Agents',
    subtitle: 'Where the agent loop, durable state, and runtime credentials live determines the system boundary.',
    leftTitle: 'Harness inside the sandbox', leftCopy: 'The model loop, tool processes, and runtime credentials share one environment',
    rightTitle: 'Control-plane harness', rightCopy: 'Agent state and long-lived credentials persist independently of sandbox leases',
    cp: 'Managed Agent Control Plane', cpSub: 'definition · queue · status', provider: 'Model Provider', providerSub: 'remote inference API',
    sandbox: 'SANDBOX · ONE AGENT', harness: 'Agent Harness', harnessSub: 'context · model loop · retry · approval',
    runtime: 'Local Tool Runtime', runtimeSub: 'Shell / PTY · Files · Browser · Workspace / MCP',
    env: 'Sandbox env / secrets', envSub: 'model key · MCP tokens · application env', envTiny: 'same boundary as the harness and tool processes',
    definition: 'Agent Definition', definitionSub: 'version · policy', state: 'Durable State', stateSub: 'trajectory · events',
    vault: 'Secret Vault / Broker', vaultSub: 'long-lived credentials · RBAC', cloud: 'Cloud Agent Harness', cloudSub: 'model loop · scheduling · recovery',
    api: 'Execution API / Lease Manager', apiSub: 'create, replace, release, and inject task context', leases: 'SANDBOX LEASES',
    a: 'Sandbox A', aSub: 'Code · task env', b: 'Sandbox B', bSub: 'Browser · session token', c: 'Sandbox C', cSub: 'GPU · job env',
    inject: 'scoped env / short-lived tokens only',
    lifecycle: 'Harness, tool runtime, env, and secrets start and stop with the sandbox',
    footTitle: 'Credential boundary', foot: 'Left: runtime credentials enter the sandbox and share the harness fault boundary. Right: long-lived secrets stay in the control plane; each lease receives only task-scoped access.',
  };

  return `${base(1600, 1000, t.title, t.subtitle)}
  <text x="46" y="54" class="title">${escapeXml(t.title)}</text><text x="46" y="82" class="subtitle">${escapeXml(t.subtitle)}</text>
  <rect x="42" y="118" width="735" height="790" rx="14" class="panel"/><rect x="823" y="118" width="735" height="790" rx="14" class="panel"/>
  <text x="72" y="153" class="panel-title">${escapeXml(t.leftTitle)}</text><text x="72" y="176" class="panel-copy">${escapeXml(t.leftCopy)}</text>
  <text x="853" y="153" class="panel-title">${escapeXml(t.rightTitle)}</text><text x="853" y="176" class="panel-copy">${escapeXml(t.rightCopy)}</text>

  <path d="M235 284V350H410V390" class="line-blue"/><path d="M650 390V325H642V284" class="line-gray"/><path d="M410 480V530" class="line-blue"/><path d="M410 620V670" class="line-blue"/>
  ${box({x:82,y:215,w:306,h:69,kind:'key',name:t.cp,sub:t.cpSub,nameSize:14})}
  ${box({x:510,y:215,w:264,h:69,name:t.provider,sub:t.providerSub})}
  <rect x="72" y="330" width="675" height="525" rx="11" class="sandbox-frame"/><text x="94" y="362" class="label mono">${escapeXml(t.sandbox)}</text>
  ${box({x:115,y:390,w:590,h:90,kind:'key',name:t.harness,sub:t.harnessSub,nameSize:17})}
  ${box({x:115,y:530,w:590,h:90,name:t.runtime,sub:t.runtimeSub,nameSize:16})}
  ${box({x:115,y:670,w:590,h:105,kind:'secret',name:t.env,sub:t.envSub,tiny:t.envTiny,nameSize:16})}
  <rect x="115" y="670" width="5" height="105" rx="2" fill="#6a83e3"/>
  <text x="410" y="824" text-anchor="middle" class="tiny">${escapeXml(t.lifecycle)}</text>

  <path d="M958 284V350" class="line-blue"/><path d="M1190 284V330H1190V350" class="line-gray"/><path d="M1370 284V330H1190V350" class="line-secret"/>
  <path d="M1190 445V505" class="line-blue"/><path d="M1190 575V645H965V690" class="line-blue"/><path d="M1190 645V690" class="line-blue"/><path d="M1190 645H1415V690" class="line-blue"/>
  <path d="M1370 284V625H1450V675" class="line-secret"/>
  ${box({x:850,y:215,w:215,h:69,name:t.definition,sub:t.definitionSub,nameSize:14})}
  ${box({x:1082,y:215,w:215,h:69,name:t.state,sub:t.stateSub,nameSize:14})}
  ${box({x:1314,y:215,w:215,h:69,kind:'secret',name:t.vault,sub:t.vaultSub,nameSize:13})}
  <rect x="1314" y="215" width="5" height="69" rx="2" fill="#6a83e3"/>
  ${box({x:930,y:350,w:520,h:95,kind:'key',name:t.cloud,sub:t.cloudSub,nameSize:17})}
  ${box({x:960,y:505,w:460,h:70,name:t.api,sub:t.apiSub,nameSize:14})}
  <text x="1450" y="615" text-anchor="end" class="label">${escapeXml(t.inject)}</text>
  <rect x="850" y="650" width="680" height="205" rx="11" class="box"/><text x="872" y="680" class="label mono">${escapeXml(t.leases)}</text>
  ${box({x:875,y:690,w:180,h:108,kind:'sandbox-frame',name:t.a,sub:t.aSub,nameSize:14})}
  ${box({x:1100,y:690,w:180,h:108,kind:'sandbox-frame',name:t.b,sub:t.bSub,nameSize:14})}
  ${box({x:1325,y:690,w:180,h:108,kind:'sandbox-frame',name:t.c,sub:t.cSub,nameSize:14})}

  <rect x="42" y="930" width="1516" height="48" rx="7" class="foot"/><text x="62" y="950" class="foot-title">${escapeXml(t.footTitle)}</text><text x="62" y="968" class="foot-copy">${escapeXml(t.foot)}</text>
</svg>`;
}

function orchestrationDiagram(locale) {
  const zh = locale === 'zh';
  const t = zh ? {
    title: 'Harness 与 Sandbox 解耦', subtitle: '一个长期 Managed Agent 可以按需控制多个隔离执行环境。',
    cpTitle: 'Managed Agent Control Plane', cpCopy: '身份、运行状态和长期凭据不依附某个 Sandbox',
    definition: 'AgentDefinition + Version', definitionSub: 'instructions · model · tools · permissions',
    harness: 'Cloud Agent Harness', harnessSub: 'plan · model loop · fan-out · merge · recovery',
    state: 'Durable Run State', stateSub: 'trajectory · leases · events · artifacts', stateTiny: 'checkpoint · idempotency keys',
    vault: 'Secret Vault / Broker', vaultSub: 'long-lived secrets · policy', vaultTiny: 'issue scoped env / short-lived tokens',
    poolTitle: 'Sandbox Pool · Isolated Compute', poolCopy: '每个 lease 拥有独立镜像、网络策略、环境变量和生命周期',
    a: 'Sandbox A · Code', aSub: '修复方案 A / 独立 Git 分支', aTool: 'Shell · Files', aEnv: 'ENV · repo token',
    b: 'Sandbox B · Browser', bSub: '页面验证 / 独立网络上下文', bTool: 'Browser', bEnv: 'ENV · session token',
    c: 'Sandbox C · GPU / Matrix', cSub: '特殊硬件 / 不同依赖组合', cTool: 'GPU job', cEnv: 'ENV · job credential',
    results: 'Result / Artifact References', resultsSub: 'patch · tests · screenshots · metrics',
    merge: 'Harness 汇总结果并决定下一轮', mergeSub: '处理部分失败 · 合并 artifacts · 回收 leases',
    wait: '等待审批 / 定时器 / Webhook', waitSub: '0 个活跃 Sandbox 也能保留 Agent 状态',
    fanOut: 'fan-out + scoped env', fanIn: 'fan-in',
    foot: '长期身份、状态和 secrets 留在控制面；Sandbox 只获得当前 lease 所需的执行上下文。',
  } : {
    title: 'Decoupling the Harness from Sandboxes', subtitle: 'One long-running Managed Agent can control multiple isolated execution environments on demand.',
    cpTitle: 'Managed Agent Control Plane', cpCopy: 'Identity, run state, and long-lived credentials do not depend on one sandbox',
    definition: 'AgentDefinition + Version', definitionSub: 'instructions · model · tools · permissions',
    harness: 'Cloud Agent Harness', harnessSub: 'plan · model loop · fan-out · merge · recovery',
    state: 'Durable Run State', stateSub: 'trajectory · leases · events · artifacts', stateTiny: 'checkpoint · idempotency keys',
    vault: 'Secret Vault / Broker', vaultSub: 'long-lived secrets · policy', vaultTiny: 'issue scoped env / short-lived tokens',
    poolTitle: 'Sandbox Pool · Isolated Compute', poolCopy: 'Each lease has its own image, network policy, environment, and lifecycle',
    a: 'Sandbox A · Code', aSub: 'repair A / isolated Git branch', aTool: 'Shell · Files', aEnv: 'ENV · repo token',
    b: 'Sandbox B · Browser', bSub: 'page validation / isolated network context', bTool: 'Browser', bEnv: 'ENV · session token',
    c: 'Sandbox C · GPU / Matrix', cSub: 'special hardware / dependency variants', cTool: 'GPU job', cEnv: 'ENV · job credential',
    results: 'Result / Artifact References', resultsSub: 'patch · tests · screenshots · metrics',
    merge: 'Harness merges results and chooses the next step', mergeSub: 'handle partial failure · merge artifacts · release leases',
    wait: 'Wait for approval / timer / webhook', waitSub: 'Agent state persists with zero active sandboxes',
    fanOut: 'fan-out + scoped env', fanIn: 'fan-in',
    foot: 'Long-lived identity, state, and secrets stay in the control plane; a sandbox receives only the execution context required by its current lease.',
  };

  return `${base(1600, 960, t.title, t.subtitle)}
  <text x="46" y="54" class="title">${escapeXml(t.title)}</text><text x="46" y="82" class="subtitle">${escapeXml(t.subtitle)}</text>
  <rect x="42" y="118" width="480" height="745" rx="14" class="panel"/><text x="72" y="155" class="panel-title">${escapeXml(t.cpTitle)}</text><text x="72" y="178" class="panel-copy">${escapeXml(t.cpCopy)}</text>
  <path d="M282 275V325" class="line-blue"/><path d="M282 420V485H170V525" class="line-gray"/><path d="M282 485H392V525" class="line-secret"/>
  ${box({x:82,y:215,w:400,h:60,name:t.definition,sub:t.definitionSub,nameSize:14})}
  ${box({x:82,y:325,w:400,h:95,kind:'key',name:t.harness,sub:t.harnessSub,nameSize:17})}
  ${box({x:72,y:525,w:205,h:110,name:t.state,sub:t.stateSub,tiny:t.stateTiny,nameSize:13})}
  ${box({x:287,y:525,w:205,h:110,kind:'secret',name:t.vault,sub:t.vaultSub,tiny:t.vaultTiny,nameSize:12.5})}
  <rect x="287" y="525" width="5" height="110" rx="2" fill="#6a83e3"/>
  ${box({x:82,y:700,w:400,h:72,name:t.wait,sub:t.waitSub,nameSize:14})}

  <rect x="578" y="118" width="980" height="610" rx="14" class="panel"/><text x="608" y="155" class="panel-title">${escapeXml(t.poolTitle)}</text><text x="608" y="178" class="panel-copy">${escapeXml(t.poolCopy)}</text>
  <path d="M522 372H555V250H750V285" class="line-blue"/><path d="M555 250H1070V285" class="line-blue"/><path d="M555 250H1390V285" class="line-blue"/>
  <path d="M492 580H545V270H720" class="line-secret"/><text x="600" y="239" class="label">${escapeXml(t.fanOut)}</text>
  ${box({x:620,y:285,w:280,h:180,kind:'key',name:t.a,sub:t.aSub,nameSize:15})}${chip(650,410,105,t.aTool)}${chip(765,410,105,t.aEnv)}
  ${box({x:930,y:285,w:280,h:180,kind:'key',name:t.b,sub:t.bSub,nameSize:15})}${chip(960,410,105,t.bTool)}${chip(1075,410,105,t.bEnv)}
  ${box({x:1240,y:285,w:280,h:180,kind:'key',name:t.c,sub:t.cSub,nameSize:14})}${chip(1270,410,105,t.cTool)}${chip(1385,410,105,t.cEnv)}
  <path d="M760 465V535H1070V570" class="line-gray"/><path d="M1070 465V570" class="line-gray"/><path d="M1380 465V535H1070V570" class="line-gray"/>
  ${box({x:760,y:570,w:620,h:70,name:t.results,sub:t.resultsSub,nameSize:15})}

  <path d="M1070 640V770H980" class="line-gray"/><text x="1086" y="754" class="label">${escapeXml(t.fanIn)}</text>
  ${box({x:620,y:770,w:760,h:74,kind:'key',name:t.merge,sub:t.mergeSub,nameSize:16})}
  <path d="M620 807H530V372H522" class="line-blue"/>
  <rect x="42" y="885" width="1516" height="48" rx="7" class="foot"/><text x="62" y="914" class="foot-copy">${escapeXml(t.foot)}</text>
</svg>`;
}

const outputs = [
  ['harness-placement-comparison.svg', placementDiagram('zh')],
  ['harness-placement-comparison-en.svg', placementDiagram('en')],
  ['control-plane-multi-sandbox.svg', orchestrationDiagram('zh')],
  ['control-plane-multi-sandbox-en.svg', orchestrationDiagram('en')],
];

for (const [filename, svg] of outputs) {
  const svgPath = resolve(outDir, filename);
  const pngPath = svgPath.replace(/\.svg$/, '@2x.png');
  const normalized = svg.trimStart().replace(/[ \t]+$/gm, '');
  await writeFile(svgPath, normalized);
  await sharp(Buffer.from(normalized)).resize({width: 3200}).png().toFile(pngPath);
  console.log(`Created ${filename} and ${pngPath.split('/').at(-1)}`);
}
