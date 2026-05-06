# DESIGN_SYSTEM.md

> 本文件是 **SpaceX-inspired AI-directed aerospace interface experience** 的**设计总纲**。
> 任何由 Cursor / Claude Code / Codex 发起的代码修改，必须在动手前阅读此文档，并遵守第五节《禁止破坏的稳定逻辑》。
> 本文档以**当前已存在的代码与资产为基线**，不是空想出来的规范。

---

## 一、网站核心定位

### 1.1 一句话定位
一个 **SpaceX-inspired 的 AI-directed aerospace interface experience**——以 SpaceX 为视觉母题、对标 Awwwards 的电影感交互网页。

### 1.2 它**是**什么
- 一段以 SpaceX 为母题的 **speculative 航天交互体验**：观众滚下来像走进一段任务剪辑，而不是阅读一份履历。
- 一个把视觉系统、滚动叙事、3D 物体、文字 reveal 整合到一起的**电影感网页**，目标对标 Awwwards site of the day。
- 幕后制作方法是 **AI-assisted / AI-directed**——视觉决策、文案打磨、交互节奏、前端落地都借助 AI 协同完成；这是制作过程的属性，**不是网页正文要传达的主题**。

### 1.3 它**不是**什么
- ❌ 不是 SpaceX 官网复刻。
- ❌ 不是为 SpaceX 真实产品做营销。
- ❌ **不是个人作品集 / portfolio**——网页正文不要出现"我是谁、我做过什么、雇我、看我履历"这类自指内容；不出现作者姓名、头像、简历链接、项目截图。
- ❌ 不是炫技 demo 集合，每个页面都必须服务于 **"SpaceX-inspired 任务体验"** 这一总叙事。
- ❌ 不要使用 SpaceX 真实的法律商标用语、产品发布日期、官方产品名作为正文文案——SVG wordmark 仅作为视觉母题保留。

### 1.4 受众
- 第一受众：欣赏 Awwwards-style 电影感网页的访客——他们来看一段被精心编排的视觉叙事，不来读简历。
- 第二受众：同行设计师 / 前端工程师——他们打开 DevTools 时，代码与交互必须经得起 inspect。
- 受众**不是**普通 SpaceX 粉丝，也**不是**专门来了解作者本人的人。

---

## 二、页面叙事结构（5 幕）

整站是一条**线性向下滚动的叙事**，从"任务开场"到"交付证据"。

| # | 新名称 | 当前对应组件 | 一句话职责 |
|---|---|---|---|
| 1 | **Mission Opening** | `HeroVideo.jsx` | 用一段视频与一句话宣言，把观众带入这个 universe |
| 2 | **Orbital Archive** | `OrbitGallery.jsx` | 把这个 universe 的关键任务存档陈列在轨道上，可滚动浏览 |
| 3 | **Starship Manifest** | `StarlinkReveal.jsx` | 用文字宣言定义这个项目的"为什么存在" |
| 4 | **Signal Network** | `ConstellationReveal.jsx`（前 2/3） | 用诗化文字宣告"信号 / 连接 / 网络"母题，建立星座感 |
| 5 | **Constellation System** | `ConstellationReveal.jsx`（后 1/3，3 张卡） | 用 3 张可翻面卡片，把前 4 幕的航天母题收束为可触可读的"系统视图" |

### 2.1 Page 1 — Mission Opening
- **职责**：5 秒之内让访客知道"这是一段 SpaceX 母题的 speculative 航天交互体验，不是真 SpaceX 官网"。
- **视觉目标**：大尺寸全屏视频；左上 SpaceX wordmark（视觉母题）；右上极简导航；底部一句斜体 serif 宣言。
- **当前已交付**：`HeroVideo.jsx` 全屏视频 + `ScrollFloat` 文字浮入 + 副标题 "A speculative SpaceX-inspired interface designed through AI-directed visual systems."
- **后续重构方向**：
  - 副标题保留，是"speculative + AI-directed"双重 disclosure，也是观众分辨"这不是 SpaceX 官网"的唯一线索。
  - 视频可以替换为更"航天而不商标化"的素材（点火、轨道、对接），但不要换成炫技后期合成。
  - 导航 Contact / News / About 后续可改为 **Connect / Archive / Manifest** 或 **Mission / Archive / Signal** 之类紧贴航天母题的命名；避免使用 "Work / Portfolio / Resume" 这类带个人作品集意味的项。

### 2.2 Page 2 — Orbital Archive
- **职责**：把这个 universe 的**关键任务存档**像卫星一样陈列在地球轨道上，让观众沿着轨迹滑行翻阅。
- **视觉目标**：白底 + 蓝色经纬网地球（已有）+ 抛物线轨迹上的卡片（已有）+ 数字化卫星粒子和 LEO-47B / TLE-2291 这类**伪遥测标签**（已有）。
- **当前已交付**：6 张卡片沿 `M 5,68 Q 50,-8 95,68` 抛物线分布，居中卡片放大；标题 + 描述同步切换；3D Globe + 5 圈轨道环 + 70 颗卫星粒子。
- **后续重构方向（Phase 2 重点）**：
  - 主题保持 SpaceX-inspired 航天叙事——6 张卡可以是真实航天里程碑（Falcon 1 / Dragon / Starship 等）或 speculative 任务记录，**不要**变成"作者的项目截图"。
  - 卡片标题文案统一调性：动词开头、不超过 6 个词、克制。
  - 卡片描述聚焦 **"任务 / 年代 / 结果"** 三段式，避免营销腔与自指文案。
  - 卫星伪标签可保留，作为"工程感装饰"。
  - 不要破坏抛物线 `slotToProps()` 的几何，重构主要发生在数据层与文案层。

### 2.3 Page 3 — Starship Manifest
- **职责**：用四行白字宣言，把整段航天叙事的**为什么**用文学化语言钉在中央。
- **视觉目标**：黑底（`Page3bg.png`）+ 全白显示字体 + 中央定格 reveal + 最终迁移到右上角作为页眉。
- **当前已交付**：5 阶段 timeline（center hold → reveal → post-reveal hold → migrate → top-right hold）+ ScrollTrigger + ScrollFloat per-character 浮入。
- **后续重构方向**：
  - **此页 timeline / ScrollTrigger / ready 门控属于稳定核心，不要重构** —— 见第五节。
  - 文案可以微调，但务必保持"4 行 / 第一行全大写标题 / 后 3 行小写句子"的结构。

### 2.4 Page 4 — Signal Network
- **职责**：用一段诗化文字宣告 universe 的"信号哲学"——连接的不只是设备，而是地球上每一个未被看见的点。
- **视觉目标**：白底黑字 word-by-word 浮入 → 中央光晕 hold → 横向 mask 扫开 → 切到星空背景。
- **当前已交付**：`ConstellationReveal.jsx` 前 2/3 滚动范围，6 阶段 progress mapping（word / glow-in / hold / glow-out / horizontal mask / vertical mask）。
- **后续重构方向**：
  - 文案保持 Starlink-inspired 的"网络 / 信号 / 连接"母题，可以重写得更诗化、更克制；**不要**改写成自指的能力宣言。
  - 6 阶段 progress 节奏可保留，但需要为新文案重新校准每个区间的相对长度。
  - mask transition 的视觉是亮点，必须保留。

### 2.5 Page 5 — Constellation System
- **职责**：把整段航天叙事收束为一个"系统视图"——3 张可翻面卡片代表 constellation 的三个截面（结构 / 尺度 / 影响），让观众用手指触发"星座组件"翻转。
- **视觉目标**：星空背景 + 3 张图片切片（front）+ 翻面后的内容描述（back）+ fan-out 散开。
- **当前已交付**：`ConstellationReveal.jsx` 后 1/3，gap 打开 → 边角变方 → flip 180° → fan ±6° 角散开；当前 3 张卡 = `THE CONSTELLATION` / `ORBITAL SCALE` / `EARTH'S NEURAL NET`。
- **后续重构方向**：
  - 三张卡的 `title / body` 文案保持 Starlink/constellation 母题，可润色为更克制、更诗意的"星座系统"三视角描述；**不要**改成作者作品 case。
  - 图片 `SpaceXProjectStarPic.jpg` 可替换为更高分辨率的 constellation / orbital 主题图，但要保持横向 3 切片 `300% 100%` 的整体感。
  - GLASS 玻璃质感、`TiltedCard` hover 倾斜可保留。

---

## 三、统一设计语言

### 3.1 色彩系统

> 原则：**两端高对比 + 极少彩色点缀**。整站只在两个底色之间往返：纯黑与近白。

| token | hex | 用途 | 出处 |
|---|---|---|---|
| `--ink-black` | `#000000` | 主背景 / Loading / Page 1 / Page 3 / Page 5 起始底 | `body`, `bg-black` |
| `--off-white` | `#f5f5f7` | Page 2 白底、卡片中性面 | `OrbitGallery` 白底, `CARDS[1].backClass` |
| `--text-white` | `#ffffff` | 一切深底正文与 wordmark | hero / Page 3 |
| `--text-ink` | `#0a0a0a` | 浅底正文（深底卡片背） | `CARDS[2].backClass` |
| `--accent-deep-red` | `#4a0404` | Page 5 卡片 1 背面 | `CARDS[0].backClass` |
| `--orbit-blue` | `#1f5a99` | Page 2 经纬网格线 | `Globe` `lineBasicMaterial` |
| `--telemetry-amber` | `#f59e0b` (`amber-400`) | Page 2 卫星 ping 点 | `SatelliteParticles` |

- 文字透明度梯度（白底/黑底通用规则）：`/90` 主文 → `/75` 次文 → `/50` 装饰 → `/20` 仅作为蒙层背景。
- **禁止**新增第三种主色面。所有新加 UI 必须从以上 token 中取色。
- `index.css` 里的 `oryzo-*` 彩色 conic-gradient 是历史遗留装饰类，不在主叙事路径上，可以保留但**不要在新页面引入**。

### 3.2 字体系统

| 角色 | 字族 | 出处 |
|---|---|---|
| 全站默认 | `Space Grotesk` → `system-ui` → `sans-serif` | `index.css` `body`，`tailwind.config.js` `fontFamily.space` |
| 显示级标题（Page 3 第一行） | Space Grotesk **900 / -0.075em / uppercase / 0.9 lh** | `.starship-copy-title` |
| 句子级正文（Page 3 后三行） | Space Grotesk **650 / -0.035em** | `.starship-copy-line` |
| Hero 装饰宣言 / footer | **`font-serif italic`** | `HeroVideo` ScrollFloat + 副标题 |
| 工程感小字（导航 / 卫星标签） | `font-mono` 或 `tracking-[0.2em] uppercase text-xs` | `HeroVideo` nav, `SatelliteParticles` 标签 |

- **字号一律使用 `clamp()`**，禁止写死 px。已有规范：
  - 大标题 `clamp(3.0rem, 5.6vw, 7rem)`
  - 句子 `clamp(1.05rem, 1.65vw, 2.1rem)`
  - 装饰 `clamp(0.7rem, 1vw, 0.85rem)`
- 第一受众读屏可达性：所有正文最小 `0.85rem`，装饰文字最小 `0.7rem`。

### 3.3 动效语言

#### 3.3.1 缓动曲线（Eases）
整站只用以下 4 条曲线，新增动效必须从中选：

| ease | 用法 | 出处 |
|---|---|---|
| `back.inOut(2)` | per-character / per-word reveal | `StarlinkReveal` 4 行 reveal, `HeroVideo` ScrollFloat |
| `power2.inOut` | 大物体平移 / scale 迁移 | Page 3 文字组迁移到右上角 |
| `power2.in` / `power4.in` | "冲入"类动作 | LoadingScreen wormhole |
| `power2.out` / `power1.out` | "扩张 / 散开"类动作 | Page 5 fan、glow fade-in |
| `none` (linear) | scrub 时间轴占位 / hold 阶段 | Page 3 timeline default |

#### 3.3.2 时序节奏
- **scrub 必须显式声明**。Page 3 用 `scrub: 1.15`（带 1.15s 平滑），Page 2 用 `scrub: 0.6`，Page 4/5 用基于 scroll position 的手算 progress。新页面如果用 scrub，节奏值不要超过 `1.5`，过大会感觉粘。
- **每页都必须有"hold 阶段"**——任何 reveal 之后给眼睛 0.3–0.6 timeline-unit 的停留。Page 3 的 5 阶段是参考实现。
- **逐字 / 逐词 reveal 的 stagger** 按当前规范：
  - 标题 `each: 0.008`，句子 `each: 0.0035–0.004`。
  - 词级 stagger 100ms（见 `ConstellationReveal` anime.js）。

#### 3.3.3 ScrollTrigger 规则（关键，违反容易制造 bug）
- **同一段动画只能由一个 ScrollTrigger 控制**，绝不允许多个 trigger 写同一个 element 的同一组属性。
- **`invalidateOnRefresh: true`** 在所有 scrub 类 trigger 上必加。
- 新页面如果引入 `pin: true`，必须意识到它会插入 pin spacer 改变下游布局，必须在所有兄弟 trigger 创建完后调用一次 `ScrollTrigger.refresh()`。
- 跨组件协调：依赖 loading 完成的页，**用 `ready` prop 显式门控**，不要靠 setTimeout 猜时机。

### 3.4 空间布局原则

- **Sticky stage 模式**：长 section（`min-h-[460vh]` / `1100vh`）+ 内层 `sticky top-0 h-screen` 是整站唯一的"长滚动 + 固定舞台"实现方式。新页面遵循此模式。
- **z-index 分层**：背景 `0` → 内容 `10` → 文字 `20–80` → 顶层 wordmark / nav `30` → loading 蒙层 `50`。新增层级请插入到**两个相邻整十之间**，不要打破整十节奏。
- **左右 padding**：`px-10`（hero / wordmark），`px-8 md:px-16 lg:px-24`（Page 4 大段文案）。新页面 padding 必须从这两组里二选一。
- **顶部 padding**：`pt-8`（hero / wordmark）。
- **绝对定位的 wordmark**：所有黑底页都在 `top-0 left-0 z-30 px-10 pt-8` 放白色 SpaceX wordmark，已是 Page 1 / Page 3 共用约定。

### 3.5 图片处理原则

- **比例**：作品图统一使用 `aspect-[3/2]`（OrbitGallery 卡片）或 `60vw × 60vw/ratio`（Page 5 容器）。
- **圆角**：`rounded-lg`（OrbitGallery 卡片）/ 12px（Page 5 卡片面）。整站只用这两档。
- **阴影**：`box-shadow: 0 4px 24px rgba(0,0,0,0.08)`（OrbitGallery 浅底）；`0 25px 50px -12px rgba(30,58,138,0.2)`（Page 5 深蓝一点点）。新增阴影必须从这两档里选或就着调透明度，不要乱发明。
- **加载策略**：图片 `loading="lazy"`，video `playsInline muted autoPlay loop`。
- **不要**用 CSS filter `blur` / `saturate` 给主题图加滤镜——会破坏画面的"真实存档"感。`oryzo-gradient-layer` 那种装饰例外。

### 3.6 hover / scroll interaction 规则

- **hover 唯一变量是 scale**（最大 `1.06`）+ optional 3D rotateY/X（`TiltedCard`）。**禁止** hover 改色 / 改文字内容 / 改阴影颜色。
- **hover 过渡时长**：`duration-300` 用于颜色，spring 用于 scale（见 `TiltedCard` motion spring）。
- **scroll 主导的元素**（Page 2/3/4/5 主要内容）**不要再绑 hover 动画**——避免 hover 与 scrub 抢同一个 transform。
- **指针**：所有可点击导航元素 `cursor-pointer`，scroll 装饰文字 `pointer-events-none`。

---

## 四、当前已有资产如何保留

### 4.1 必须**完整保留**的资产
| 资产 | 文件 | 原因 |
|---|---|---|
| Page 1 视频 hero | `HeroVideo.jsx` + `/public/32秒60%.mp4` | 5 秒定位武器，不可换成静态图 |
| Page 1 footer 副标题 | `HeroVideo.jsx` 末尾 `<p>` | "speculative + AI-directed"双重 disclosure，是观众分辨"这不是 SpaceX 官网"的唯一线索，文案可微调但不可删 |
| Page 2 抛物线轨迹与卡片几何 | `OrbitGallery.jsx` `slotToProps()` | 整站最有"轨道感"的运算，重构只动数据/文案，不动几何 |
| Page 3 timeline 5 阶段 + ready 门控 | `StarlinkReveal.jsx` + `App.tsx` `ready={!isLoading}` | 见第五节，**任何修改前先读它** |
| Page 5 3D 卡片翻面 + fan 散开 | `ConstellationReveal.jsx` cards timeline | 整段航天叙事的视觉收束，是 Constellation System 的核心交付 |
| LoadingScreen wormhole | `LoadingScreen.jsx` | 整站入口仪式感的核心 |
| Space Grotesk + Tailwind 配色 | `index.css`, `tailwind.config.js` | 全站字体与配色基准 |

### 4.2 可以**升级**的资产
| 资产 | 升级方向 |
|---|---|
| Page 2 的 6 张 Falcon 1 史实图 | 升级为更精致的 SpaceX-inspired 任务存档（真实里程碑或 speculative 任务），保留卡片尺寸与抛物线；不替换为作者作品 |
| Page 4 的 Starlink 文案 | 润色为更诗意、更克制的"信号 / 连接 / 网络"母题宣言，避免营销腔与自指文案 |
| Page 5 的 3 张卡背 (`THE CONSTELLATION` / `ORBITAL SCALE` / `EARTH'S NEURAL NET`) | 文案润色为更系统化的 constellation 三视角（结构 / 尺度 / 影响）描述 |
| `SpaceXProjectStarPic.jpg` | 替换为更高分辨率的 constellation / orbital 主题图，保持 `300% 100%` 切片机制 |

### 4.3 可以**逐步淘汰**的资产
- `index.css` 里的 `oryzo-*` 彩色 conic-gradient（如果新页面里都没引用，可以删除）。
- `public/earth.glb`（如果未在任何组件中 import，可以删）。
- 任何冗余的 `hero_longer.mp4` / `hero-bg.mp4`（保留实际在用的那一个）。
- 删除前必须先 `grep -r` 全仓库确认无引用。

---

## 五、禁止破坏的稳定逻辑（HARD RULES）

> 以下规则是上一轮花了大量精力修复 bug 的产物。**违反任何一条都会让"第三页文字提前飘到右上角"的 bug 卷土重来**。
> 所有 AI 工具（Cursor / Claude / Codex）在改动这些区域前必须先在 chat 里复述一次该规则，证明读过本节。

### 5.1 ❌ 不要改 `src/App.tsx` 中的 `ready={!isLoading}`
```tsx
<StarlinkReveal ready={!isLoading} />
```
- 这是 StarlinkReveal 的 ScrollTrigger 创建时机门控。
- 删掉这个 prop = StarlinkReveal 在 LoadingScreen 期间就建 trigger，会缓存到 OrbitGallery pin spacer 还没出现时的旧布局 → 第三页文字一露头就在右上角。

### 5.2 ❌ 不要破坏 StarlinkReveal 的 ScrollTrigger 创建时机
- `StarlinkReveal.jsx` 必须用 **`useEffect`**，**不要**改成 `useLayoutEffect`。原因：useLayoutEffect 会在 OrbitGallery 的 useEffect 之前同步执行，导致 trigger 在 pin spacer 插入前缓存坐标。
- 必须保留 `document.fonts.ready.then(buildScrollAnimation)` 作为 build 触发器。**不要**用 `setTimeout` 猜时机替代它。
- 必须在 build 完成后调用 **一次** `ScrollTrigger.refresh()`，让所有兄弟 trigger 重算。

### 5.3 ❌ 不要破坏 StarlinkReveal 的 5 阶段 timeline
当前结构（必须保留这 5 个 label + 占位时长比例）：
```
p1-center-hold       0.30  ← 中央停留
p2-reveal            1.13  ← 4 行依次浮入
p3-post-reveal-hold  0.45  ← reveal 后停留
p4-migrate           1.85  ← 迁移到右上角
p5-top-right-hold    0.50  ← 右上角停留再放行下一页
```
- 可以微调每段 duration 数值（±20% 内），但**不允许删除任何一个阶段**。
- **不允许**让 reveal 与 migrate 直接相邻，中间必须保留 `p3-post-reveal-hold`。

### 5.4 ❌ 不要破坏 GSAP cleanup 逻辑
当前 `StarlinkReveal.jsx` 的 cleanup 包含三件事：
1. `cancelled = true`（防止 `document.fonts.ready` 异步 resolve 后还在 build）
2. `ctx.revert()`（杀掉所有 tween + ScrollTrigger）
3. 重置 `ctx = null`

新加任何全局 listener / setTimeout / ScrollTrigger 必须配套写 cleanup，**禁止只 add 不 remove**。

### 5.5 ❌ 不要让多个 ScrollTrigger 竞争同一段文字 / 同一个 transform
- 上一版 bug 的经验：曾经为 4 行文字各自建 4 个 ScrollTrigger，resize 后会去同步。
- **现在的契约**：每个 transform-able 元素**只能被一个 ScrollTrigger 写**。
- 如果新需求要"中途加一个特效"，方案是**在同一条 timeline 上再加 keyframe**，不是再加一条 trigger。

### 5.6 ❌ 不要删 `src/main.tsx` 的 scrollRestoration 逻辑
```ts
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}
requestAnimationFrame(() => {
  window.scrollTo(0, 0)
})
```
- 删掉这一段 = 浏览器刷新会把用户停在旧滚动位置，进入第三页中段，trigger 缓存的旧坐标会让动画从错误阶段开始。

---

## 六、下一阶段建议

### 6.1 重构顺序（优先级从高到低）

1. **Phase 2-A：重构 Page 2 Orbital Archive**（**先做这个**）
   - 只动数据层（`SLIDES` 数组）和文案层。
   - 6 张卡保持 SpaceX-inspired 航天叙事——可以是真实里程碑（Falcon 1 / Dragon / Starship 等）或 speculative 任务条目，**不要**替换成作者作品。
   - 卡片描述统一为"任务 / 年代 / 结果"三段式，避免营销腔与自指文案。
   - 不动 `slotToProps` / 抛物线 / 三维 globe。
   - 完成标准：路过 Page 2 时，每张卡讲一段被精心策划的航天故事，视觉感与现在一致。

2. **Phase 2-B：重构 Page 4 Signal Network**
   - 润色 `REVEAL_TEXT` 为更诗化的"信号 / 连接 / 网络"宣言，保持 Starlink-inspired 母题；**不要**改成自指的能力宣言。
   - 校准 6 个 progress 阶段的相对长度以适配新文案的字数。
   - 不动 mask transition 几何。

3. **Phase 2-C：polish Page 5 Constellation System**
   - 润色 `CARDS[]` 三张卡的 `title / body`，保持 constellation 三视角调性（结构 / 尺度 / 影响）；不替换为作者作品。
   - 替换 `SpaceXProjectStarPic.jpg` 为更高分辨率的 constellation / orbital 主题图，保留 `300% 100%` 切片机制。
   - 不动 fan / flip / hover 几何。

4. **Phase 2-D：微调 Page 1 Mission Opening**
   - 副标题文案微调。
   - 视频素材若要替换需保留 32 秒以上、可循环、`muted autoPlay`。
   - 导航三项可改名但保留 uppercase + tracking-[0.2em] + serif italic 风格。

5. **Phase 2-E：最后 polish Page 3 Starship Manifest**
   - **此页是稳定核心，最后再动，且仅限文案微调**。
   - 4 行文案可重写但必须保持「第 1 行全大写标题 + 后 3 行小写句子」结构。
   - 不允许动 timeline / trigger / ready 门控。

### 6.2 每个阶段完成后的检查清单
- [ ] `npm run build` 通过、无新 error
- [ ] 五种刷新场景全部回归（硬刷新 / 重启 dev / 重开 Cursor / resize / Slow 3G），见上一轮测试指南
- [ ] `git diff --stat` 改动范围与本阶段目标一致，没有"顺手改"无关文件
- [ ] commit message 形如 `phase 2a: rebuild orbital archive content`，便于后续 bisect

### 6.3 遇到不确定时的判断流程
1. 这个改动是否触碰第五节任何一条 HARD RULE？→ 触碰则**先 chat 复述规则**再动。
2. 这个改动是否会引入第二个 ScrollTrigger 写同一个元素？→ 会则**改用 timeline keyframe**。
3. 这个改动是否需要在多个组件之间协调时机？→ 需要则**加 ready prop**，不要用 setTimeout。
4. 这个改动是否会改动 `package.json` 依赖？→ 会则**先在 chat 里说明为什么**，再添加。

---

> **签收行**：任何 AI 工具如果读到这里，请在第一次回复时输出一句："已读 DESIGN_SYSTEM.md，将遵守第五节 HARD RULES。"
