# 成品图文生成本地走查

本脚本读取根目录 `test_product_1.jpeg`、`test_product_2.jpeg`、`test_product_3.jpeg`；用户最初写作 `.jpg`，Finder 中实际文件为 `.jpeg`，不复制或改动原图。三张4032×3024手机照片允许在20MP安全上限内解码，但原图不能直接发送；只在内存中等比缩放至最长边1200px并转JPEG，传输副本继续遵守单图≤12MP、任务合计≤24MP。真实图片、Base64、原始回复和报告均由 `.gitignore` 留在本地。

固定模拟输入为：作品名“动森同款铃钱包”、核心品类“毛线钩织包”、约2小时、新手友好、5股牛奶棉，以及可选的 `inspirationOrWishes`。发布时间与场景为空，因此不得生成时令标签。第一轮直接评测 `post.generate`，跳过可选且不阻断的 `post.inspect`，不把图片推测标签写入用户确认事实。

运行：`npm run post:generate`。一次请求生成 pain_point（指尖秩序与材质心流）、curiosity（微缩日常与空间切片）、emotion（文化隐喻与心意寄托）三套。可发布正文必须使用博主第一人称，自然表达线材、耗时与难度，并禁止第三方审查话术、机械参数申报和法务式免责声明。等待上限90秒、不自动重试。结果保存在已忽略的 `test-results/post_*.raw.txt/.response.json/.report.md/.audit.json`。

可用 `node test_post_generation.js --replay test-results/记录.raw.txt` 对同一 Prompt、Schema、图片指纹的历史回复离线重放校验；不再次调用模型，audit 明确标记 saved_response_replay，回放耗时不冒充推理耗时。

校验顺序：图片解码与压缩→PostGenerateRequest→模型责任Schema→完整PostGenerateResponse→证据、claims、段落角色、三角度差异、第一人称、自然参数表达、禁用第三方／法务话术、标题符号、问句互动、4～6个话题、空时令、800字预算、批注UTF-16定位。格式通过不代表内容值得发布，仍需人工评审事实准确性、自然度和三套差异。
