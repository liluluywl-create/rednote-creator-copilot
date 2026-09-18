# 创作者工具｜产品需求文档 PRD

## 1. 文档概述与版本控制

| 项目 | 定义 |
|---|---|
| 项目名称 | 创作者工具（Creator Copilot，工作名） |
| 版本 | V1.0 MVP IA 2.1；协议版本 `2.1.0`；缓存格式版本 `1.0.0`（旧报告不自动迁移） |
| 日期 | 2026-09-18 |
| 文档维护人 | 产品负责人：项目发起人；AI 协助整理，不替代产品负责人的变更确认 |
| 适用范围 | 移动端优先 Web / PWA；手工编织与泛生活创作者首发样板 |
| 文档状态 | 移动端三栏 IA 已锁定；保留主页诊断与成品文案两条 AI 调用链，选题灵感为独立本地工作区；前端尚未开发或上线 |
| 单一事实来源 | 本文正文、业务不变量及文末完整 JSON Schema 共同构成规范；独立 `protocol.schema.json` 是附录镜像，必须保持逐字一致 |

### 1.1 背景与问题

发起人是拥有 900+ 粉丝的手工编织／生活类小红书创作者，反馈的问题包括断更、封面包装欠佳、成功内容难以复用、创作耗时过长。这是发起人的自述，不代表已完成大样本用户研究。

产品围绕三个连续工作区组织体验：用主页体检发现账号与内容机会；把诊断产生的选题沉淀到灵感库并按周取用；将已经完成的作品转成三套可比较、可编辑的发布图文。模型调用仍聚焦主页诊断和成品文案，灵感库承担结构化沉淀、收藏与跨栏跳转，不是第三个聊天机器人。

价值目标是减少从素材到可用草稿的操作与时间，提高表达质量和用户采纳。不得承诺爆款、涨粉、真实点击率或转化提升；未实测的数值一律标记为目标。

### 1.2 决策基线与范围

**纳入 T0：** 移动端底部三栏导航（文案助手／选题灵感／主页体检）；长截图／多截图直接识别；疑似高反馈作品轻量确认；三维选题卡自动沉淀、卡片收藏与“去写文案”；渐进式可选表单；成品三套方案横滑对比；原照片有限裁切与文字排版；可选批注与手动编辑；3:4 图像区仿真预览；复制文案、保存封面；本机自动保存和最近记录。

**不纳入 T0：** 爆款对标拆解与仿写（Feature 3，已废弃并转入 Post-MVP 备忘，不进入当前设计、开发、Prompt、测试或验收）；登录、账户、跨设备同步、用户可见创作者档案、长期风格画像、爬虫、笔记链接自动抓取、视频解析、复杂图像编辑、作品重绘、自动发布、趋势热榜检索、跨模块通用收藏系统、跨方案拼装、多代理编排、向量数据库、RAG、复杂后台管理。选题卡收藏是灵感库内的轻量本地状态，不扩展为全产品收藏体系。

本版替换以下旧决策：取消坐标与赞藏数校对；取消生成中途追问；取消必须先读拆解再生成；取消上一版关于配套 IndexedDB 的建议。**按最新约束，仅 localStorage 持久化文字与状态，原图不持久化。刷新后继续编辑图片需要重新上传。** 这是明确的范围取舍，不得在 UI 中隐藏。

### 1.3 版本与变更规则

| 版本 | 变更 |
|---|---|
| V1.0 MVP | 整合已确认轻量交互；明确 localStorage 取舍；增加字段协议、评测、异常和验收标准 |
| V1.0 MVP 本地走查补记（2026-09-15） | 用户确认首轮供应商为火山方舟，模型配置为 doubao-seed-evolving；沿用协议1.0.0与识别→人工确认→报告，不改变字段、图片限额或等待预算 |
| 方案 B（协议2.0.0） | 移除全部主页数值评分；增加门面与垂直度诊断；三层选题；正文隐藏证据代码。旧报告不迁移；旧识别结构不变，仅在内存显式适配版本后复用人工确认。 |
| MVP 范围收敛（2026-09-17） | 正式取消 Feature 3 爆款对标拆解与仿写；当前产品、前端与验收只覆盖主页诊断和成品图三风格文案生成。保留的 `viral.*` 字段仅为历史／Post-MVP 协议预留，不构成实现要求。 |
| IA 与选题升级（协议2.1.0，2026-09-18） | 建立文案助手／选题灵感／主页体检三栏；主页选题自动进入本地灵感库并可收藏、带入文案助手；选题输出升级为稳健、时令、跨界三维并增加 craftOrMaterialTip。旧2.0.0报告不自动迁移。 |

### 1.4 当前核心资产状态

| 核心功能 | 状态 | 已验证范围 | 下一阶段 |
|---|---|---|---|
| 功能一：主页视觉与门面诊断 | 端到端 Schema 走查已通过 | 多图输入、代表作品轻确认、定性报告、证据与业务规则 | Next.js 移动端页面与报告组件 |
| 功能二：成品图三风格文案生成 | 端到端 Schema 走查已通过 | 三图输入、可选灵感字段、三套差异化第一人称文案、事实引用与业务规则 | Next.js 横滑比较、编辑与预览组件 |
| 选题灵感工作区 | 协议与本地数据规则已定义 | 三维卡片 Schema、来源追溯、收藏状态、去写文案映射；尚未重新调用模型验证2.1.0输出 | Next.js 卡片流、筛选、收藏与跨栏带入 |
| 功能三：爆款对标拆解与仿写 | 已废弃／Post-MVP | 未建独立测试脚本，不纳入当前评测 | 当前无开发计划；若未来重启须重新立项与评审抄袭风险 |

下一次改变输入必填项、字段含义、返回结构、缓存行为、生成次数或功能范围，必须同时更新本 PRD、协议和对应样例。模型、Prompt 或过滤规则调整必须记录版本与回归结果。不可直接以临时聊天内容覆盖已发布基线；先将决定写回文档。每次开发、接口接入、Prompt 调试前通读对应功能章节、3.6 业务不变量、5—6 章及协议附录。

## 2. 核心用户画像与典型使用旅程

### 2.1 首发用户假设

核心用户是熟悉手工制作、主要使用手机创作的个人博主；500～2,000 粉丝可作为首批招募范围，不作为准入门槛或研究结论。常见约束是可用时间零碎、素材已有但包装困难、愿意尝试不同风格、不愿填写长表单。

T0 不根据粉丝量评判创作能力，不推断商业身份或收入；“维持一种固定风格”不是默认目标。

### 2.2 旅程与完成标准

| 场景 | 用户路径 | 到达价值的时点 | 完成标准 |
|---|---|---|---|
| 不知道主页哪里需要改 | 首页→上传截图→勾选代表作品或仅做视觉诊断→报告 | 看到有截图依据的观察和优先建议 | 用户能说出至少一个下一步动作；无需填赞藏数 |
| 有成品但不想写文案 | 首页→上传照片→可选补充→三套方案→选一版→预览／编辑→复制与保存 | 第一套完整可用方案可阅读时 | 有与原作品一致的封面和文案，复制成功有反馈 |
| 想规划下一件作品 | 选题灵感→按三维浏览或查看收藏→打开选题卡→去写文案 | 看见推荐理由与可执行工艺／材质建议时 | 新建文案草稿并带入选题方向；不会覆盖已有未完成草稿 |
| 被打断后继续 | 首页历史→恢复上次草稿 | 看到已保存文字和选择状态时 | 文案继续编辑；需用图片时按占位提示补传原图 |

典型旅程中的批注、展开依据、安装 PWA 均为可选动作，不是主链路门槛。

## 3. 全局技术架构与产品原则

### 3.1 交互哲学与页面边界

采用 Beyond Chatbot：自然语言用于表达卖点、主题和风格要求，图形界面承担上传、选择、比较、编辑和导出。不设置持续追问的聊天窗口。

移动端应用壳固定三栏底部导航，顺序为：Tab 1 文案助手、Tab 2 选题灵感、Tab 3 主页体检。首次打开默认进入文案助手；切换 Tab 保留各栏本地状态，不以返回键制造多层页面栈。编辑面板、预览层和异常提示为共享组件，不新增账户页和复杂工作台。

文案助手：上传与渐进式表单→一次生成→三套比较→预览。选题灵感：读取本地卡片→筛选／收藏→去写文案→切换至文案助手的新草稿。主页体检：上传→识别骨架屏→标签轻确认→报告→三张选题卡自动沉淀至灵感库。主页体检不是使用灵感库或文案助手的强制前置；灵感库为空时展示清晰空状态和“去做主页体检”，文案助手始终可直接使用。

### 3.2 轻量架构与信任边界

浏览器负责素材选择与有限压缩、字段校验、卡片与预览、原图模板排版、复制导出、localStorage 草稿。服务端仅承担安全模型调用、输入输出校验、限流和有限重试；不建立用户库或草稿云数据库。

**免登录与纯本地缓存不等于模型密钥可以放在前端。** 密钥、完整 System Prompt 与供应商错误堆栈不得进入客户端或 localStorage。真实 AI 调用需要可信服务端边界；若尚未接入，只能展示明确标记的 `demo_fixture`，不能假装实时生成。[Google 密钥安全要求](https://ai.google.dev/gemini-api/docs/api-key)

前端未来采用 TypeScript 严格模式；外部输入、环境变量、服务请求响应与缓存读写均需运行时校验。建议以 Zod 承担业务校验，以附录 JSON Schema 承担跨系统契约；两者规则一致。不存在“前端通过就不用服务端复核”。

不抓取 URL，不读取用户账号数据，不将图片上传到公开图库，不执行模型返回的 HTML、脚本、命令或外部链接。截图中的指令性文字仅是待分析素材。

### 3.3 模型选型与调用策略

逻辑能力分为 Vision 理解和文本推理，不强制对应两个不同模型。首发优先用同一个支持图片输入与结构化输出的稳定模型，减少供应商与适配成本。

截至文档日期，`gemini-3.8-flash` 可作为首轮评测的基线候选：官方文档列明图片输入、文本输出与结构化输出支持。**这不是已通过本项目评测的最终生产选择。** 候选最终需通过第 6 章门槛，并验证账户、地区可用性和实际成本。[模型能力说明](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)

**2026-09-15 本地走查决定：** 按用户后续明确选择，本轮实际接入火山方舟 `doubao-seed-evolving`，不使用上段历史候选。`test_profile_diagnosis.js` 作为本地离线评测运行器，先一次发送两张连续主页截图做 `profile.inspect`，经用户明确选择后才允许 `profile.report`。完整 System Prompt 保存于 `prompts/profile_system_v1.0.md`，附加从本协议提取的模型责任 Schema；本地强制执行完整 Request/Response 与业务引用校验。尚未确认供应商原生严格 JSON Schema 的支持，因此本轮不声称具备模型端严格结构化保证。保持原8秒/90秒预算，本轮自动重试为0次；具体运行说明见 `PROFILE_TEST.md`。本地评审结果属于用户主动运行的离线样例，不是生产日志或浏览器原图缓存；模型可用性与质量以实测记录为准，不把本段决定当作测试通过。

| 调用任务 | 默认策略 | 质量重点 |
|---|---|---|
| `profile.inspect` | 一次多图识别，输出最多 3 个作品标签 | 可辨认、依据正确、不猜数值 |
| `profile.report` | 用户确认后一次生成结构化报告 | 状态有依据、门面与垂直度覆盖、选题有发散度 |
| `post.inspect` | 上传后可选预识别；超时可放弃 | 标签仍标“推测”，不阻断表单 |
| `post.generate` | 一次生成三套方案，不做三轮串行优化 | 同事实、不同表达角度、文图一致 |

Feature 3 的 `viral.generate` 不参与当前模型选择、调用、测试或前端实现；协议中若仍出现该名称，只能按 Post-MVP 历史预留理解。

预识别不建立必需依赖：正式生成始终校验本次提交的图片与已确认字段。用户直接生成时，晚到的预识别结果不能覆盖字段。首发不自动切换到未经评测的另一供应商；备用模型只有在相同测试集通过后才启用，并记录真实模型标识。

选型先过事实与安全硬门槛，再按生成质量 45%、可靠性 25%、延迟 20%、实测每个可用结果成本 10% 比较。价格不写死；按调用时供应商账单与实际 token 计算。首发不启用图像生成、搜索或代理工具。

### 3.4 集中参数与初始限额

以下数值是 V1.0 的设计初值，不是已达到的性能或平台官方限制。工程实现集中配置，变更需要同步协议与验收。

| 参数 | V1.0 值 |
|---|---|
| 每任务图片数 | 1～6 张；主页截图与成品照片分别按各自任务提交 |
| 单原文件 / 合计原文件 | 最多 10 MiB / 30 MiB |
| 接受格式 | JPEG、PNG、WebP；HEIC/HEIF、GIF、视频暂不接受 |
| 传输图片 | 单图压缩后 ≤1 MiB；合计二进制 ≤2 MiB；请求 JSON UTF-8 ≤3 MiB |
| 像素与尺寸 | 传输图单边 16～10,000 像素；单图 ≤12MP，任务合计 ≤24MP |
| 文本输入 | 用户简报各字段合计 ≤1,000 字；空白输入规范化为 null |
| 方案数 / 代表作品 | 成品成功结果恰好 3 套；主页标签最多 3 个，可少于 2 个 |
| 生成标题 / 正文 | 标题 ≤20 字；每套段落正文加互动结尾合计 ≤800 字；属于本项目生成预算 |
| 预识别等待预算 | 8 秒；不自动重试；成品预识别失败可直接继续 |
| 正式生成总等待预算 | 90 秒，含内部修复或重试；15 秒后显示“处理较久，可继续等待” |
| 自动重试 | 每个正式生成请求最多 1 次；格式修复、语义修复、网络重试共享该预算 |
| 输出 token 上限 | profile.inspect 1,500；post.inspect 1,500；profile.report 6,000；post.generate 10,000 |
| 图片压缩质量起点 | 照片等比压缩质量 0.85，可降至 0.70；截图优先保留文字可读性，不能只靠低质量压缩过限 |
| 本工具持久化预算 | 总估算 ≤2 MiB；最多 20 条草稿、60 张灵感卡；单草稿 ≤256 KiB；以先触及的上限为准 |
| 自动保存 | 输入暂停 500ms 后保存；结果到达、方案切换、页面内导航时立即保存 |
| 本地行为事件 | 最多 500 条且 ≤64 KiB，保留最近 30 天；容量计入上述总预算 |
| 三方案相似度复核 | 标题与开篇过于接近时判定方案区分不足；阈值集中配置，不散落在组件中 |

压缩不得重绘、改变作品色彩或强制拉伸。超长截图如果在预算内仍不可读，提示用户换为多张正常截图，不做自动坐标切片。停止无意义重复压缩；不静默截断文字或丢弃图片。

### 3.5 API 与 JSON Schema 总协议

附录 A 是完整 JSON Schema Draft 2020-12，包含所有引用定义，不存在省略的字段或伪类型。独立 JSON 文件仅为附录镜像。各接口校验对应 `$defs`，不得只验证“能解析为 JSON”。[JSON Schema 规范](https://json-schema.org/draft/2020-12)

| 逻辑接口 | Request Schema | Response Schema |
|---|---|---|
| `POST /api/v1/profile/inspect` | `#/$defs/ProfileInspectRequest` | `#/$defs/ProfileInspectResponse` |
| `POST /api/v1/profile/report` | `#/$defs/ProfileReportRequest` | `#/$defs/ProfileReportResponse` |
| `POST /api/v1/post/inspect` | `#/$defs/PostInspectRequest` | `#/$defs/PostInspectResponse` |
| `POST /api/v1/post/generate` | `#/$defs/PostGenerateRequest` | `#/$defs/PostGenerateResponse` |

当前 MVP 不暴露 `/api/v1/viral/generate`。附录中遗留的 `viral.*` 定义标记为 Post-MVP 预留，不得据此生成路由、页面或测试任务。

Request 统一为 `schemaVersion / requestId / task / payload`。Response 统一为 `requestId / task / status / data / warnings / error / meta`；全部字段必须存在。未知的可空字段用 null，无项目的列表用空数组；禁止空字符串代替未知事实。clean封面的大字和未完成的手动编辑稿等明确允许空串的位置，以附录Schema为准。

`status=success` 表示约定结果齐全；`partial` 表示结果仍可用但有明确缺项，必须带 warning；`error` 时 data 为 null，error 为安全错误对象。成功与部分成功的 error 必须为 null。网络无响应时由前端维护本地错误状态，不伪造服务端返回。

`meta` 由服务端填写：协议版本、Prompt 版本、实际模型标识、运行类型、耗时与重试次数，不由模型猜测。`runType` 为 `public_demo / offline_evaluation / demo_fixture`；公共请求不能自行伪装为离线评测。失败前未发模型请求时 modelId 可为 null。

供应商结构化输出仅约束其支持的 JSON Schema 子集，因此模型侧可以使用经过转换的 data 子集；对外服务始终按完整协议加业务规则验证。格式正确不代表事实正确。[Gemini 结构化输出说明](https://ai.google.dev/gemini-api/docs/structured-output)

### 3.6 不可只靠 Schema 表达的业务不变量

以下校验与 Schema 同等强制，未来用服务端／前端运行时规则实现，不得留给 UI 猜测：

1. 路径、task 与返回类型一致；requestId 回显一致。同一任务的 imageId、evidenceId、variantId 和文本 blockId 各自唯一。
2. 实际解码 base64、文件签名、byteLength、宽高相符，检查总字节、像素与数量限制。`contentEncoding` 与 `format` 不能被当作自动完成了解码或日期有效性检查。
3. primaryImageId 必须属于本次用户上传图片；无图片时为 null。所有 sourceImageIds 必须能在当前请求中找到。
4. 每个 evidenceId 均可解析。`sourceType=user_field` 的 sourceId 是当前 Request 中存在且非空的 JSON Pointer；image 引用当前图 ID。user_field 才可支持耗时、材料成分、真实经历等不可直接观察事实。
5. 标题、封面大字、正文中的每条可核实事实必须进入 claims，且引用真正支持它的证据。图像只支持可见外观，不证明耗时、材质、失败次数。模型漏报事实 ledger 也算错误，不能以“claims 为空”逃过检查。
6. 四个视觉维度 key 各出现一次，status 为优秀/良好/待优化/无法判断；移除所有数值评分及等权计算。visualGrade 为优秀/良好/待优化，仅针对可见整体。无法判断项返回 partial 与 warning，不以待优化替代未知；全部不可判断返回 error。所有有判断的项目必须关联证据。topicRecommendations 必须恰好包含稳健深耕线、时令节律与场景送礼线、跨界联动与流行混搭线各一次，每张卡必须有可执行的 craftOrMaterialTip；不得用未确认作品推导高反馈规律，也不得把常识性节点包装成实时趋势。
7. visual_only 不输出高反馈规律。representative_review 的规律只能关联用户选中或明确手填的作品；看不出依据时留空并发 warning。人工名称与已选标签合计按最多 3 个代表作品处理。
8. 成品 success 必须是 pain_point、emotion、curiosity 各一套；partial 仅允许 1～2 套，missingAngles 恰为缺失方向。每套正文与互动结尾不重复，合计不超过 800 字。
9. Feature 3 已退出 MVP。任何 `viral.*` 请求均不得进入当前公开路由或前端；历史协议预留不计入当前成功率、测试覆盖率或交付范围。
10. 所有高亮区间使用 UTF-16 code unit 的左闭右开范围；start < end，quote 必须与对应文本切片逐字相等。模型偏移错误时服务端可按唯一 quote 重定位，无法唯一匹配则去掉该高亮并提示，不伪造定位。
11. seasonalTags 仅来自用户填写的 occasion 或 intendedDate；日期默认只生成准确月份标签，不推断节日、季节地域、实时热度或最佳发布时间。空上下文返回空列表。
12. 各 Brief 字符串总计 ≤1,000 字；真实日历日期须有效。Schema maxLength 按 Unicode 字符计数，与高亮偏移采用的 UTF-16 单位区分。
13. 服务端禁止把未经校验的半截 JSON 作为候选卡片。仅已解析且逐套验证通过的结果可以部分展示；空有效结果返回 error。
14. LocalDraft.kind、snapshot 字段与 inspection/result.task 对应；首页索引与 draftId 对应。已选方案必须存在于原始结果；editedDraft.sourceVariantId 对应当前选择。原始结果不可被手动编辑覆盖。
15. editedDraft 用较宽的存储上限保留手动内容：标题 200 字、正文 5,000 字。超过生成建议长度仍可保存并提示，不因草稿编辑暂未完成而丢字。复制用户修改稿不代表其已通过 AI 事实验证；原批注与事实标注对修改部分失效。
16. Base64、原图、Blob URL、服务密钥与完整 Prompt 不得进入持久化缓存。正文／报告数据规模超出缓存预算时显示保存失败，不能悄悄删减已生成内容。

## 4. 详细功能规格说明

### 4.1 移动端全局框架、本地草稿与灵感状态

**目标与前置条件。** 用户打开即进入高频的文案助手，无登录和档案填写。底部 Tab 是唯一一级导航，固定顺序为：文案助手、选题灵感、主页体检。三栏是三个用户工作区，但当前只有 `profile.*` 与 `post.*` 两条 AI 调用链；选题灵感负责展示和流转主页报告已经生成的结构化卡片，不新增第三个模型接口。

#### 页面字段与回显

| 字段 / 组件 | 规则 |
|---|---|
| 一级导航 | 固定三栏：文案助手（默认／高频日用）、选题灵感（中频周用）、主页体检（低频月用） |
| Tab 状态 | 切换时保留本栏滚动位置、表单与未提交编辑；不创建新的历史草稿，不把 Tab 切换做成浏览器多层返回栈 |
| 最近记录 | 文案助手显示最近创作草稿，主页体检显示最近诊断；灵感库按收藏优先、其余按更新时间倒序 |
| 历史记录 kind | 当前只新建 `profile / post`；历史 `viral` 仅用于兼容旧本地数据，不提供继续生成入口 |
| 历史标题 title | 来自选定标题、主题或“未命名草稿”；≤60 字；不让模型另外命名任务 |
| updatedAt | 本地更新时间，倒序；机器数据为带时区时间戳 |
| stage | input、recognizing、confirming、generating、result、preview、interrupted |
| 保存状态 | 页面状态而非 AI 输出：saving、saved、failed、unavailable |
| 恢复动作 | 回到相应模块、已选方案和手动文案；图片显示“补传原图继续预览” |
| 列表筛选 | 全部／诊断／创作；更多记录原地展开，不新建复杂中心 |
| 删除入口 | 次级菜单；删除单条需明确对象；清空全部二次确认 |

#### 缓存契约与生命周期

使用本工具专属命名空间：`creator_copilot:v1:index` 存 CacheIndex，`creator_copilot:v1:draft:<draftId>` 存 LocalDraft，`creator_copilot:v1:ideas` 存 IdeaLibrary，`creator_copilot:v1:events` 存 LocalEvent 列表。完整定义见附录 `CacheIndex / LocalDraft / Snapshot / EditedDraft / ImageManifest / IdeaLibrary / LocalEvent`。

| LocalDraft 字段 | 类型与用途 |
|---|---|
| cacheVersion / draftId | 固定协议版本／本地随机标识，不是跨站用户标识 |
| kind / title / stage | 模块、显示标题与恢复阶段 |
| createdAt / updatedAt | 原始创建与最新保存时间；不因打开而改创建时间 |
| snapshot.images | 图片名称、尺寸、角色、原文件大小、指纹；没有图片内容；restoreState 固定 requires_reupload |
| snapshot.sourceIdeaId | 可选的本地灵感卡来源；只做流转追溯，不自动成为模型事实 |
| snapshot.brief / publishing / topic | 用户已填写信息，不含自动长期风格偏好 |
| snapshot.referenceText | 用户粘贴的参考文字；截图识别文字保存在结果 referenceBlocks 中 |
| snapshot.profileMode / representatives / manualRepresentative | 轻量确认状态，恢复后不强制再选一次 |
| snapshot.inspection / result | 已验证的原始响应，分别对应预识别与正式结果 |
| snapshot.selectedVariantId / editedDraft | 已选方案和手动修改稿独立保存，原始三套结果保持不变 |

新增：首次输入有效素材或文字时创建记录。更新：输入暂停 500ms、取得有效结果、选择方案或完成修改时更新当前记录，不每次生成一个重复历史项。用户主动“重新生成”创建新记录，旧手动稿保留；网络重试仍属于同一 run，不增加草稿。

容量按本工具全部键和值（含灵感库）的 UTF-16 长度乘以 2 做保守估算；该估算不是浏览器可用空间保证，实际写入失败仍须捕获。草稿条数、灵感卡 60 张上限与总容量哪个先达到就先限制新增，不自动删除旧稿或已收藏卡片。[localStorage 容量与存储限制](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

保存先写当前记录，再更新轻量索引；索引不一致时，只扫描本工具命名空间重建，不误删正文。记录写入失败保留上一份完整值和页面当前内容。不存在“为了腾空间先清空旧数据”的步骤。

恢复时重新校验缓存。recognizing／generating 转为 interrupted，不重启旧请求。版本不支持或单条损坏时隔离该条、允许复制可读文字，不让整个首页白屏。重复标签页编辑同一草稿时，检测更新时间冲突，保留本页为新副本或让用户选择，不静默最后写入覆盖。

**原图恢复约定：** 首次保存就提示“文字与方案保存在本机，原图仅本次使用”。当前页面仍持有照片时可正常预览和导出；刷新、关闭或切换浏览器后需要补传。补传按原图占位操作，并校验原文件指纹；不同文件不能冒充旧证据，应作为新素材处理。无图时仍能阅读报告、编辑及复制文案，不能保存带假图的封面。

此模式不使用 IndexedDB、云盘或原图 Base64 缓存。完整图文永久恢复不属于 V1.0 承诺。用户清除网站数据后记录不可恢复；浏览器拒绝持久化时显示“本次尚未保存”。

**验收。** 三个 Tab 均可单击直达；文案助手为默认页；保存和恢复文字、选择状态一致；容量满不删旧稿或收藏卡；缓存损坏仅影响对应项；任何页面不出现登录要求。

### 4.2 模块一：主页长截图诊断报告（Profile Doctor）

#### 目标、前置条件与页面信息架构

输入至少一张可读取的个人主页截图，支持头像、简介与封面瀑布流；不要求截图必须含粉丝数或互动数字。来源由用户主动选择，不接受主页链接自动抓取。

| 阶段 | 字段与前端表现 |
|---|---|
| 上传 | `images[1..6]`；整图缩略预览、追加、移除、点开放大；执行 3.4 限额 |
| 识别 | 图文骨架屏；调用 `profile.inspect`；没有数字校准和 Bounding Box 编辑 |
| 轻确认 | `candidates[0..3]`；显示 label、疑似反馈状态、复选符号；整标签可点 |
| 备选 | “都不准确”展开 `manualRepresentative`，最多100字；另有“仅做视觉诊断” |
| 报告 | 整体视觉标签、四项视觉状态、头像/背景图/昵称简介转化、垂直度、风格观察、高反馈假设、三维选题预览与优先动作；生成成功后提示“3 条选题已存入灵感库” |

#### 业务流程与 AI 逻辑

预识别去除明显重复作品，输出通常 2～3 个作品标签；无依据时少于两项或零项。feedbackSignal=visible_relative 只表示可见互动信号可能较好，页面显示“疑似高反馈”；unknown 仅显示“识别到的作品”。**禁止仅凭封面美观判断高赞。**

用户勾选确认“我认为这篇反馈较好”，也可仅做视觉诊断，不要求校对具体数字。正式报告重新基于提交截图和用户确认分析，不把前端传入标签当作已验证的客观平台数据。

报告不展示或保存 healthScore、dimension.score。visualGrade 是可见整体的定性判断；单项 status 优秀表示亮点清楚且表达稳定，良好表示可辨可读且有小改进空间，待优化须说明可见问题与动作，无法判断须说明截图局限。正文不出现证据编号或扣分措辞；依据列表与字段保留为内部审计。门面 feedback/clarityFeedback 同时描述可见资产和点评，不新增未获授权的商业目标；如需商业建议，用条件表达。垂直度区分可见笔记主副线，不虚构全账号比例，不把风格探索判为不垂直。

风格观察单列，不因探索多个风格而扣分。高反馈规律是待验证假设，不输出“这就是爆款原因”。三维选题各一条：稳健线延展已确认高反馈作品或可见能力；时令线连接四季、冷暖、开学、毕业或送礼节点；跨界线给出具体跨材质或流行美学映射。没有实时数据时不得声称“正火”或给出虚构搜索量；IP 只能作为用户提供或画面可见的灵感符号，不推断官方授权。每条建议都是待尝试方向，不伪称用户已经做过作品或承诺发布时间表现。

#### 完整协议入口与输出字段

Request／Response 完整 Schema 为附录的 `ProfileInspectRequest / ProfileInspectResponse / ProfileReportRequest / ProfileReportResponse`，四者通过内部 `$ref` 引用已完整定义的对象，均可独立作为校验入口。

| 对象 | 字段定义 |
|---|---|
| ProfileInspectInput | images：必填非空图片数组 |
| ProfileInspection | candidates：最多3项；evidence：观察依据列表 |
| candidate | candidateId、label、sourceImageIds、feedbackSignal、evidenceIds；没有赞藏数强制字段 |
| ProfileReportInput | images、mode、representatives、manualRepresentative；visual_only 时两种代表输入均为空 |
| representative | label、sourceImageIds、confirmedHighFeedback=true；最多3项 |
| ProfileReport | coverage、visualGrade、dimensions、headerAudit、verticalityAudit、summary、styleObservation、viralPatterns、topicRecommendations、priorityActions、evidence |
| dimension | key、status、explanation、evidenceIds；恰好四个不同key |
| headerAudit | avatar/banner: status、feedback、evidenceIds；bioAndConversion: status、clarityFeedback、conversionAdvice、evidenceIds |
| verticalityAudit | status、summary、evidenceIds；区分可见主副线，不编造全账号占比 |
| topicRecommendations | 恰好3项：稳健深耕线、时令节律与场景送礼线、跨界联动与流行混搭线；每项含 type、title、rationale、craftOrMaterialTip、visualAdvice、basisEvidenceIds |
| viralPattern | hypothesis、representativeLabels、evidenceIds；0～3项 |

#### 异常与边界

全部图片不可读：返回 IMAGE_UNREADABLE，不编造报告。局部不清楚：输出仍可用的 partial 报告、空缺字段与 warning。没有高反馈证据：保留视觉诊断，viralPatterns=[]。手填作品在图中无法对应：说明缺少依据，不凭名字补剧情。重复截图不重复累加证据或虚构样本量。

预识别失败保留上传图片，可重试或直接仅做视觉诊断；正式报告失败保留代表作品选择。报告完成后自动保存文字，查看依据时显示截图编号与描述；刷新后需补传图片才能重新放大原图。

### 4.3 模块二：成品图文质检与文案生成（Post Copilot）

#### 目标、输入字段与触发条件

至少一张自有作品照片即可生成。除了照片，其余输入都可跳过；不新增中途追问。第一张默认是 primaryImageId，用户可点击换主图。

| 字段 | 类型／上限 | 默认与使用规则 |
|---|---|---|
| images | Image 数组，1～6 | 必填；全部来自用户自己的素材 |
| primaryImageId | Id | 必须属于 images |
| brief.workName | string或null，60字 | 可选作品名称 |
| brief.material | string或null，120字 | 线材或材料；只能用户填写确认 |
| brief.durationMinutes | integer或null，1～43,200 | 前端允许以小时／分钟填写后统一换算；空值不能默认为0 |
| brief.difficulty | beginner / intermediate / advanced / null | 由用户评价，不从照片推断 |
| brief.sellingPoint | string或null，300字 | 首屏优先呈现“这次最想突出什么” |
| brief.pitfalls | string或null，300字 | 真实避坑经验；空值时不编造个人踩坑 |
| brief.styleRequest | string或null，120字 | 仅本次风格；不写入长期画像 |
| brief.confirmedTags | string数组，最多6项，每项30字 | 只有用户点选确认的预推断标签才进入这里 |
| publishing.intendedDate | 有效 YYYY-MM-DD 或null | 用户主动填写；不默认使用当前日期制造时令 |
| publishing.occasion | string或null，60字 | 用户明确的季节／节日／场景；可选 |

预识别仅建议 work_type、technique、visual_style 标签，标签始终先标“推测”。材料、耗时、难度、失败次数不自动填入事实字段。预识别可以在用户补充表单时发生，但点击生成无需等它结束；生成使用提交时快照，之后返回的标签被忽略。

#### 核心业务流程

正式生成一次返回三套：pain_point、emotion、curiosity。每套包含匹配的封面模板指令、标题、正文、互动结尾和话题；不是连续优化三遍。所有方案使用同一份事实，不为制造差异改动参数。

photoReview 给构图与展示建议。封面仅用 clean、top_caption、bottom_caption 三种有限模板，以及 contain 或 center_crop 两种适配方式；文字最多14字。用户可换模板、改字、切换适配方式，不做自由画布、精细抠图、重绘和自动去背景。center_crop 可能损失细节时默认改 contain 并提示。

方案区横滑比较封面、标题和正文摘要；滑动不选中，点击“用这一版”才更新 selectedVariantId。预览区在同页后方，点击主按钮可平滑定位；不重新发起模型调用。

编辑和批注不增加主流程页面。批注默认隐藏，开启后显示对应句子、问题和建议；不自动改写原文。批注由同次生成携带，V1.0 不额外开设自动多轮审稿接口。用户手动改动后，相应批注失效，不错误地继续套用。

#### 完整协议与输出字段

完整 Schema：`PostInspectRequest / PostInspectResponse / PostGenerateRequest / PostGenerateResponse`。详细定义全部位于附录 A。

| 返回对象／字段 | 约束与前端用途 |
|---|---|
| PostInspection.inferredTags | 0～6个；tagId、category、label、confidence、evidenceIds；未确认标签不作用户事实 |
| PostResult.photoReview | 最多4条有依据的照片质检建议 |
| PostResult.variants | success恰好3套；partial为1～2套；方向不重复 |
| missingAngles | 缺失方向的精确列表，全部成功时为空 |
| Variant.variantId / angle | 方案标识与方向，供选择、缓存和评测去重 |
| cover | 自有imageId、固定3:4、有限layout、fit、headline |
| title | 生成预算≤20字，不承诺真实高点击率 |
| paragraphs | 2～5段，每段blockId、role、text、evidenceIds；未知参数／避坑段可以缺省 |
| interactionHook | 真实可回答的结尾问题，≤80字；不使用强制点赞／利益诱导口令 |
| hashtags | 0～6项，无前导#、不带空白；UI负责加#和蓝色样式 |
| seasonalTags | 0～2项；label、basis、sourceValue；没有明确发布时间背景则为空 |
| claims | 标题、大字及正文全部可核实事实的定位与证据，不等于仅列参数 |
| annotations | 0～6条文本批注；含targetPath、UTF-16起止位置、quote、category、message、suggestion |
| evidence | 图片和用户已提供字段的证据账本，不暴露完整内部Prompt |

#### Mobile Preview Sheet 与复制行为

“1:1”指呈现还原目标，不是1:1图片比例。顶部为3:4自有照片及已确认排版，下方标题、Emoji与分段正文、蓝色#话题。完整预览为只读；返回编辑保持滚动位置。诊断报告也可在同一预览层以报告模式查看，不自动改写为待发布笔记。

复制顺序固定为：标题→空行→正文各段（段间空行）→空行→互动结尾→空行→去重后的话题。用户进入手动编辑后，以 editedDraft 的标题、bodyText、话题为准，禁止重新拼入已删除的旧段落或重复互动钩子。无内容的段落不产生多余占位。

复制输出纯文本，不包含批注、风险标记、按钮或蓝色样式；平台识别话题效果需在真实发布端确认，不声称已经生成可用的平台话题链接。一键复制只有系统确认成功后才提示“已复制”。

保存封面仅导出作品图片与用户选择的标题排版，目标1080×1440；不把模拟点赞数或整个应用界面一起导出。原图像素不足时提示可能模糊，不声称自动补足细节。浏览器仅触发下载时，提示“已开始下载”，不误称“已保存到相册”。

没有图片时仍可看文字预览和复制，但禁用封面导出，并给“补传原图”入口。严禁用竞品图片、虚构照片或默认样例替换真实缺图。

#### 异常与边界

可选表单全空：基于可见外观写克制草稿，未知事实省略。只生成1～2套且可验证：标 partial，可直接使用，不让成功内容陪同失败项一起消失。全部无效：明确失败，保留输入。

V1.0 不另做单方向补生成接口；用户选择“重新生成三套”时建立新记录并保留旧结果与修改。超长手动文案允许缓存并提示长度风险，不能因为不满足模型输出预算而丢失编辑内容。

### 4.4 选题灵感库（Ideation Library）

#### 模块目标与边界

把主页体检中一次性的选题输出变成可持续使用的创作入口。V1.0 不为此新增模型调用：灵感卡唯一来源是通过验证的 `ProfileReport.topicRecommendations`，本地保存、收藏和跨 Tab 带入均由前端完成。用户不能在灵感库中凭空生成“当前趋势”，也不接入热榜、爬虫或平台搜索量。

#### 数据结构与生成规则

主页报告成功或有效 partial 后，前端将每条 recommendation 包装成 `IdeaLibraryItem`，写入 `creator_copilot:v1:ideas`。同一 `sourceRequestId + recommendation.type` 采用幂等 upsert，重开报告不重复插入；用户主动重新生成的新 requestId 形成新的三张卡。卡片上限 60，达到上限时禁止新增并提供管理入口，不自动删除旧卡或收藏卡。

| 字段 | 定义与 UI 用途 |
|---|---|
| ideaId | 本地随机标识，用于收藏和跨栏带入 |
| sourceDraftId / sourceRequestId | 对应来源诊断草稿和请求，保证可追溯；不展示为正文 |
| recommendation.type | 三类之一：稳健深耕线／时令节律与场景送礼线／跨界联动与流行混搭线 |
| recommendation.title | 卡片主标题，≤50字 |
| recommendation.rationale | 为什么值得尝试，必须区分可见依据、通用节点建议和推测 |
| recommendation.craftOrMaterialTip | 可执行的针法、结构、材质或配件组合建议；不得把建议写成已完成事实 |
| recommendation.visualAdvice | 成品拍摄或封面呈现建议，与工艺建议分开 |
| recommendation.basisEvidenceIds | 回查来源报告 evidence；若来源截图已释放，只显示文字描述，不假装原图仍存在 |
| isFavorite | 本机收藏状态；默认 false，不扩展为跨模块通用收藏体系 |
| createdAt / updatedAt | 本地带时区时间戳；收藏变化只更新 updatedAt |

#### 页面信息架构与交互

顶部提供“全部／已收藏”二态筛选，并用三种类型标签帮助扫读；不做复杂分类管理。空状态分两种：从未体检时提示“先做一次主页体检，选题会自动沉淀到这里”；缓存被清空时明确说明本机记录不可恢复。每张卡默认展示类型、标题、理由和工艺／材质建议；封面建议可展开。主动作是“去写文案”，次动作是收藏／取消收藏和“查看来源诊断”。

“去写文案”必须执行以下确定映射：

1. 新建一条 `post` 草稿并记录 `snapshot.sourceIdeaId`，不得覆盖文案助手中尚未保存的编辑稿。
2. 切换到 Tab 1 文案助手，把 `brief.styleRequest` 预填为“{type}｜{title}”，把 `brief.inspirationOrWishes` 预填为 rationale；两者仍可编辑。
3. craftOrMaterialTip 只作为“灵感参考”展示，不自动写入 `brief.material`、`difficulty`、`durationMinutes` 或 confirmedTags；用户明确采用并修改后才成为本次输入。
4. 不携带来源主页截图，也不把原账号高反馈结论当成新作品事实。用户仍须上传自己的成品照片才能调用 `post.generate`。

#### 异常与验收

单张卡写入失败不影响诊断报告阅读，页面显示“报告已生成，部分选题未保存”；重试采用相同幂等键。来源草稿被删除时卡片可继续使用，但“查看来源诊断”显示来源已不存在。卡片结构损坏时隔离该项，不让整库白屏。验收必须覆盖：三卡自动沉淀、重复打开不重复、收藏刷新后保留、从卡片新建文案草稿、未上传作品图不能生成、清空本地数据后的真实空状态。

### 4.5 已废弃／Post-MVP：爆款逆向拆解与仿写（Feature 3）

**状态：不属于 V1.0 MVP。** 2026-09-17 决定取消该功能。原因是手作赛道的核心价值更集中在作品视觉、工艺参数与图解实用度；结构仿写偏离首位真实用户的主要工作流，并增加圈内抄袭与同质化风险。当前首页、导航、页面路由、接口、Prompt、测试、缓存新建逻辑和验收均不得实现或计入 Feature 3。

下列内容仅保留为历史决策记录，不再具有规范效力。未来如重新评估，必须新建 Post-MVP 版本、重新定义用户价值和原创边界，不能直接复用旧规格进入开发。

<details>
<summary>历史规格存档（非当前实现要求）</summary>

#### 输入与前置条件

| 字段 | 约束 |
|---|---|
| reference.text | 可空，非空时≤5,000字；只接受用户主动粘贴 |
| reference.images | 0～6张同一篇笔记截图；与自有图合计≤6；至少有文字或一张参考图 |
| own.topic | 新主题，≤300字；可空，但与自有照片至少提供一种 |
| own.images / primaryImageId | 用户自己的照片；没有图片时primaryImageId=null |
| own.brief / publishing | 与成品模块相同，可选事实与发布背景；参考作者数据不能自动复制进来 |

页面上“参考笔记”和“我的素材”明确分区。用户只贴链接时提示粘贴正文或上传截图，不尝试抓取。既贴文案又上传截图时优先使用粘贴文本作为文字基准，截图辅助理解封面；不把重复内容计算成两篇笔记。

#### 流程、结构拆解与高亮

一次提交后直接交付仿写结果。顶部的“💡 爆款底层骨架拆解”默认折叠，用户不必读完或确认才能预览复制。模型输出解释摘要和可引用证据，不要求或展示私有思维链。

参考粘贴文本按原始段落形成 referenceBlocks，保留文字内容；截图文字识别标注为“截图识别文本”，看不清的内容不补造。仅有封面时 structureCoverage=partial，不幻想正文结构。

折叠面板内每个结构项对应 role、explanation、sourceSpans 和 ownEvidenceIds。点击“开头Hook”等结构项，仅高亮当前参考文本块的对应片段；同时说明自己的哪条素材承接这一结构。使用文字标签与高亮颜色配合，不只靠颜色区分。

截图中不显示坐标框；高亮仅发生在识别出的文本中。sourceSpans 的 quote 与 start/end 必须严格匹配 referenceBlocks。无法可靠匹配时保留解释、撤掉错误高亮并提示，不能在原图上猜位置。参考全文过长或不可读时在输入质量阶段处理，不跳转到长篇校对流程。

#### 完整协议与结果结构

完整 Schema：`ViralGenerateRequest / ViralGenerateResponse`；引用的 `ViralGenerateInput / ReferenceInput / OwnInput / ViralResult / ReferenceBlock / SkeletonItem / SourceSpan / Variant` 均在附录中完整定义。

| ViralResult 字段 | 定义 |
|---|---|
| draft | 一份完整Variant，angle固定为reference_structure；不是默认再生成三套 |
| referenceBlocks | 可高亮的原文／截图识别文本；blockId、text、sourceImageId；总字数≤5,000 |
| skeleton | 1～4项，覆盖实际可见的hook、emotional_value、progression、interaction；不得硬凑四项 |
| structureCoverage | complete 或 partial；仅说明参考结构可见程度，不评价作品好坏 |
| originality.scope | 固定 provided_reference_only，不是全网查重 |
| originality.rewritten | 本轮是否因相近表达执行过重写，必须与实际执行一致 |
| originality.longestSharedRun | 服务端计算的最长连续相同片段字数，不由模型估算 |
| originality.note | 对本次参考范围及检查局限的简短说明 |
| evidence | 参考结构依据与自有事实依据，可区分来源 |

文字相近检查归一化空白、大小写及标点；连续相同片段达到18字或模型发现辨识性短句时进入复核。常见材料名、普通术语命中不能直接定性为抄袭；复核看表达是否具辨识度。确认风险后使用共享的唯一一次自动修复预算重写；仍无法解决则返回 SIMILARITY_UNRESOLVED，不以“原创保证”包装。

只提供新主题没有自身经历时，输出建议、观察或作品介绍，不编造“我试了三次”“全网都在问”等事实。原文作者的销量、耗时、粉丝反馈均不能迁移成用户的经历。

#### 可校验的请求示例

下面仅是为说明协议制作的原创演示输入，不是用户真实作品资料；没有图片也能按主题仿写。失败、部分结果及完整成功结构均由附录 Response 约束。

```json
{
  "schemaVersion": "2.0.0",
  "requestId": "demo_viral_001",
  "task": "viral.generate",
  "payload": {
    "reference": {
      "text": "不想让钥匙一直躺在包底，于是做了一个可以挂在包边的小挂件。小物件也可以成为每天的小点缀。你更喜欢明亮配色还是低饱和配色？",
      "images": []
    },
    "own": {
      "topic": "介绍我做的草莓造型编织挂件",
      "images": [],
      "primaryImageId": null,
      "brief": {
        "workName": "草莓造型编织挂件",
        "material": null,
        "durationMinutes": null,
        "difficulty": null,
        "sellingPoint": null,
        "pitfalls": null,
        "styleRequest": "自然分享，少用夸张形容词",
        "confirmedTags": []
      },
      "publishing": {"intendedDate": null, "occasion": null}
    }
  }
}
```

</details>

## 5. 非功能性需求与体验细节

### 5.1 性能、Loading 与中断

性能目标待真机和真实模型验证：主要点击反馈≤100ms；选择图片后≤300ms出现可见占位反馈，实际缩略图解码异步完成；正式生成等待目标P50≤20秒、P95≤45秒，90秒结束本轮等待。不能以开发机表现替代移动网络结果。

骨架屏只占结果区域，不遮住返回、取消和已填信息。15秒后增加“处理较久，可继续等待或保留草稿稍后重试”；不显示虚假百分比，不承诺关闭后一定后台完成。已经取得的有效结果不因非关键环节失败消失。

当前两个核心功能均只展示经过完整校验的报告或文案，不把未闭合 JSON、供应商外壳或推理过程推到 UI。

同一页面任务同时只允许一次正式生成。输入、图片或任务切换产生新的上下文版本；晚到的旧响应不覆盖新内容。主动取消后即使供应商继续计算，前端也不将结果覆盖到新任务。刷新／页面被系统回收后恢复已保存状态，不依赖卸载事件完成最后一次保存。

### 5.2 安全性、平台风险词与基础校验

所有返回文本作为纯文本显示；不直接执行HTML、Markdown内嵌脚本、任意URL或模型命令。校验图片实际格式与解码结果，限制像素和请求体；不以扩展名或文件选择器筛选代替校验。[文件格式筛选的边界](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept)

前端设置版本化的“内容风险提示词库”，而不是宣称掌握小红书完整官方违禁词库。覆盖夸大承诺、未经支持的绝对化表达、强诱导互动及不必要的个人联系信息等风险；同样用于标题、封面文字、正文与话题。例“保证100%成功”“全网第一”作为需上下文复核的表达，不把单个“最”字机械判定违规。

命中后保留原稿，用高亮和解释提醒，给中性替代建议；不静默删词或用谐音规避平台审核。区分否定句、引用原文、普通手工术语等误报情况。结构和文件安全不合格可以阻止提交；单纯关键词命中不等于最终违规判定。模型输出的高风险内容由服务端复核；前端过滤不是可依赖的安全边界。

前端风险项运行态字段为 `ruleId、targetPath、start、end、matchedText、severity、reason、ruleSetVersion`；不混入复制文本，也不把用户已知信息改写掉。词库由产品负责人维护来源、适用范围、更新日期和误报样例。平台规则需通过当前官方应用中的相关规范人工核对；官方“现场”主题规范属于特定场景，不能当作所有图文笔记的完整规则。[官方特定场景规范与社区规范指引](https://top.xiaohongshu.com/fe/toph5/rules/subject)

首次上传区用简短说明告知素材将用于AI分析、历史仅保存在本机；不新增冗长审批流程。不收集姓名、电话、邮箱、精确位置和无关身份。业务日志不保存图片、完整正文、原始参考、完整Prompt或请求头；仅保留必要的任务类型、版本、错误码、耗时与用量统计。模型服务自身的数据处理条款需在上线前核对，不提前承诺第三方绝不保留或训练。

公开无登录API仍需服务端限流、并发和总预算上限；这些不能仅靠可被清空的localStorage计数。具体额度在发布配置中填写，未填写或无可靠限制时不得开放不受控的真实生成。T0不为此建设用户中心，也不收集额外个人资料。

### 5.3 移动端、手势与 PWA

以360～430 CSS像素宽度为主要验收区间，同时覆盖320像素窄屏和桌面。主要按钮位于底部安全区；触控目标至少44×44 CSS像素作为项目设计目标。键盘弹出时不遮挡输入和确认动作，正文可缩放阅读。

候选卡横向滑动吸附到单卡，露出下一张边缘；提供可点击的页码／切换按钮，不要求只能靠手势。页面纵向滚动；卡片内不嵌套独立长正文滚动容器。

BottomSheet用于编辑、批注或完整预览，分别打开，不套娃叠加。打开时将焦点置入面板，关闭后回到触发入口；有明确关闭按钮，支持系统返回、适用设备的键盘Escape。未完成保存时关闭不丢内容，保存失败留提示。只有覆盖修改、删除记录、清空全部等动作需要确认。

文本、选中态、风险态不只靠颜色。正文目标对比度≥4.5:1，动画遵循减少动态效果偏好。无障碍朗读可识别加载、方案序号、展开状态与复制反馈。

PWA须有可安装清单、图标、HTTPS和适配布局；不强制安装。静态应用壳可采用常规离线缓存，但业务记录只用localStorage，不缓存AI请求响应或原图到其他存储。离线仅保证已缓存应用壳可打开时读取本机草稿；AI生成需要网络。不同浏览器、安装容器、域名之间不承诺记录共享。

### 5.4 统一错误行为

| 错误／状态 | 对外表现 | 自动重试与恢复 |
|---|---|---|
| INVALID_INPUT | 指向缺失或格式错误字段 | 不重试，保留所有输入 |
| UNSUPPORTED_IMAGE | 指向该图片，说明支持格式 | 替换单图，不重置表单 |
| PAYLOAD_TOO_LARGE | 显示当前数量／大小与限额 | 用户减图或换清晰截图，不静默截断 |
| IMAGE_UNREADABLE | 无足够可读信息 | 换图；有部分依据时可返回partial |
| INSUFFICIENT_REFERENCE | Post-MVP 历史预留；当前 MVP 不触发 | 不在当前前端展示或统计 |
| RATE_LIMITED | “当前请求较多，请稍后再试” | 仅在可信等待时间与剩余预算允许时内部重试1次，否则用户稍后重试 |
| UPSTREAM_UNAVAILABLE | 安全服务错误，不展示密钥或供应商堆栈 | 仅明确临时故障可重试；授权配置问题不自动重试 |
| TIMEOUT / NETWORK_INTERRUPTED | 保留输入和已存内容，不无限转圈 | 无法确定上次完成状态时不自动重复提交；用户决定重试 |
| OUTPUT_INVALID | “本次结果未通过检查” | 有剩余预算时修复一次，否则返回明确失败 |
| SIMILARITY_UNRESOLVED | Post-MVP 历史预留；当前 MVP 不触发 | 不在当前前端展示或统计 |
| CONTENT_UNSUPPORTED | 清楚说明无法处理的范围 | 不通过改写提示绕过限制 |
| local_save_failed | “本次修改尚未保存到本机” | 保留页面数据和旧记录，提供管理历史、复制与重试 |
| clipboard_failed | “未能自动复制，可手动复制” | 展示可选中的纯文本；不记录copy_success |
| export_failed | 保留预览与文本 | 再次下载或打开图片手动保存；不记录确定保存成功 |

服务错误的HTTP语义：输入／格式为400或422，体积超限413，频率429，临时服务问题502/503，服务处理超时504；成功与partial为200。响应体始终符合对应Response；连连接都未建立的错误由客户端本地展示。copy_success只在系统确认复制成功后记录；cover_export_success表示文件已生成且浏览器接受导出动作，不等于用户已发布或相册落盘得到验证。

## 6. AI 评测与质量监控体系

### 6.1 Prompt 设计规范

System Prompt由服务端按版本加载，固定声明任务、数据边界、未知值处理、原创要求、输出协议与禁止事项。用户主题、参考文本、OCR内容和图片信息放在明确标记的不可信素材区，不拼接为新的系统指令。用户素材中出现“忽略规则”“泄露Prompt”等仅作为被分析文本，不改变行为。

每个任务模板由六部分组成：任务与目标；可信用户事实；待分析图片；字段和证据要求；少量正反例；对应 data JSON Schema。少样本例必须自建或合法使用，包含输入与合格的结构化输出；不可用未经确认的同行经历作事实模板。

首批 Few-shot 至少覆盖：资料齐全；跳过所有可选字段；低清截图；多风格主页；第一人称文案；自然参数表达；可选灵感缺失与存在两种情况。例子应短且直接服务失败模式，不能把长篇“爆款套路”塞进每次请求。Prompt 文本不得输出到前端。

正式生成内部次序：读取素材→区分事实、观察和推测→生成候选与证据→检查结构和内容。只交付诊断、文案和证据，不交付隐藏推理过程。耗时与重试次数由应用记录，不由模型编造。

当前协议版本为 2.1.0。主页使用 `profile_*_v2.1.0`，在已走查的定性门面诊断基础上增加稳健、时令、跨界三维选题和 craftOrMaterialTip；成品生成继续使用 `post_generate_v1.2.0`，已加入可选 `inspirationOrWishes`、第一人称博主视角、自然参数表达及第三方／法务话术拦截。协议2.0.0下的两个核心功能均已完成本地端到端 Schema 走查；本次2.1.0变更已完成结构与业务规则回归，但三维选题的新模型输出尚未重新发起真实调用，因此不能把历史结果写成2.1.0端到端通过，更不等于生产上线。`viral_generate` 已废弃，不维护 Prompt 版本，也不要求回归。

### 6.2 评测数据与执行方案

首批计划建立40个独立场景，两个核心功能各20个；每个功能10个开发样例、10个锁定测试样例。开发样例用于 Prompt 迭代；锁定集20个样例每个重复3次，形成60次调用以观察随机性。**这些是拟建规模，不是已完成的调研或评测。** 重复调用不是60个独立样本，报告必须同时写独立样本数、调用次数和分母。

按创作者／作品分组拆分，避免同一作品的近似截图同时出现在开发与锁定集。覆盖：完整与缺失参数、清晰与低清图、多风格、重复截图、可选灵感、第一人称、长文本、Emoji 偏移、提示注入和数字幻觉。网络、限额、缓存故障属于独立工程异常测试，不混入自然模型质量样本。

每条样例记录 `caseId、module、sourceAndPermission、input、knownFacts、forbiddenClaims、expectedEvidence、expectedFallback、split`。不保存未经授权的私信或身份信息。事实与术语由懂手作的评审确认，模型自评只能辅助。

模型对比保持同一输入、Prompt与预算。至少抽取20%的锁定输出由两位评审独立打分，分歧大于1分进行复核；如果实际只有一位评审，明确报告单人评审，不能虚构双人一致性。

### 6.3 指标定义与初始上线门槛

以下均为待验证目标，没有已实现数值。

| 指标 | 精确定义 | 初始目标／用途 |
|---|---|---|
| 首次JSON解析成功率 | 首次模型文本能被JSON解析的次数 ÷ 首次收到终态模型响应的次数；拒答和截断计失败，纯网络无响应另计 | ≥98%；另报告网络无响应率，避免幸存者偏差 |
| 首次Schema合格率 | 首次模型结果通过目标data Schema的次数 ÷ 同上分母 | ≥95%；不能与单纯解析率混为一谈 |
| 修复后结构合格率 | 最多一次修复后得到结构合格data的请求数 ÷ 已取得模型终态响应的有效请求数 | ≥99%；仍失败必须转错误态 |
| 对外协议违约 | 实际交付前端的不合格Response数量 | 0；合法error响应不算生成成功 |
| 端到端完整成功率 | 返回success并成功呈现的正式生成run数 ÷ 有效正式生成提交run数 | ≥95%；重试不新增分母；partial单列 |
| 可用结果率 | success或有效partial结果run数 ÷ 有效正式生成提交run数 | 单列，不能用来掩盖三套不齐全 |
| 事实支持率 | 人工核查时被输入真正支持的事实条目 ÷ 输出全部事实条目 | ≥98%；不能只审模型自行列出的claims |
| 严重事实错误 | 编造材料、耗时、制作经历、互动数字等关键事实的次数 | 锁定测试集必须为0，否则阻断上线 |
| 引用有效率 | 引用存在、定位正确且支持该结论的条目 ÷ 所有引用条目 | ≥98%；不存在的引用不得交付 |
| 幻觉兜底正确率 | 信息不足样例中正确省略／降级的次数 ÷ 此类样例次数 | ≥95% |
| 三方案区分度 | 人工能指出三套不同表达角度且事实一致的成品结果数 ÷ 完整成品结果数 | ≥90% |
| 生成等待时间 | 正式提交到首份完整可用内容呈现；不含填表和确认时间 | P50≤20秒、P95≤45秒，报告实际网络与设备条件 |
| 每个可用结果成本 | 该模块全部模型调用费用（含预识别、失败、重试）÷ 可用正式生成结果数 | 实测后作为选型指标，不虚填单价 |
| 视觉标签稳定性 | 同一样例重复运行定性等级的一致率，排除无法判断项并单列其比例 | 初始验收目标：等级一致率≥90%；尚未验证 |

60次计划调用的结果只用于 MVP 小样本判断，不能证明总体质量达到某个精确比例。报告同时给出计数和适合二项指标的置信区间；字段全空、降级比例过高或过度拒绝也必须展示，不允许靠少回答获得高事实率。

### 6.4 生成质量人工评分

各维度采用1～5分：1分为无法使用／明显错误，3分为基本可用但需明显调整，5分为可信、具体且接近直接使用。中间分数按接近程度评定。

| 维度 | 评审问题 |
|---|---|
| 手工术语准确度 | 针法、材料和作品描述是否正确；未知信息是否克制？ |
| 事实忠实与证据 | 是否忠实于输入，引用能否支持标题和正文事实？ |
| 标题吸引力 | 是否具体、有阅读理由，与正文一致而非夸张承诺？ |
| 正文可读性 | 分段、信息顺序、参数与经验组织是否适合手机阅读？ |
| 互动质量 | 结尾问题是否自然、可回答，避免机械求赞和利益诱导？ |
| 视觉建议可执行性 | 用户能否据此调整构图／文字，是否保护作品主体？ |
| 原创迁移 | 是否只借鉴结构，素材确实来自用户，表达具有自身差异？ |

按模块只计算适用维度，目标平均≥4分且任一适用维度平均不低于3分。事实严重错误不允许被“标题吸引力”高分抵消；这些评分不等于真实点击率或发布后的业务表现。

### 6.5 内容采纳率与上线后监控

T0不新增收藏按钮。自动保存草稿不是用户采纳，也不能当作“收藏转化”。采用两个明确口径：

- **文案复制采纳率：** 至少一次copy_success的生成run数 ÷ 至少一次result_viewed的生成run数。
- **内容使用意向率：** 至少一次copy_success或cover_export_success的生成run数 ÷ 至少一次result_viewed的生成run数。

按模块分别统计；主页的复制报告与创作模块的复制文案不能直接混算。一个run重复复制或下载只记一次转化；选择方案、打开预览、自动保存不计入采纳。复制／导出只是使用意向代理指标，不证明已发布、获得互动或实际产生价值。

LocalEvent完整协议见附录：事件包括generation_submitted、generation_failed、result_available、result_viewed、variant_selected、preview_opened、manual_edit、copy_success、cover_export_success。runId为一次正式生成标识；自动重试沿用runId；主动重新生成另建runId。事件不含文案、图像、设备指纹或身份数据。

真实交互标记public_demo，离线样例标记offline_evaluation，静态示例标记demo_fixture。指标只在同类数据内计算。公共服务端决定运行分类，用户请求不能传一个字段就获得离线权限。

**无登录、纯本地记录的限制：** 前端行为数据仅保存在当前浏览器，不自动上传；项目负责人只能查看自己的本地结果，或取得参与者主动导出的去内容化事件记录。不存在未经建设却已拥有的“全站采纳率大盘”。如以后需要全站产品分析，须另行定义告知、采集、保留与存储需求。

本地事件超限按run整体移除最旧记录，不能留下只有复制没有分母的孤立事件；统计仅使用窗口内有完整必要事件的run，并标明清空／缺失带来的样本偏差。本地记录可被用户修改，不可用作不可抵赖的商业业绩证据。

上线后质量监控由两部分组成：服务端仅统计脱敏的运行可靠性、模型版本、耗时和用量；行为采纳由本地事件或明确同意的人工导出观察。定期复跑锁定测试集，不默认存储和抽查所有真实用户正文。触发严重事实错误时暂停相关版本或回退已通过测试的版本，不把错误隐藏为普通改写。

### 6.6 容错、修复与兜底状态机

1. 先校验输入与大小；不合格直接指出问题，不消耗模型调用。
2. 取得模型终态输出后，依次检查JSON解析、Schema、业务不变量、事实／引用与相近表达。
3. 失败且仍有预算时最多修复一次。只给模型必要的字段错误和原输入；不能把修复当作添加未知事实的机会。
4. 明确的临时服务故障可以在剩余总时间内短暂退避后重试；格式修复、语义修复和网络重试共享一次预算，不能分别各重试一次。
5. 对已发出但无法确定是否完成的请求，不自动跨供应商重新生成。页面内去重与服务端短时去重尽力减少重复，不能在没有可靠任务记录的情况下承诺跨刷新严格幂等。
6. 成品仅部分候选独立有效时返回partial并明确缺失方向；其余模块仅在已有内容确实可用时partial。完全无有效内容返回error，用户输入保留。
7. 模型不可用时可提供用户已填信息的手动编辑出口，不生成伪AI结果；示例演示必须明确标记demo_fixture并排除评测。

关闭页面后的模型任务不保证完成或可恢复；重新打开只恢复已保存内容。接口超时或服务端返回错误不能造成首页历史清空。

### 6.7 发布前验收清单与人工确认

| 验收项 | 必须满足 |
|---|---|
| 三条主链路 | 真机从首页到结果、复制／导出可走通；不增加校对数值和中途追问 |
| 证据与原创 | 严重事实错误为0；缺图、缺信息、参考仅封面时行为正确；无伪全网查重保证 |
| 协议 | 所有Schema可解析、引用可解析；正反例通过；业务不变量有独立验证，不只检查JSON语法 |
| 草稿 | 文本自动保存／恢复、容量满、禁用存储、损坏记录、原图补传均有可用状态 |
| 移动端 | iOS Safari、Android Chrome、可用PWA容器、窄屏、键盘与系统返回均实测 |
| 预览 | 用目标平台参考截图核对布局；复制文本与用户当前稿一致；未伪造平台指标或发布状态 |
| 模型接入 | 确认所选模型可用、费用可接受、Prompt版本固定、服务端密钥隔离和公共额度生效 |
| 数据与规则 | 示例许可可确认、风险词库来源和适用范围已复核、模型服务数据条款已确认 |
| 评测报告 | 明确样本数、分母、实际结果、未通过项；不把本文目标直接填写为测试成绩 |

文档维护人的姓名、实际供应商账户／预算、平台视觉参考图和风险规则清单需在对应工作开始前补齐。这些是实施与发布前的核实项，不代表可以重新加入已排除的登录、爬虫、原图云存储或复杂编辑器。

下一阶段按顺序完成：以真实样例走查本PRD→确定低保真页面与异常态→准备接口契约样例和评测集→模型小样本验证→再编写业务代码。本文不包含业务实现代码。

### 文档协议校验记录（不是模型评测结果）

历史协议1.0.0的文档检查：曾通过 Draft 2020-12 元Schema校验，54个定义、112处引用、23个正例与27个反例。这不是方案 B 的评测结果；新版必须重新验证，不沿用旧通过结论。

上述验证不包含真实模型调用、UI运行、图片解码、缓存实测或业务不变量的执行测试；这些是下一阶段必做项。正文内演示请求已通过对应Request Schema校验。独立协议文件与下面的附录内容必须保持一致。

## 附录 A：完整 Request / Response / Cache JSON Schema

下列内容是完整、可解析的 JSON Schema，而非示例数据。每个模块的具名 Request／Response 入口通过内部引用复用公共字段。工程中必须按任务选择具名入口，不能仅使用根Schema判断一切。CacheIndex与LocalEvent分别使用其具名定义校验。

`contentEncoding`、字符计数、跨字段引用、权限、原图真实类型和事实真实性仍需3.6所列的业务校验。附录中的条件组合用于应用层完整验证；模型供应商侧若不支持某些关键字，应转换其输出子集，不得降低应用层标准。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:creator-copilot:protocol:2.1.0",
  "title": "Creator Copilot V1.0 MVP normative contract",
  "description": "Root accepts an API request, API response, local draft, or local idea library. Validate the specific $defs entry at each boundary. Cross-field semantic rules are normative in PRD section 3.6. The current MVP implements profile.* and post.* model calls plus a local idea-library workspace; viral.* definitions are deprecated Post-MVP reservations and must not be exposed by current routes or UI.",
  "$comment": "MVP scope decision 2026-09-18: the mobile IA uses Copy, Ideas, and Profile tabs. Ideas persist profile-report recommendations locally; no third model endpoint is added. Feature 3 viral reverse-engineering remains pruned.",
  "oneOf": [
    {
      "$ref": "#/$defs/Request"
    },
    {
      "$ref": "#/$defs/Response"
    },
    {
      "$ref": "#/$defs/LocalDraft"
    },
    {
      "$ref": "#/$defs/IdeaLibrary"
    }
  ],
  "$defs": {
    "Id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 80,
      "pattern": "^[A-Za-z0-9_-]+$"
    },
    "NullableText": {
      "type": [
        "string",
        "null"
      ],
      "minLength": 1,
      "maxLength": 300
    },
    "Task": {
      "enum": [
        "profile.inspect",
        "profile.report",
        "post.inspect",
        "post.generate",
        "viral.generate"
      ]
    },
    "Image": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "imageId",
        "mimeType",
        "base64",
        "width",
        "height",
        "byteLength"
      ],
      "properties": {
        "imageId": {
          "$ref": "#/$defs/Id"
        },
        "mimeType": {
          "enum": [
            "image/jpeg",
            "image/png",
            "image/webp"
          ]
        },
        "base64": {
          "type": "string",
          "minLength": 4,
          "maxLength": 1398104,
          "contentEncoding": "base64"
        },
        "width": {
          "type": "integer",
          "minimum": 16,
          "maximum": 10000
        },
        "height": {
          "type": "integer",
          "minimum": 16,
          "maximum": 10000
        },
        "byteLength": {
          "type": "integer",
          "minimum": 1,
          "maximum": 1048576
        }
      }
    },
    "Images": {
      "type": "array",
      "maxItems": 6,
      "items": {
        "$ref": "#/$defs/Image"
      }
    },
    "Brief": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "workName",
        "material",
        "durationMinutes",
        "difficulty",
        "sellingPoint",
        "pitfalls",
        "styleRequest",
        "confirmedTags"
      ],
      "properties": {
        "workName": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 60
        },
        "material": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 120
        },
        "durationMinutes": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 1,
          "maximum": 43200
        },
        "difficulty": {
          "enum": [
            "beginner",
            "intermediate",
            "advanced",
            null
          ]
        },
        "sellingPoint": {
          "$ref": "#/$defs/NullableText"
        },
        "pitfalls": {
          "$ref": "#/$defs/NullableText"
        },
        "styleRequest": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 120
        },
        "inspirationOrWishes": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300,
          "description": "Optional creator-provided inspiration, IP reference, cultural association, or wish. It may guide narrative tone but does not prove official authorization or external facts."
        },
        "confirmedTags": {
          "type": "array",
          "maxItems": 6,
          "uniqueItems": true,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 30
          }
        }
      }
    },
    "PublishingContext": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "intendedDate",
        "occasion"
      ],
      "properties": {
        "intendedDate": {
          "type": [
            "string",
            "null"
          ],
          "format": "date"
        },
        "occasion": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 60
        }
      }
    },
    "Representative": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "label",
        "sourceImageIds",
        "confirmedHighFeedback"
      ],
      "properties": {
        "label": {
          "type": "string",
          "minLength": 1,
          "maxLength": 60
        },
        "sourceImageIds": {
          "type": "array",
          "minItems": 1,
          "maxItems": 6,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/Id"
          }
        },
        "confirmedHighFeedback": {
          "const": true
        }
      }
    },
    "ProfileInspectInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "images"
      ],
      "properties": {
        "images": {
          "$ref": "#/$defs/Images",
          "minItems": 1
        }
      }
    },
    "ProfileReportInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "images",
        "mode",
        "representatives",
        "manualRepresentative"
      ],
      "properties": {
        "images": {
          "$ref": "#/$defs/Images",
          "minItems": 1
        },
        "mode": {
          "enum": [
            "representatives",
            "visual_only"
          ]
        },
        "representatives": {
          "type": "array",
          "maxItems": 3,
          "items": {
            "$ref": "#/$defs/Representative"
          }
        },
        "manualRepresentative": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 100
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "mode": {
                "const": "visual_only"
              }
            }
          },
          "then": {
            "properties": {
              "representatives": {
                "maxItems": 0
              },
              "manualRepresentative": {
                "type": "null"
              }
            }
          },
          "else": {
            "anyOf": [
              {
                "properties": {
                  "representatives": {
                    "minItems": 1
                  }
                }
              },
              {
                "properties": {
                  "manualRepresentative": {
                    "type": "string"
                  }
                }
              }
            ]
          }
        }
      ]
    },
    "PostInspectInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "images",
        "primaryImageId"
      ],
      "properties": {
        "images": {
          "$ref": "#/$defs/Images",
          "minItems": 1
        },
        "primaryImageId": {
          "$ref": "#/$defs/Id"
        }
      }
    },
    "PostGenerateInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "images",
        "primaryImageId",
        "brief",
        "publishing"
      ],
      "properties": {
        "images": {
          "$ref": "#/$defs/Images",
          "minItems": 1
        },
        "primaryImageId": {
          "$ref": "#/$defs/Id"
        },
        "brief": {
          "$ref": "#/$defs/Brief"
        },
        "publishing": {
          "$ref": "#/$defs/PublishingContext"
        }
      }
    },
    "ReferenceInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "text",
        "images"
      ],
      "properties": {
        "text": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 5000
        },
        "images": {
          "$ref": "#/$defs/Images"
        }
      },
      "anyOf": [
        {
          "properties": {
            "text": {
              "type": "string"
            }
          }
        },
        {
          "properties": {
            "images": {
              "minItems": 1
            }
          }
        }
      ]
    },
    "OwnInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "topic",
        "images",
        "primaryImageId",
        "brief",
        "publishing"
      ],
      "properties": {
        "topic": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 300
        },
        "images": {
          "$ref": "#/$defs/Images"
        },
        "primaryImageId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ]
        },
        "brief": {
          "$ref": "#/$defs/Brief"
        },
        "publishing": {
          "$ref": "#/$defs/PublishingContext"
        }
      },
      "anyOf": [
        {
          "properties": {
            "topic": {
              "type": "string"
            }
          }
        },
        {
          "properties": {
            "images": {
              "minItems": 1
            }
          }
        }
      ]
    },
    "ViralGenerateInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "reference",
        "own"
      ],
      "properties": {
        "reference": {
          "$ref": "#/$defs/ReferenceInput"
        },
        "own": {
          "$ref": "#/$defs/OwnInput"
        }
      }
    },
    "Request": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "requestId",
        "task",
        "payload"
      ],
      "properties": {
        "schemaVersion": {
          "const": "2.1.0"
        },
        "requestId": {
          "$ref": "#/$defs/Id"
        },
        "task": {
          "$ref": "#/$defs/Task"
        },
        "payload": {
          "type": "object"
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "task": {
                "const": "profile.inspect"
              }
            }
          },
          "then": {
            "properties": {
              "payload": {
                "$ref": "#/$defs/ProfileInspectInput"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "profile.report"
              }
            }
          },
          "then": {
            "properties": {
              "payload": {
                "$ref": "#/$defs/ProfileReportInput"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "post.inspect"
              }
            }
          },
          "then": {
            "properties": {
              "payload": {
                "$ref": "#/$defs/PostInspectInput"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "post.generate"
              }
            }
          },
          "then": {
            "properties": {
              "payload": {
                "$ref": "#/$defs/PostGenerateInput"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "viral.generate"
              }
            }
          },
          "then": {
            "properties": {
              "payload": {
                "$ref": "#/$defs/ViralGenerateInput"
              }
            }
          }
        }
      ]
    },
    "Evidence": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "evidenceId",
        "sourceType",
        "sourceId",
        "description",
        "quote",
        "confidence"
      ],
      "properties": {
        "evidenceId": {
          "$ref": "#/$defs/Id"
        },
        "sourceType": {
          "enum": [
            "image",
            "user_field",
            "reference_text"
          ]
        },
        "sourceId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 160
        },
        "description": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "quote": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 300
        },
        "confidence": {
          "enum": [
            "high",
            "medium",
            "low"
          ]
        }
      }
    },
    "EvidenceIds": {
      "type": "array",
      "maxItems": 8,
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/Id"
      }
    },
    "CitedText": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "text",
        "evidenceIds"
      ],
      "properties": {
        "text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "evidenceIds": {
          "$ref": "#/$defs/EvidenceIds",
          "minItems": 1
        }
      }
    },
    "ProfileInspection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "candidates",
        "evidence"
      ],
      "properties": {
        "candidates": {
          "type": "array",
          "maxItems": 3,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "candidateId",
              "label",
              "sourceImageIds",
              "feedbackSignal",
              "evidenceIds"
            ],
            "properties": {
              "candidateId": {
                "$ref": "#/$defs/Id"
              },
              "label": {
                "type": "string",
                "minLength": 1,
                "maxLength": 60
              },
              "sourceImageIds": {
                "type": "array",
                "minItems": 1,
                "maxItems": 6,
                "uniqueItems": true,
                "items": {
                  "$ref": "#/$defs/Id"
                }
              },
              "feedbackSignal": {
                "enum": [
                  "visible_relative",
                  "unknown"
                ]
              },
              "evidenceIds": {
                "$ref": "#/$defs/EvidenceIds",
                "minItems": 1
              }
            }
          }
        },
        "evidence": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "$ref": "#/$defs/Evidence"
          }
        }
      }
    },
    "Dimension": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "key",
        "status",
        "explanation",
        "evidenceIds"
      ],
      "properties": {
        "key": {
          "enum": [
            "legibility",
            "subject_clarity",
            "layout_order",
            "color_harmony"
          ]
        },
        "explanation": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "evidenceIds": {
          "$ref": "#/$defs/EvidenceIds"
        },
        "status": {
          "type": "string",
          "enum": [
            "优秀",
            "良好",
            "待优化",
            "无法判断"
          ]
        }
      }
    },
    "TopicRecommendation": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "type",
        "title",
        "rationale",
        "craftOrMaterialTip",
        "visualAdvice",
        "basisEvidenceIds"
      ],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "稳健深耕线",
            "时令节律与场景送礼线",
            "跨界联动与流行混搭线"
          ]
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50
        },
        "rationale": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "craftOrMaterialTip": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "visualAdvice": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "basisEvidenceIds": {
          "$ref": "#/$defs/EvidenceIds",
          "minItems": 1
        }
      }
    },
    "IdeaLibraryItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "ideaId",
        "sourceDraftId",
        "sourceRequestId",
        "recommendation",
        "isFavorite",
        "createdAt",
        "updatedAt"
      ],
      "properties": {
        "ideaId": {
          "$ref": "#/$defs/Id"
        },
        "sourceDraftId": {
          "$ref": "#/$defs/Id"
        },
        "sourceRequestId": {
          "$ref": "#/$defs/Id"
        },
        "recommendation": {
          "$ref": "#/$defs/TopicRecommendation"
        },
        "isFavorite": {
          "type": "boolean"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "IdeaLibrary": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "cacheVersion",
        "items"
      ],
      "properties": {
        "cacheVersion": {
          "const": "1.0.0"
        },
        "items": {
          "type": "array",
          "maxItems": 60,
          "items": {
            "$ref": "#/$defs/IdeaLibraryItem"
          }
        }
      }
    },
    "ProfileReport": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "coverage",
        "visualGrade",
        "dimensions",
        "summary",
        "styleObservation",
        "viralPatterns",
        "topicRecommendations",
        "priorityActions",
        "evidence",
        "headerAudit",
        "verticalityAudit"
      ],
      "properties": {
        "coverage": {
          "enum": [
            "visual_only",
            "representative_review"
          ]
        },
        "dimensions": {
          "type": "array",
          "minItems": 4,
          "maxItems": 4,
          "items": {
            "$ref": "#/$defs/Dimension"
          }
        },
        "summary": {
          "$ref": "#/$defs/CitedText"
        },
        "styleObservation": {
          "anyOf": [
            {
              "$ref": "#/$defs/CitedText"
            },
            {
              "type": "null"
            }
          ]
        },
        "viralPatterns": {
          "type": "array",
          "maxItems": 3,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "hypothesis",
              "representativeLabels",
              "evidenceIds"
            ],
            "properties": {
              "hypothesis": {
                "type": "string",
                "minLength": 1,
                "maxLength": 250
              },
              "representativeLabels": {
                "type": "array",
                "minItems": 1,
                "maxItems": 3,
                "items": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 100
                }
              },
              "evidenceIds": {
                "$ref": "#/$defs/EvidenceIds",
                "minItems": 1
              }
            }
          }
        },
        "priorityActions": {
          "type": "array",
          "minItems": 1,
          "maxItems": 3,
          "items": {
            "$ref": "#/$defs/CitedText"
          }
        },
        "evidence": {
          "type": "array",
          "minItems": 1,
          "maxItems": 40,
          "items": {
            "$ref": "#/$defs/Evidence"
          }
        },
        "visualGrade": {
          "type": "string",
          "enum": [
            "优秀",
            "良好",
            "待优化"
          ]
        },
        "headerAudit": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "avatar",
            "banner",
            "bioAndConversion"
          ],
          "properties": {
            "avatar": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "status",
                "feedback",
                "evidenceIds"
              ],
              "properties": {
                "status": {
                  "type": "string",
                  "enum": [
                    "优秀",
                    "良好",
                    "待优化",
                    "无法判断"
                  ]
                },
                "feedback": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 300
                },
                "evidenceIds": {
                  "$ref": "#/$defs/EvidenceIds"
                }
              }
            },
            "banner": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "status",
                "feedback",
                "evidenceIds"
              ],
              "properties": {
                "status": {
                  "type": "string",
                  "enum": [
                    "优秀",
                    "良好",
                    "待优化",
                    "无法判断"
                  ]
                },
                "feedback": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 300
                },
                "evidenceIds": {
                  "$ref": "#/$defs/EvidenceIds"
                }
              }
            },
            "bioAndConversion": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "status",
                "clarityFeedback",
                "conversionAdvice",
                "evidenceIds"
              ],
              "properties": {
                "status": {
                  "type": "string",
                  "enum": [
                    "优秀",
                    "良好",
                    "待优化",
                    "无法判断"
                  ]
                },
                "clarityFeedback": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 300
                },
                "conversionAdvice": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 300
                },
                "evidenceIds": {
                  "$ref": "#/$defs/EvidenceIds"
                }
              }
            }
          }
        },
        "verticalityAudit": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "status",
            "summary",
            "evidenceIds"
          ],
          "properties": {
            "status": {
              "type": "string",
              "enum": [
                "优秀",
                "良好",
                "待优化",
                "无法判断"
              ]
            },
            "summary": {
              "type": "string",
              "minLength": 1,
              "maxLength": 450
            },
            "evidenceIds": {
              "$ref": "#/$defs/EvidenceIds"
            }
          }
        },
        "topicRecommendations": {
          "type": "array",
          "minItems": 3,
          "maxItems": 3,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "type",
              "title",
              "rationale",
              "craftOrMaterialTip",
              "visualAdvice",
              "basisEvidenceIds"
            ],
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "稳健深耕线",
                  "时令节律与场景送礼线",
                  "跨界联动与流行混搭线"
                ]
              },
              "title": {
                "type": "string",
                "minLength": 1,
                "maxLength": 50
              },
              "rationale": {
                "type": "string",
                "minLength": 1,
                "maxLength": 300
              },
              "craftOrMaterialTip": {
                "type": "string",
                "minLength": 1,
                "maxLength": 300
              },
              "visualAdvice": {
                "type": "string",
                "minLength": 1,
                "maxLength": 300
              },
              "basisEvidenceIds": {
                "$ref": "#/$defs/EvidenceIds",
                "minItems": 1
              }
            }
          },
          "allOf": [
            {
              "contains": {
                "type": "object",
                "required": [
                  "type"
                ],
                "properties": {
                  "type": {
                    "const": "稳健深耕线"
                  }
                }
              },
              "minContains": 1,
              "maxContains": 1
            },
            {
              "contains": {
                "type": "object",
                "required": [
                  "type"
                ],
                "properties": {
                  "type": {
                    "const": "时令节律与场景送礼线"
                  }
                }
              },
              "minContains": 1,
              "maxContains": 1
            },
            {
              "contains": {
                "type": "object",
                "required": [
                  "type"
                ],
                "properties": {
                  "type": {
                    "const": "跨界联动与流行混搭线"
                  }
                }
              },
              "minContains": 1,
              "maxContains": 1
            }
          ]
        }
      }
    },
    "PostInspection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "inferredTags",
        "evidence"
      ],
      "properties": {
        "inferredTags": {
          "type": "array",
          "maxItems": 6,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "tagId",
              "category",
              "label",
              "confidence",
              "evidenceIds"
            ],
            "properties": {
              "tagId": {
                "$ref": "#/$defs/Id"
              },
              "category": {
                "enum": [
                  "work_type",
                  "technique",
                  "visual_style"
                ]
              },
              "label": {
                "type": "string",
                "minLength": 1,
                "maxLength": 30
              },
              "confidence": {
                "enum": [
                  "high",
                  "medium",
                  "low"
                ]
              },
              "evidenceIds": {
                "$ref": "#/$defs/EvidenceIds",
                "minItems": 1
              }
            }
          }
        },
        "evidence": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "$ref": "#/$defs/Evidence"
          }
        }
      }
    },
    "Cover": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "imageId",
        "ratio",
        "layout",
        "fit",
        "headline"
      ],
      "properties": {
        "imageId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ]
        },
        "ratio": {
          "const": "3:4"
        },
        "layout": {
          "enum": [
            "clean",
            "top_caption",
            "bottom_caption"
          ]
        },
        "fit": {
          "enum": [
            "contain",
            "center_crop"
          ]
        },
        "headline": {
          "type": "string",
          "maxLength": 14
        }
      }
    },
    "Paragraph": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "blockId",
        "role",
        "text",
        "evidenceIds"
      ],
      "properties": {
        "blockId": {
          "$ref": "#/$defs/Id"
        },
        "role": {
          "enum": [
            "hook",
            "description",
            "parameters",
            "pitfalls",
            "closing"
          ]
        },
        "text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 250
        },
        "evidenceIds": {
          "$ref": "#/$defs/EvidenceIds"
        }
      }
    },
    "SeasonalTag": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "label",
        "basis",
        "sourceValue"
      ],
      "properties": {
        "label": {
          "type": "string",
          "minLength": 1,
          "maxLength": 20
        },
        "basis": {
          "enum": [
            "user_occasion",
            "user_date"
          ]
        },
        "sourceValue": {
          "type": "string",
          "minLength": 1,
          "maxLength": 60
        }
      }
    },
    "Annotation": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "annotationId",
        "targetPath",
        "start",
        "end",
        "quote",
        "category",
        "message",
        "suggestion"
      ],
      "properties": {
        "annotationId": {
          "$ref": "#/$defs/Id"
        },
        "targetPath": {
          "type": "string",
          "minLength": 1,
          "maxLength": 160
        },
        "start": {
          "type": "integer",
          "minimum": 0
        },
        "end": {
          "type": "integer",
          "minimum": 1
        },
        "quote": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "category": {
          "enum": [
            "clarity",
            "unsupported_claim",
            "exaggeration",
            "similarity"
          ]
        },
        "message": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "suggestion": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 300
        }
      }
    },
    "Claim": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "targetPath",
        "text",
        "evidenceIds"
      ],
      "properties": {
        "targetPath": {
          "type": "string",
          "minLength": 1,
          "maxLength": 160
        },
        "text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "evidenceIds": {
          "$ref": "#/$defs/EvidenceIds",
          "minItems": 1
        }
      }
    },
    "Variant": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "variantId",
        "angle",
        "cover",
        "title",
        "paragraphs",
        "interactionHook",
        "hashtags",
        "seasonalTags",
        "claims",
        "annotations"
      ],
      "properties": {
        "variantId": {
          "$ref": "#/$defs/Id"
        },
        "angle": {
          "enum": [
            "pain_point",
            "emotion",
            "curiosity",
            "reference_structure"
          ]
        },
        "cover": {
          "$ref": "#/$defs/Cover"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 20
        },
        "paragraphs": {
          "type": "array",
          "minItems": 2,
          "maxItems": 5,
          "items": {
            "$ref": "#/$defs/Paragraph"
          }
        },
        "interactionHook": {
          "type": "string",
          "minLength": 1,
          "maxLength": 80
        },
        "hashtags": {
          "type": "array",
          "maxItems": 6,
          "uniqueItems": true,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 20,
            "pattern": "^[^#\\s]+$"
          }
        },
        "seasonalTags": {
          "type": "array",
          "maxItems": 2,
          "items": {
            "$ref": "#/$defs/SeasonalTag"
          }
        },
        "claims": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "$ref": "#/$defs/Claim"
          }
        },
        "annotations": {
          "type": "array",
          "maxItems": 6,
          "items": {
            "$ref": "#/$defs/Annotation"
          }
        }
      }
    },
    "PostResult": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "photoReview",
        "variants",
        "missingAngles",
        "evidence"
      ],
      "properties": {
        "photoReview": {
          "type": "array",
          "maxItems": 4,
          "items": {
            "$ref": "#/$defs/CitedText"
          }
        },
        "variants": {
          "type": "array",
          "minItems": 1,
          "maxItems": 3,
          "items": {
            "$ref": "#/$defs/Variant",
            "properties": {
              "angle": {
                "enum": [
                  "pain_point",
                  "emotion",
                  "curiosity"
                ]
              }
            }
          }
        },
        "missingAngles": {
          "type": "array",
          "maxItems": 2,
          "uniqueItems": true,
          "items": {
            "enum": [
              "pain_point",
              "emotion",
              "curiosity"
            ]
          }
        },
        "evidence": {
          "type": "array",
          "minItems": 1,
          "maxItems": 40,
          "items": {
            "$ref": "#/$defs/Evidence"
          }
        }
      }
    },
    "ReferenceBlock": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "blockId",
        "text",
        "sourceImageId"
      ],
      "properties": {
        "blockId": {
          "$ref": "#/$defs/Id"
        },
        "text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "sourceImageId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "SourceSpan": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "blockId",
        "start",
        "end",
        "quote"
      ],
      "properties": {
        "blockId": {
          "$ref": "#/$defs/Id"
        },
        "start": {
          "type": "integer",
          "minimum": 0
        },
        "end": {
          "type": "integer",
          "minimum": 1
        },
        "quote": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        }
      }
    },
    "SkeletonItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "role",
        "explanation",
        "sourceSpans",
        "ownEvidenceIds"
      ],
      "properties": {
        "role": {
          "enum": [
            "hook",
            "emotional_value",
            "progression",
            "interaction"
          ]
        },
        "explanation": {
          "type": "string",
          "minLength": 1,
          "maxLength": 250
        },
        "sourceSpans": {
          "type": "array",
          "minItems": 1,
          "maxItems": 3,
          "items": {
            "$ref": "#/$defs/SourceSpan"
          }
        },
        "ownEvidenceIds": {
          "$ref": "#/$defs/EvidenceIds"
        }
      }
    },
    "ViralResult": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "draft",
        "referenceBlocks",
        "skeleton",
        "structureCoverage",
        "originality",
        "evidence"
      ],
      "properties": {
        "draft": {
          "$ref": "#/$defs/Variant",
          "properties": {
            "angle": {
              "const": "reference_structure"
            }
          }
        },
        "referenceBlocks": {
          "type": "array",
          "minItems": 1,
          "maxItems": 20,
          "items": {
            "$ref": "#/$defs/ReferenceBlock"
          }
        },
        "skeleton": {
          "type": "array",
          "minItems": 1,
          "maxItems": 4,
          "items": {
            "$ref": "#/$defs/SkeletonItem"
          }
        },
        "structureCoverage": {
          "enum": [
            "complete",
            "partial"
          ]
        },
        "originality": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "scope",
            "rewritten",
            "longestSharedRun",
            "note"
          ],
          "properties": {
            "scope": {
              "const": "provided_reference_only"
            },
            "rewritten": {
              "type": "boolean"
            },
            "longestSharedRun": {
              "type": "integer",
              "minimum": 0
            },
            "note": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            }
          }
        },
        "evidence": {
          "type": "array",
          "minItems": 1,
          "maxItems": 40,
          "items": {
            "$ref": "#/$defs/Evidence"
          }
        }
      }
    },
    "Warning": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "code",
        "message",
        "fieldPath"
      ],
      "properties": {
        "code": {
          "enum": [
            "LOW_IMAGE_QUALITY",
            "INSUFFICIENT_EVIDENCE",
            "UNCONFIRMED_FACT_OMITTED",
            "PARTIAL_RESULT",
            "SIMILARITY_REWRITTEN",
            "REFERENCE_PARTIAL"
          ]
        },
        "message": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "fieldPath": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 160
        }
      }
    },
    "Error": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "code",
        "message",
        "retryable",
        "fieldPath"
      ],
      "properties": {
        "code": {
          "enum": [
            "INVALID_INPUT",
            "UNSUPPORTED_IMAGE",
            "PAYLOAD_TOO_LARGE",
            "IMAGE_UNREADABLE",
            "INSUFFICIENT_REFERENCE",
            "RATE_LIMITED",
            "UPSTREAM_UNAVAILABLE",
            "TIMEOUT",
            "NETWORK_INTERRUPTED",
            "OUTPUT_INVALID",
            "CONTENT_UNSUPPORTED",
            "SIMILARITY_UNRESOLVED"
          ]
        },
        "message": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "retryable": {
          "type": "boolean"
        },
        "fieldPath": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 160
        }
      }
    },
    "Meta": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "promptVersion",
        "modelId",
        "runType",
        "durationMs",
        "retryCount"
      ],
      "properties": {
        "schemaVersion": {
          "const": "2.1.0"
        },
        "promptVersion": {
          "type": "string",
          "minLength": 1,
          "maxLength": 60
        },
        "modelId": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1,
          "maxLength": 100
        },
        "runType": {
          "enum": [
            "public_demo",
            "offline_evaluation",
            "demo_fixture"
          ]
        },
        "durationMs": {
          "type": "integer",
          "minimum": 0
        },
        "retryCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1
        }
      }
    },
    "Response": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "requestId",
        "task",
        "status",
        "data",
        "warnings",
        "error",
        "meta"
      ],
      "properties": {
        "requestId": {
          "$ref": "#/$defs/Id"
        },
        "task": {
          "$ref": "#/$defs/Task"
        },
        "status": {
          "enum": [
            "success",
            "partial",
            "error"
          ]
        },
        "data": {
          "type": [
            "object",
            "null"
          ]
        },
        "warnings": {
          "type": "array",
          "maxItems": 12,
          "items": {
            "$ref": "#/$defs/Warning"
          }
        },
        "error": {
          "anyOf": [
            {
              "$ref": "#/$defs/Error"
            },
            {
              "type": "null"
            }
          ]
        },
        "meta": {
          "$ref": "#/$defs/Meta"
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "status": {
                "const": "error"
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "type": "null"
              },
              "error": {
                "$ref": "#/$defs/Error"
              }
            }
          },
          "else": {
            "properties": {
              "data": {
                "type": "object"
              },
              "error": {
                "type": "null"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "profile.inspect"
              },
              "status": {
                "enum": [
                  "success",
                  "partial"
                ]
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "$ref": "#/$defs/ProfileInspection"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "profile.report"
              },
              "status": {
                "enum": [
                  "success",
                  "partial"
                ]
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "$ref": "#/$defs/ProfileReport"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "post.inspect"
              },
              "status": {
                "enum": [
                  "success",
                  "partial"
                ]
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "$ref": "#/$defs/PostInspection"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "post.generate"
              },
              "status": {
                "enum": [
                  "success",
                  "partial"
                ]
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "$ref": "#/$defs/PostResult"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "viral.generate"
              },
              "status": {
                "enum": [
                  "success",
                  "partial"
                ]
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "$ref": "#/$defs/ViralResult"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "post.generate"
              },
              "status": {
                "const": "success"
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "properties": {
                  "variants": {
                    "minItems": 3,
                    "maxItems": 3,
                    "allOf": [
                      {
                        "contains": {
                          "properties": {
                            "angle": {
                              "const": "pain_point"
                            }
                          }
                        },
                        "minContains": 1,
                        "maxContains": 1
                      },
                      {
                        "contains": {
                          "properties": {
                            "angle": {
                              "const": "emotion"
                            }
                          }
                        },
                        "minContains": 1,
                        "maxContains": 1
                      },
                      {
                        "contains": {
                          "properties": {
                            "angle": {
                              "const": "curiosity"
                            }
                          }
                        },
                        "minContains": 1,
                        "maxContains": 1
                      }
                    ]
                  },
                  "missingAngles": {
                    "maxItems": 0
                  }
                }
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "task": {
                "const": "post.generate"
              },
              "status": {
                "const": "partial"
              }
            }
          },
          "then": {
            "properties": {
              "data": {
                "properties": {
                  "variants": {
                    "maxItems": 2
                  },
                  "missingAngles": {
                    "minItems": 1
                  }
                }
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "status": {
                "const": "partial"
              }
            }
          },
          "then": {
            "properties": {
              "warnings": {
                "minItems": 1
              }
            }
          }
        }
      ]
    },
    "ImageManifest": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "imageId",
        "role",
        "name",
        "mimeType",
        "width",
        "height",
        "originalByteLength",
        "fingerprint",
        "restoreState"
      ],
      "properties": {
        "imageId": {
          "$ref": "#/$defs/Id"
        },
        "role": {
          "enum": [
            "profile",
            "own",
            "reference"
          ]
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "mimeType": {
          "enum": [
            "image/jpeg",
            "image/png",
            "image/webp"
          ]
        },
        "width": {
          "type": "integer",
          "minimum": 16
        },
        "height": {
          "type": "integer",
          "minimum": 16
        },
        "originalByteLength": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10485760
        },
        "fingerprint": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "restoreState": {
          "const": "requires_reupload"
        }
      }
    },
    "EditedDraft": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "sourceVariantId",
        "cover",
        "title",
        "bodyText",
        "hashtags"
      ],
      "properties": {
        "sourceVariantId": {
          "$ref": "#/$defs/Id"
        },
        "cover": {
          "$ref": "#/$defs/Cover"
        },
        "title": {
          "type": "string",
          "maxLength": 200
        },
        "bodyText": {
          "type": "string",
          "maxLength": 5000
        },
        "hashtags": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 40
          }
        }
      }
    },
    "Snapshot": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "images",
        "primaryImageId",
        "brief",
        "publishing",
        "topic",
        "referenceText",
        "profileMode",
        "representatives",
        "manualRepresentative",
        "inspection",
        "result",
        "selectedVariantId",
        "editedDraft"
      ],
      "properties": {
        "images": {
          "type": "array",
          "maxItems": 6,
          "items": {
            "$ref": "#/$defs/ImageManifest"
          }
        },
        "primaryImageId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ]
        },
        "sourceIdeaId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ],
          "description": "Optional local idea-library source for a post draft. It is never sent as a model fact by itself."
        },
        "brief": {
          "anyOf": [
            {
              "$ref": "#/$defs/Brief"
            },
            {
              "type": "null"
            }
          ]
        },
        "publishing": {
          "anyOf": [
            {
              "$ref": "#/$defs/PublishingContext"
            },
            {
              "type": "null"
            }
          ]
        },
        "topic": {
          "type": [
            "string",
            "null"
          ],
          "maxLength": 300
        },
        "referenceText": {
          "type": [
            "string",
            "null"
          ],
          "maxLength": 5000
        },
        "profileMode": {
          "enum": [
            "representatives",
            "visual_only",
            null
          ]
        },
        "representatives": {
          "type": "array",
          "maxItems": 3,
          "items": {
            "$ref": "#/$defs/Representative"
          }
        },
        "manualRepresentative": {
          "type": [
            "string",
            "null"
          ],
          "maxLength": 100
        },
        "inspection": {
          "anyOf": [
            {
              "$ref": "#/$defs/Response"
            },
            {
              "type": "null"
            }
          ]
        },
        "result": {
          "anyOf": [
            {
              "$ref": "#/$defs/Response"
            },
            {
              "type": "null"
            }
          ]
        },
        "selectedVariantId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ]
        },
        "editedDraft": {
          "anyOf": [
            {
              "$ref": "#/$defs/EditedDraft"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "ProfileInspectRequest": {
      "allOf": [
        {
          "$ref": "#/$defs/Request"
        },
        {
          "properties": {
            "task": {
              "const": "profile.inspect"
            }
          }
        }
      ]
    },
    "ProfileInspectResponse": {
      "allOf": [
        {
          "$ref": "#/$defs/Response"
        },
        {
          "properties": {
            "task": {
              "const": "profile.inspect"
            }
          }
        }
      ]
    },
    "ProfileReportRequest": {
      "allOf": [
        {
          "$ref": "#/$defs/Request"
        },
        {
          "properties": {
            "task": {
              "const": "profile.report"
            }
          }
        }
      ]
    },
    "ProfileReportResponse": {
      "allOf": [
        {
          "$ref": "#/$defs/Response"
        },
        {
          "properties": {
            "task": {
              "const": "profile.report"
            }
          }
        }
      ]
    },
    "PostInspectRequest": {
      "allOf": [
        {
          "$ref": "#/$defs/Request"
        },
        {
          "properties": {
            "task": {
              "const": "post.inspect"
            }
          }
        }
      ]
    },
    "PostInspectResponse": {
      "allOf": [
        {
          "$ref": "#/$defs/Response"
        },
        {
          "properties": {
            "task": {
              "const": "post.inspect"
            }
          }
        }
      ]
    },
    "PostGenerateRequest": {
      "allOf": [
        {
          "$ref": "#/$defs/Request"
        },
        {
          "properties": {
            "task": {
              "const": "post.generate"
            }
          }
        }
      ]
    },
    "PostGenerateResponse": {
      "allOf": [
        {
          "$ref": "#/$defs/Response"
        },
        {
          "properties": {
            "task": {
              "const": "post.generate"
            }
          }
        }
      ]
    },
    "ViralGenerateRequest": {
      "allOf": [
        {
          "$ref": "#/$defs/Request"
        },
        {
          "properties": {
            "task": {
              "const": "viral.generate"
            }
          }
        }
      ]
    },
    "ViralGenerateResponse": {
      "allOf": [
        {
          "$ref": "#/$defs/Response"
        },
        {
          "properties": {
            "task": {
              "const": "viral.generate"
            }
          }
        }
      ]
    },
    "CacheIndex": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "cacheVersion",
        "drafts"
      ],
      "properties": {
        "cacheVersion": {
          "const": "1.0.0"
        },
        "drafts": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "draftId",
              "kind",
              "title",
              "updatedAt",
              "stage"
            ],
            "properties": {
              "draftId": {
                "$ref": "#/$defs/Id"
              },
              "kind": {
                "enum": [
                  "profile",
                  "post",
                  "viral"
                ]
              },
              "title": {
                "type": "string",
                "minLength": 1,
                "maxLength": 60
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time"
              },
              "stage": {
                "enum": [
                  "input",
                  "recognizing",
                  "confirming",
                  "generating",
                  "result",
                  "preview",
                  "interrupted"
                ]
              }
            }
          }
        }
      }
    },
    "LocalEvent": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "eventId",
        "runId",
        "task",
        "variantId",
        "event",
        "runType",
        "createdAt",
        "elapsedMs",
        "errorCode"
      ],
      "properties": {
        "eventId": {
          "$ref": "#/$defs/Id"
        },
        "runId": {
          "$ref": "#/$defs/Id"
        },
        "task": {
          "enum": [
            "profile.report",
            "post.generate",
            "viral.generate"
          ]
        },
        "variantId": {
          "anyOf": [
            {
              "$ref": "#/$defs/Id"
            },
            {
              "type": "null"
            }
          ]
        },
        "event": {
          "enum": [
            "generation_submitted",
            "generation_failed",
            "result_available",
            "result_viewed",
            "variant_selected",
            "preview_opened",
            "manual_edit",
            "copy_success",
            "cover_export_success"
          ]
        },
        "runType": {
          "enum": [
            "public_demo",
            "offline_evaluation",
            "demo_fixture"
          ]
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "elapsedMs": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0
        },
        "errorCode": {
          "anyOf": [
            {
              "$ref": "#/$defs/Error/properties/code"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "LocalDraft": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "cacheVersion",
        "draftId",
        "kind",
        "title",
        "createdAt",
        "updatedAt",
        "stage",
        "snapshot"
      ],
      "properties": {
        "cacheVersion": {
          "const": "1.0.0"
        },
        "draftId": {
          "$ref": "#/$defs/Id"
        },
        "kind": {
          "enum": [
            "profile",
            "post",
            "viral"
          ]
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 60
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "stage": {
          "enum": [
            "input",
            "recognizing",
            "confirming",
            "generating",
            "result",
            "preview",
            "interrupted"
          ]
        },
        "snapshot": {
          "$ref": "#/$defs/Snapshot"
        }
      }
    }
  }
}
```
