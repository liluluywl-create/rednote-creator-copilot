# 主页多图本地走查

## 协议 2.1.0：选题灵感三维升级

移动端 IA 调整为“文案助手／选题灵感／主页体检”三栏，但当前仍只有 `profile.*` 与 `post.*` 两条模型调用链。主页报告输出的三张 topicRecommendations 卡片自动沉淀至本地灵感库；不新增独立选题模型接口。协议 2.1.0 将选题类型更新为稳健深耕线、时令节律与场景送礼线、跨界联动与流行混搭线，并强制增加 craftOrMaterialTip。旧 2.0.0 报告不自动迁移；结构未变的 2.0.0 profile.inspect 结果可在内存升级元信息后复用。

本轮只执行 Schema、业务规则、Prompt 规则和本地缓存结构回归，未重新调用模型；不得把 2.0.0 的历史真实报告冒充为 2.1.0 选题输出已通过端到端评测。

## 历史记录：Prompt 2.0.1 边界收敛

协议仍为2.0.0；Prompt更新为2.0.1。忽略作者端控件，只按可确认的访客视角评估转化；容量与具体功能使用实测/展示的探索语气，不预设参数或效果。本轮仅做离线代码回归与规则存在性测试，未重新调用模型，不能声称新边界已通过真实输出评测。历史2.0.0报告保留为原始样本，不覆盖。

## 历史记录：方案 B（协议与 Prompt 2.0.0）

本轮补充一种受限语法修复：完整响应只有 data 在顶层 warnings 前漏闭合时，仅在根字段结构明确、两侧均可解析且没有缺失字段时插入一个右括号，再完整校验。禁止一般性补尾括号或补内容。可用 --replay test-results/记录.raw.txt 对已保存回复离线回放；比对原图片指纹、任务与协议，audit 标记 saved_response_replay，不新增模型调用，不计入模型原始格式合格率/生成成功率或推理延迟。历史失败记录不覆盖。

移除 healthScore 与 dimension.score，改为 visualGrade 与 status。增加头像、背景、昵称简介转化及垂直度；三层选题强制各一项。新增字段仍有内部 evidenceIds，不展示在 report.md 正文；无法判断项返回 partial 与警告，不强判缺点。报告同时保存 JSON 与 Markdown。请求/响应协议版本升级2.0.0，Cache 自身格式版本不变；旧报告保留历史，不按新字段加载。旧 profile.inspect 候选结构未变，只对已知版本在内存适配元信息，随后完整校验并比对图片指纹，复用已有确认，不改写历史文件。Prompt文件名保留兼容，内容与运行元数据已标为2.0.0。下文历史执行记录不代表新版评测通过。

## 2026-09-15 JSON 修复补充

报告 Prompt 增加闭合层级自检。解析失败后，先清理 BOM/外围围栏，再用识别字符串转义的括号扫描处理最多三个末尾多余右花括号，或 error 字段前提前闭合的根对象（已存在 error 时拒绝）。不截取说明文字、不补字段、不补缺失括号；修复后仍须通过完整 Schema 与业务校验。原始回复始终保留，实际修复时另存 repaired.json，并在 audit 中记录 repairApplied、repairOffset、cleaning 和 firstParsePassed；修复通过不计为原始格式合格。此规则取代下文旧的“只清理外围格式”限制。

仅为本地离线评测运行器，不是网页、PWA、线上接口或已上线功能。用户于2026-09-15确认沿用 protocol.schema.json，首轮使用火山方舟 doubao-seed-evolving；本脚本不替换其他模块。

## 安全与输入

- 配置只从根目录 `.env.local` 读取。密钥不进入 Prompt、URL、输出文件或 Git；只发往固定的北京地域方舟推理地址。
- 默认两张输入：`test_profile_1.png`、`test_profile_2.png`；文件名也可作为命令行位置参数。Mac 文件系统可能显示大写 `.PNG`，同名输入可正常读取。
- 一次请求中，user.content 包含多条 `{type: "image_url", image_url: {url: "data:...;base64,..."}}`，不是在接口顶层发一个 image_url 数组。
- 图片按 PRD 3.4 校验并只在内存生成传输副本，原图不改、不生成新内容、不切片。单图≤1 MiB，总计≤2 MiB，实际模型请求≤3 MiB。截图优先保留全尺寸，压缩无法达标则报错。
- 原始输出、最终 Response、图片指纹和走查记录写入已忽略的 `test-results/`，仅供本地人工评审，不是 localStorage 或生产日志。不会保存 Base64、密钥、完整请求、Prompt或隐藏推理。不要公开上传这些真实样例结果。

## 执行

首次安装依赖：`npm ci --ignore-scripts --no-audit --no-fund`。

离线检查：`npm run check`、`npm test`。

仅预检真实图片，不调用模型：`node test_profile_diagnosis.js --dry-run`。

调用一次识别（会发送图片并可能计费）：`node test_profile_diagnosis.js`。

2026-09-15 用户授权的第二次本地走查：`node test_profile_diagnosis.js --local-eval-90s --max-edge 1200`。仅此显式参数将等待上限放宽至90秒，并把传输副本最长边等比限制为1200px（不放大、不裁切、转JPEG）；原图不改。预检可再加 `--dry-run`。不带参数仍保留原预算和全尺寸策略。报告阶段复用该次识别时，也必须带 `--max-edge 1200`，以保持传输副本及指纹一致。

程序打印完整校验后的 Response，并停止在候选确认阶段。将打印的结果文件路径作为下阶段 --inspection 参数；只能选择其中实际存在的 candidateId：

`node test_profile_diagnosis.js --phase report --inspection test-results/实际记录.response.json --confirm 实际候选ID1,实际候选ID2`

“确认”表示用户认为这些笔记反馈较好，不是程序自动勾选。不要把示例ID原样运行。原图指纹与识别时不一致则拒绝复用确认。支持明确选择 `--phase report --visual-only`，或 `--phase report --manual "用户确认的一篇代表作品名称"`；不会自动使用这些降级路径。

## Prompt与协议

完整 System Message = `prompts/profile_system_v1.0.md` + 当前task + 从协议提取的模型责任 Schema（含全部必要 $defs）。正式报告使用 visualGrade、dimensions、headerAudit、verticalityAudit、styleObservation、viralPatterns、topicRecommendations 等2.1.0字段；选题卡必须包含 type、title、rationale、craftOrMaterialTip、visualAdvice、basisEvidenceIds。

模型只生成 status/data/warnings/error；程序填写 requestId/task/meta。新版不计算或输出视觉数值评分。先校验模型责任部分，再校验完整 ProfileInspectResponse / ProfileReportResponse，再校验引用、唯一ID、确认范围和状态规则。所有类型、必填项、长度和 additionalProperties 均执行，不删字段、不补默认值、不改协议迁就模型。

只做 BOM/外围代码围栏清理，并明确记录首次纯JSON解析失败；不会截取大括号、补尾括号、修补字段或把无效内容包装为通过。保留 raw.txt 和 audit.json，失败返回非零退出码。

没有模型终态响应时，JSON解析和模型字段校验记为未执行（null），不是失败率样本。脚本可另行打印经过协议检查的本地error结果，明确标记其不是模型回复；这种错误封装合格不代表生成成功。未经校验的解析内容仅供本地排错，不会作为有效候选。

供应商端本轮仅使用明确 JSON Prompt 约束，不假称已经验证该模型的原生 json_schema 能力，也不发送未经核实的 response_format。应用侧校验是强制边界，但不保证模型永远输出合格，更不证明事实无误。

## 预算与尚未验证项

保持 PRD 原预算：inspect 8秒/1500 tokens；report 90秒/6000 tokens。当前走查不自动重试（0次，未超过协议上限）。超时明确报告，不偷偷延长预算；不推断上游请求未计费。未来正式生成的自动修复可在共享最多一次预算内另行实现。

输出固定标记 offline_evaluation；模型、Prompt哈希、Schema哈希、延迟与清理行为记录于audit。观察到一次成功不等于满足总体成功率、8秒性能目标或真实用户采纳率。事实与图片文字匹配、虚构数字、风格偏差及可执行性须人工评审。

显式90秒本地测试会记录 localTimeoutOverride、productBudgetMs、maxImageEdge 与 withinProductWaitBudget；超出8秒取得的识别结果不得计作符合产品8秒预算。缩小后的截图文字是否仍可辨认需要人工查看，不能只以体积下降判为质量合格。控制台先打印未经清理的模型原文，再打印解析、Schema、引用校验结果和完整Response。

官方参考：
- [方舟官方调用示例](https://www.volcengine.com/docs/82379/1795150)
- [方舟 Chat API](https://www.volcengine.com/docs/82379/1494384)
- [Ajv Draft 2020-12](https://ajv.js.org/json-schema.html#draft-2020-12)
- [sharp 输出选项](https://sharp.pixelplumbing.com/api-output/)

本脚本未实现前端缓存、页面交互、三大模块全面评测或生产服务限流；不将这些能力标为完成。
