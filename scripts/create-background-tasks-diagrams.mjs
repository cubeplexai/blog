import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outDir = resolve('static/img/blog/command-timeout-and-background-tasks');

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function multilineText(x, y, lines, fontSize = 13, lineHeight = 21, fill = '#394554', weight = 400) {
  return `<text x="${x}" y="${y}" style="font-size:${fontSize}px; fill:${fill}; font-weight:${weight}">
    ${lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')}
  </text>`;
}

const copy = {
  zh: {
    topology: {
      title: '单节点 Agent 与“手脑分离”架构的长任务拓扑',
      subtitle: '单机依靠本地操作系统进程树与管道追踪后台任务；手脑分离则需要跨越网络边界，完成分布式状态转移、游标确认与事件唤醒。',
      singleNode: '单节点 Agent（如 Claude Code / Codex）',
      singleSub: '脑与手同机运行，依赖宿主 OS 内存与进程树',
      singleScope: '本机开发环境（Local Host / Single OS）',
      singleAgent: 'Agent 进程 (CLI / Memory)',
      singleAgentSub: '推理循环 · 上下文内存 · 局部字典',
      singleShell: '后台 Shell 子进程',
      singleShellSub: '构建 · 测试 · 批处理 · 脚本',
      ipcLabel: '本地操作系统 IPC（PID 轮询 · 本地管道 stdout · SIGTERM 信号）',
      singleClaim: '无网络边界 · 无网关超时 · 进程句柄局限于单机内存',
      decoupled: '“手脑分离”架构（CubePlex + 远程沙箱）',
      decoupledSub: '控制面持有状态与策略，远程沙箱按需租用算力',
      cpScope: '受保护控制面（Control Plane API / Workers）',
      cpHarness: 'Agent Harness',
      cpHarnessSub1: 'CubeLoop While-Loop',
      cpHarnessSub2: 'TodoList 待办守卫',
      cpDb: '持久化数据库',
      cpDbSub1: 'Command Log 落盘',
      cpDbSub2: 'Checkpointer 状态',
      cpQueue: '内部事件与会话锁',
      cpQueueSub1: 'Internal Task Event',
      cpQueueSub2: '活跃 Run 锁排队',
      netBoundary: '网络边界（反向代理 / 网关 · 60s 读超时上限）',
      sandboxScope: '远程独立沙箱（CubeSandbox / K8s Pod）',
      sbRunner: '沙箱执行守护进程',
      sbRunnerSub: 'Provider Runner · 日志游标上报',
      sbProc: '持久化后台命令进程',
      sbProcSub: '独立 cgroup / 容器环境 · 默认 1 小时期限',
      flows: [
        '① 60s 超时降级注册',
        '② Command Log 落盘推进游标',
        '③ 代际栅栏取消信号',
        '④ 内部事件空闲唤醒',
      ],
      decoupledClaim: '跨网络状态转移 · 宿主校验契约 · 日志断点恢复 · 代际栅栏',
      footer: '单机后台任务本质是本地进程句柄；手脑分离后，后台任务演变为跨网络故障域的分布式生命周期治理。',
    },
    lifecycle: {
      title: '手脑分离下的长任务全生命周期流转',
      subtitle: '从 60 秒前后台分流、Todo 宿主校验到日志游标落盘与事件驱动唤醒的完整闭环。',
      step1Title: '前台同步流式',
      step1Badge: '阶段 01',
      step1Time: '0 ~ 60 秒',
      step1Lines: [
        '命令启动并开始执行',
        'stdout 实时推入当前回复',
        'HTTP / SSE 保持长连接',
        '用户与模型在前台同步等待',
      ],
      step1Tag: '连接持续占用',
      step2Title: '60s 降级转后台',
      step2Badge: '阶段 02',
      step2Time: '第 60 秒阈值',
      step2Lines: [
        '命令超时未完成',
        '注册为 Background Task',
        '声明 wait_for_tasks 列表',
        '控制面宿主校验通过后强锁 Todo',
      ],
      step2Tag: 'Todo 保持 open',
      step3Title: '当前回复收敛',
      step3Badge: '阶段 03',
      step3Time: '释放网络连接',
      step3Lines: [
        'Agent 正常结束当前回复',
        '写入持久化 Checkpoint extra',
        '释放网关连接与活跃 Run 锁',
        '向用户展示阶段性任务卡片',
      ],
      step3Tag: '网络连接释放',
      step4Title: '独立执行与日志确认',
      step4Badge: '阶段 04',
      step4Time: '沙箱内最长 1 小时',
      step4Lines: [
        '沙箱内进程继续独立运行',
        '日志写入持久化 Command Log',
        '落盘成功后推进 Provider 游标',
        '状态流转: pending ──> readable',
      ],
      step4Tag: '游标断点可恢复',
      step5Title: '内部事件空闲唤醒',
      step5Badge: '阶段 05',
      step5Time: '任务完成 / 超时',
      step5Lines: [
        '产出内部任务事件',
        '检查会话锁: 若有发言则排队',
        '会话空闲时以发起者身份唤醒',
        'Agent 检查输出并勾销 Checklist',
      ],
      step5Tag: '断点恢复完成',
      footer: '端到端契约保证：不拖垮网关长连接、不产生假装收工幻觉、不丢失未确认日志、不跨代误杀重试进程。',
    },
  },
  en: {
    topology: {
      title: 'Long-Running Task Topology: Single-Node vs Decoupled Architecture',
      subtitle: 'Single-node agents track background tasks via OS process trees; decoupled architectures require cross-network state transfer, cursor persistence, and event resumption.',
      singleNode: 'Single-Node Agent (e.g. Claude Code / Codex)',
      singleSub: 'Brain and hand share host OS memory and process tree',
      singleScope: 'Local Host Environment (Single Machine)',
      singleAgent: 'Agent Process (CLI / Memory)',
      singleAgentSub: 'Inference Loop · In-Memory State · Local Router',
      singleShell: 'Background Shell Subprocess',
      singleShellSub: 'Build · Test · Batch Processing · Scripts',
      ipcLabel: 'Local OS IPC (PID Polling · Unix Pipes stdout · SIGTERM Signals)',
      singleClaim: 'No network boundary · No gateway timeouts · Local in-memory process handles',
      decoupled: 'Decoupled Architecture (CubePlex + Remote Sandboxes)',
      decoupledSub: 'Control plane owns state and policy; remote sandboxes lease compute',
      cpScope: 'Protected Control Plane (API / Workers)',
      cpHarness: 'Agent Harness',
      cpHarnessSub1: 'CubeLoop While-Loop',
      cpHarnessSub2: 'TodoList Middleware Guard',
      cpDb: 'Persistent Database',
      cpDbSub1: 'Command Log Commit',
      cpDbSub2: 'Checkpointer State',
      cpQueue: 'Events & Run Locks',
      cpQueueSub1: 'Internal Task Event',
      cpQueueSub2: 'Active Run Lock Queue',
      netBoundary: 'Network Boundary (Reverse Proxy / Ingress · 60s Read Timeout)',
      sandboxScope: 'Remote Isolated Sandbox (CubeSandbox / K8s Pod)',
      sbRunner: 'Sandbox Execution Daemon',
      sbRunnerSub: 'Provider Runner · Log Cursor Reporting',
      sbProc: 'Persistent Background Command',
      sbProcSub: 'Isolated cgroup / Container · Default 1-Hour Deadline',
      flows: [
        '① 60s Task Demotion & Registration',
        '② Cursor Advance upon Commit',
        '③ Generation-Fenced Stop Signal',
        '④ Internal Event Idle Resumption',
      ],
      decoupledClaim: 'Cross-network state transfer · Host validation contract · Resilient log recovery · Generation fence',
      footer: 'Local background tasks are OS process handles; decoupled architectures require distributed lifecycle governance across failure domains.',
    },
    lifecycle: {
      title: 'Decoupled Background Task Lifecycle & Event Resumption',
      subtitle: 'An end-to-end state machine covering 60s demotion, host-validated Todo contracts, log cursor commits, and idle resumption.',
      step1Title: 'Synchronous Streaming',
      step1Badge: 'Step 01',
      step1Time: '0 ~ 60 Seconds',
      step1Lines: [
        'Command starts execution',
        'stdout streams into active reply',
        'HTTP / SSE connection held open',
        'User and agent wait synchronously',
      ],
      step1Tag: 'Active Connection',
      step2Title: '60s Background Demotion',
      step2Badge: 'Step 02',
      step2Time: 'At 60s Threshold',
      step2Lines: [
        'Command runtime exceeds 60s',
        'Registered as Background Task',
        'Declares wait_for_tasks list',
        'Host validation locks items open',
      ],
      step2Tag: 'Todo Remains Open',
      step3Title: 'Clean Reply Finalization',
      step3Badge: 'Step 03',
      step3Time: 'Connection Released',
      step3Lines: [
        'Agent ends reply cleanly',
        'Writes Checkpoint extra state',
        'Releases gateway connection',
        'Presents interim status card to user',
      ],
      step3Tag: 'Gateway Released',
      step4Title: 'Autonomous Execution',
      step4Badge: 'Step 04',
      step4Time: 'Up to 1 Hour in Sandbox',
      step4Lines: [
        'Sandbox process runs autonomously',
        'Logs write to durable Command Log',
        'Provider cursor advances on commit',
        'State: pending ──> readable',
      ],
      step4Tag: 'Cursor Recoverable',
      step5Title: 'Internal Event Resumption',
      step5Badge: 'Step 05',
      step5Time: 'Exit / Timeout',
      step5Lines: [
        'Emits internal task event',
        'Queues if another user speaks',
        'Resumes agent when conversation idle',
        'Agent verifies output & completes Todo',
      ],
      step5Tag: 'Clean Completion',
      footer: 'Core guarantees: no dropped gateway connections, no hallucinated completion, no lost tail logs, no misdirected stop signals across retries.',
    },
  },
};

function renderTopologyDiagram(locale) {
  const t = copy[locale].topology;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 920" role="img" aria-labelledby="top-title top-desc">
  <title id="top-title">${escapeXml(t.title)}</title>
  <desc id="top-desc">${escapeXml(t.subtitle)}</desc>
  <defs>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#1463E9"/></marker>
    <marker id="arrow-ink" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#17191C"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:30px; font-weight:760; letter-spacing:-.7px; }
      .subtitle { fill:#536171; font-size:14.5px; }
      .panel { fill:#FFFFFF; stroke:#17191C; stroke-width:2; }
      .panel-title { fill:#17191C; font-size:20px; font-weight:750; }
      .panel-sub { fill:#536171; font-size:13.5px; }
      .scope { fill:#F8FBFF; stroke:#B6C7DC; stroke-width:1.8; }
      .scope-blue { fill:#F5F9FF; stroke:#1463E9; stroke-width:2.2; }
      .scope-label { fill:#394554; font-size:13px; font-weight:700; letter-spacing:.2px; }
      .box { fill:#FFFFFF; stroke:#17191C; stroke-width:1.6; }
      .box-blue { fill:#EAF2FE; stroke:#1463E9; stroke-width:2; }
      .box-title { fill:#17191C; font-size:14.5px; font-weight:720; }
      .box-sub { fill:#536171; font-size:11.5px; }
      .line-blue { fill:none; stroke:#1463E9; stroke-width:2.2; marker-end:url(#arrow-blue); stroke-linecap:round; stroke-linejoin:round; }
      .line-ink { fill:none; stroke:#17191C; stroke-width:1.8; marker-end:url(#arrow-ink); stroke-linecap:round; }
      .line-dashed { fill:none; stroke:#E05A47; stroke-width:1.8; stroke-dasharray:6 5; }
      .net-label { fill:#B43625; font-size:12px; font-weight:700; }
      .claim { fill:#17191C; font-size:13.5px; font-weight:720; }
      .flow-chip { fill:#FFFFFF; stroke:#1463E9; stroke-width:1.3; }
      .flow-chip-text { fill:#1463E9; font-size:11px; font-weight:650; }
      .footer { fill:#FFFFFF; stroke:#17191C; stroke-width:1.5; }
      .footer-copy { fill:#394554; font-size:13.5px; }
    </style>
  </defs>
  <rect width="1600" height="920" fill="#FCFCFA"/><rect width="1600" height="920" fill="url(#grid)"/>

  <!-- Top Titles -->
  <text x="40" y="52" class="title">${escapeXml(t.title)}</text>
  <text x="40" y="80" class="subtitle">${escapeXml(t.subtitle)}</text>

  <!-- Left: Single-Node Agent -->
  <rect x="40" y="112" width="730" height="664" rx="20" class="panel"/>
  <text x="68" y="151" class="panel-title">${escapeXml(t.singleNode)}</text>
  <text x="68" y="177" class="panel-sub">${escapeXml(t.singleSub)}</text>

  <rect x="66" y="204" width="678" height="460" rx="16" class="scope"/>
  <text x="90" y="236" class="scope-label">${escapeXml(t.singleScope)}</text>

  <!-- Left Box: Agent Process -->
  <rect x="110" y="266" width="590" height="110" rx="12" class="box"/>
  <text x="136" y="306" class="box-title">${escapeXml(t.singleAgent)}</text>
  <text x="136" y="334" class="box-sub">${escapeXml(t.singleAgentSub)}</text>

  <!-- Left Center Arrow & IPC Box -->
  <path d="M370 376v76" class="line-ink"/>
  <path d="M440 452v-76" class="line-ink"/>
  <rect x="220" y="398" width="370" height="32" rx="7" fill="#FFFFFF" stroke="#17191C" stroke-width="1.3"/>
  <text x="405" y="419" text-anchor="middle" class="box-sub" style="font-weight:650; fill:#17191C">${escapeXml(t.ipcLabel)}</text>

  <!-- Left Box: Shell Subprocess -->
  <rect x="110" y="456" width="590" height="110" rx="12" class="box"/>
  <text x="136" y="496" class="box-title">${escapeXml(t.singleShell)}</text>
  <text x="136" y="524" class="box-sub">${escapeXml(t.singleShellSub)}</text>

  <!-- Left Highlight Badge -->
  <path d="M86 706h638" stroke="#FFE24A" stroke-width="26" stroke-linecap="round" opacity=".8"/>
  <text x="405" y="713" text-anchor="middle" class="claim">${escapeXml(t.singleClaim)}</text>

  <!-- Right: Decoupled Agent -->
  <rect x="830" y="112" width="730" height="664" rx="20" class="panel"/>
  <text x="858" y="151" class="panel-title">${escapeXml(t.decoupled)}</text>
  <text x="858" y="177" class="panel-sub">${escapeXml(t.decoupledSub)}</text>

  <!-- Right Top: Control Plane -->
  <rect x="856" y="204" width="678" height="180" rx="16" class="scope-blue"/>
  <text x="880" y="234" class="scope-label">${escapeXml(t.cpScope)}</text>

  <rect x="878" y="250" width="206" height="112" rx="10" class="box-blue"/>
  <text x="981" y="286" text-anchor="middle" class="box-title">${escapeXml(t.cpHarness)}</text>
  <text x="981" y="314" text-anchor="middle" class="box-sub">${escapeXml(t.cpHarnessSub1)}</text>
  <text x="981" y="334" text-anchor="middle" class="box-sub" style="color:#1463E9; font-weight:600">${escapeXml(t.cpHarnessSub2)}</text>

  <rect x="1092" y="250" width="206" height="112" rx="10" class="box"/>
  <text x="1195" y="286" text-anchor="middle" class="box-title">${escapeXml(t.cpDb)}</text>
  <text x="1195" y="314" text-anchor="middle" class="box-sub">${escapeXml(t.cpDbSub1)}</text>
  <text x="1195" y="334" text-anchor="middle" class="box-sub">${escapeXml(t.cpDbSub2)}</text>

  <rect x="1306" y="250" width="208" height="112" rx="10" class="box"/>
  <text x="1410" y="286" text-anchor="middle" class="box-title">${escapeXml(t.cpQueue)}</text>
  <text x="1410" y="314" text-anchor="middle" class="box-sub">${escapeXml(t.cpQueueSub1)}</text>
  <text x="1410" y="334" text-anchor="middle" class="box-sub">${escapeXml(t.cpQueueSub2)}</text>

  <!-- Network Boundary Divider -->
  <line x1="856" y1="416" x2="1534" y2="416" class="line-dashed"/>
  <rect x="980" y="402" width="430" height="28" rx="14" fill="#FFF2F0" stroke="#E05A47" stroke-width="1.3"/>
  <text x="1195" y="421" text-anchor="middle" class="net-label">${escapeXml(t.netBoundary)}</text>

  <!-- Right Center 4 Flow Chips -->
  <rect x="878" y="440" width="144" height="26" rx="6" class="flow-chip"/>
  <text x="950" y="457" text-anchor="middle" class="flow-chip-text">${escapeXml(t.flows[0])}</text>

  <rect x="1034" y="440" width="168" height="26" rx="6" class="flow-chip"/>
  <text x="1118" y="457" text-anchor="middle" class="flow-chip-text">${escapeXml(t.flows[1])}</text>

  <rect x="1214" y="440" width="144" height="26" rx="6" class="flow-chip"/>
  <text x="1286" y="457" text-anchor="middle" class="flow-chip-text">${escapeXml(t.flows[2])}</text>

  <rect x="1370" y="440" width="144" height="26" rx="6" class="flow-chip"/>
  <text x="1442" y="457" text-anchor="middle" class="flow-chip-text">${escapeXml(t.flows[3])}</text>

  <!-- Down & Up Connecting Arrows across network -->
  <path d="M981 362v74" class="line-blue"/>
  <path d="M1195 480v-48" class="line-blue"/>
  <path d="M1410 480v-48" class="line-blue"/>

  <!-- Right Bottom: Remote Sandbox -->
  <rect x="856" y="480" width="678" height="184" rx="16" class="scope"/>
  <text x="880" y="508" class="scope-label">${escapeXml(t.sandboxScope)}</text>

  <rect x="886" y="526" width="300" height="114" rx="10" class="box"/>
  <text x="1036" y="568" text-anchor="middle" class="box-title">${escapeXml(t.sbRunner)}</text>
  <text x="1036" y="596" text-anchor="middle" class="box-sub">${escapeXml(t.sbRunnerSub)}</text>

  <rect x="1210" y="526" width="304" height="114" rx="10" class="box-blue"/>
  <text x="1362" y="568" text-anchor="middle" class="box-title">${escapeXml(t.sbProc)}</text>
  <text x="1362" y="596" text-anchor="middle" class="box-sub">${escapeXml(t.sbProcSub)}</text>

  <!-- Right Highlight Badge -->
  <path d="M876 706h638" stroke="#FFE24A" stroke-width="26" stroke-linecap="round" opacity=".8"/>
  <text x="1195" y="713" text-anchor="middle" class="claim">${escapeXml(t.decoupledClaim)}</text>

  <!-- Bottom Global Footer -->
  <rect x="40" y="812" width="1520" height="70" rx="16" class="footer"/>
  <circle cx="74" cy="847" r="10" fill="#1463E9"/>
  <path d="M70 847l3 3 6-7" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="98" y="852" class="footer-copy">${escapeXml(t.footer)}</text>
</svg>`;
}

function renderLifecycleDiagram(locale) {
  const t = copy[locale].lifecycle;
  const steps = [
    { title: t.step1Title, badge: t.step1Badge, time: t.step1Time, lines: t.step1Lines, tag: t.step1Tag, x: 40 },
    { title: t.step2Title, badge: t.step2Badge, time: t.step2Time, lines: t.step2Lines, tag: t.step2Tag, x: 350 },
    { title: t.step3Title, badge: t.step3Badge, time: t.step3Time, lines: t.step3Lines, tag: t.step3Tag, x: 660 },
    { title: t.step4Title, badge: t.step4Badge, time: t.step4Time, lines: t.step4Lines, tag: t.step4Tag, x: 970 },
    { title: t.step5Title, badge: t.step5Badge, time: t.step5Time, lines: t.step5Lines, tag: t.step5Tag, x: 1280 },
  ];

  const stepCards = steps.map((s, idx) => `
    <!-- Step Card ${idx + 1} -->
    <rect x="${s.x}" y="160" width="280" height="470" rx="16" class="${idx === 1 || idx === 4 ? 'step-card-active' : 'step-card'}"/>

    <!-- Step Number Badge -->
    <rect x="${s.x + 20}" y="186" width="68" height="24" rx="6" fill="${idx === 1 || idx === 4 ? '#1463E9' : '#17191C'}"/>
    <text x="${s.x + 54}" y="202" text-anchor="middle" style="font-size:11px; font-weight:750; fill:#FFFFFF">${escapeXml(s.badge)}</text>

    <!-- Time Chip -->
    <rect x="${s.x + 96}" y="186" width="164" height="24" rx="6" class="${idx === 1 || idx === 4 ? 'time-chip-active' : 'time-chip'}"/>
    <text x="${s.x + 178}" y="202" text-anchor="middle" class="${idx === 1 || idx === 4 ? 'time-text-active' : 'time-text'}">${escapeXml(s.time)}</text>

    <!-- Step Title -->
    <text x="${s.x + 20}" y="246" class="step-title">${escapeXml(s.title)}</text>
    <line x1="${s.x + 20}" y1="262" x2="${s.x + 260}" y2="262" stroke="#E6EBF2" stroke-width="1.2"/>

    <!-- Step Bullet Lines -->
    ${multilineText(s.x + 22, 292, s.lines, 13, 24, '#394554', 450)}

    <!-- Step State Tag -->
    <rect x="${s.x + 20}" y="574" width="240" height="32" rx="8" class="${idx === 1 || idx === 4 ? 'tag-box-active' : 'tag-box'}"/>
    <circle cx="${s.x + 36}" cy="590" r="4" fill="${idx === 1 || idx === 4 ? '#1463E9' : '#536171'}"/>
    <text x="${s.x + 48}" y="594" class="${idx === 1 || idx === 4 ? 'tag-text-active' : 'tag-text'}">${escapeXml(s.tag)}</text>

    <!-- Connector Arrow -->
    ${idx < 4 ? `<path d="M${s.x + 280} 390h30" class="line-step-arrow"/>` : ''}
  `).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 860" role="img" aria-labelledby="life-title life-desc">
  <title id="life-title">${escapeXml(t.title)}</title>
  <desc id="life-desc">${escapeXml(t.subtitle)}</desc>
  <defs>
    <pattern id="grid2" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#E6EBF2" stroke-width="1"/></pattern>
    <marker id="arrow-blue2" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0 0L9 3.5 0 7Z" fill="#1463E9"/></marker>
    <style>
      text { font-family: Inter, 'PingFang SC', 'Noto Sans SC', sans-serif; }
      .title { fill:#17191C; font-size:30px; font-weight:760; letter-spacing:-.7px; }
      .subtitle { fill:#536171; font-size:14.5px; }
      .step-card { fill:#FFFFFF; stroke:#17191C; stroke-width:1.8; }
      .step-card-active { fill:#F5F9FF; stroke:#1463E9; stroke-width:2.2; }
      .step-title { fill:#17191C; font-size:17px; font-weight:750; }
      .time-chip { fill:#F6F8FB; stroke:#CDD7E3; stroke-width:1.2; }
      .time-chip-active { fill:#EAF2FE; stroke:#1463E9; stroke-width:1.3; }
      .time-text { fill:#536171; font-size:11px; font-weight:650; }
      .time-text-active { fill:#1463E9; font-size:11px; font-weight:700; }
      .line-step-arrow { fill:none; stroke:#1463E9; stroke-width:2.4; marker-end:url(#arrow-blue2); stroke-linecap:round; }
      .tag-box { fill:#F6F8FB; stroke:#CDD7E3; stroke-width:1.2; }
      .tag-box-active { fill:#EAF2FE; stroke:#1463E9; stroke-width:1.4; }
      .tag-text { fill:#536171; font-size:11.5px; font-weight:650; }
      .tag-text-active { fill:#1463E9; font-size:11.5px; font-weight:720; }
      .summary-box { fill:#FFFFFF; stroke:#17191C; stroke-width:1.6; }
      .summary-copy { fill:#17191C; font-size:14px; font-weight:650; }
    </style>
  </defs>
  <rect width="1600" height="860" fill="#FCFCFA"/><rect width="1600" height="860" fill="url(#grid2)"/>

  <!-- Top Titles -->
  <text x="40" y="56" class="title">${escapeXml(t.title)}</text>
  <text x="40" y="86" class="subtitle">${escapeXml(t.subtitle)}</text>

  <!-- Step Cards -->
  ${stepCards}

  <!-- Bottom Summary Banner -->
  <rect x="40" y="670" width="1520" height="80" rx="16" class="summary-box"/>
  <rect x="64" y="695" width="144" height="30" rx="6" fill="#FFE24A"/>
  <text x="136" y="715" text-anchor="middle" style="font-size:12px; font-weight:750; fill:#17191C">SYSTEM CONTRACT</text>
  <text x="228" y="715" class="summary-copy">${escapeXml(t.footer)}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const [locale, suffix] of [['zh', ''], ['en', '-en']]) {
  // 1. Topology diagram
  const topSvg = renderTopologyDiagram(locale).trim().replace(/[ \t]+$/gm, '');
  const topPath = resolve(outDir, `single-node-vs-decoupled-topology${suffix}.svg`);
  await writeFile(topPath, topSvg);
  await sharp(Buffer.from(topSvg)).resize({ width: 3200 }).png().toFile(topPath.replace('.svg', '@2x.png'));
  console.log(`Created ${topPath}`);

  // 2. Lifecycle diagram
  const lifeSvg = renderLifecycleDiagram(locale).trim().replace(/[ \t]+$/gm, '');
  const lifePath = resolve(outDir, `background-task-lifecycle-and-recovery${suffix}.svg`);
  await writeFile(lifePath, lifeSvg);
  await sharp(Buffer.from(lifeSvg)).resize({ width: 3200 }).png().toFile(lifePath.replace('.svg', '@2x.png'));
  console.log(`Created ${lifePath}`);
}
