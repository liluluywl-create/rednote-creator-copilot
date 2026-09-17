import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv, parseArgs } from 'node:util';
import { randomUUID, createHash } from 'node:crypto';
import {
  SCHEMA_VERSION, LIMITS, TestError, validateConfig, createContract, modelSchema,
  parseModelJson, prepareImages, makeProviderBody, callProvider,
} from './test_profile_diagnosis.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TASK = 'post.generate';
const PROMPT_VERSION = 'post_generate_v1.2.0';
const IMAGE_NAMES = ['test_product_1.jpeg', 'test_product_2.jpeg', 'test_product_3.jpeg'];
const ANGLES = ['pain_point', 'emotion', 'curiosity'];
const sha = value => createHash('sha256').update(value).digest('hex');
const fail = (message, code = 'OUTPUT_INVALID') => { throw new TestError(message, code); };

export const TEST_BRIEF = Object.freeze({
  workName: '动森同款铃钱包', material: '5股牛奶棉', durationMinutes: 120,
  difficulty: 'beginner', sellingPoint: '毛线钩织包', pitfalls: null,
  styleRequest: '三套明显不同：微缩日常与空间切片、指尖秩序与材质心流、文化隐喻与心意寄托',
  inspirationOrWishes: '动森同款铃钱包，希望能融入海岛慢生活、摇树掉金币、早日还清房贷的暴富与治愈祝愿',
  confirmedTags: ['毛线钩织包'],
});

function pointer(value, pathValue) {
  if (!pathValue.startsWith('/')) return undefined;
  return pathValue.slice(1).split('/').reduce((node, token) => {
    const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
    return node && typeof node === 'object' && Object.hasOwn(node, key) ? node[key] : undefined;
  }, value);
}

function grams(text) {
  const normalized = text.replace(/[\s\p{P}\p{S}]/gu, '');
  return new Set([...normalized].map((_, i) => normalized.slice(i, i + 2)).filter(x => x.length === 2));
}
function similarity(a, b) {
  const aa = grams(a), bb = grams(b), union = new Set([...aa, ...bb]);
  return union.size ? [...aa].filter(x => bb.has(x)).length / union.size : 0;
}

export function checkPostBusiness(response, request) {
  if (response.requestId !== request.requestId || response.task !== TASK) fail('请求与响应标识不一致。');
  if (response.status === 'error') return;
  const data = response.data, imageIds = new Set(request.payload.images.map(x => x.imageId));
  const evidence = new Map();
  for (const e of data.evidence) {
    if (evidence.has(e.evidenceId)) fail('evidenceId 重复。');
    evidence.set(e.evidenceId, e);
    if (e.sourceType === 'image') {
      if (!imageIds.has(e.sourceId)) fail('图片证据引用不存在的 imageId。');
    } else if (e.sourceType === 'user_field') {
      const value = pointer(request, e.sourceId);
      if (value === undefined || value === null || value === '' || typeof value === 'object') fail('用户字段证据为空或不是可引用叶子字段。');
    } else fail('成品生成不允许 reference_text 证据。');
  }
  const assertIds = ids => {
    if (ids.some(id => !evidence.has(id))) fail('存在悬空 evidenceId。');
  };
  for (const item of data.photoReview) assertIds(item.evidenceIds);
  const variantIds = new Set(), blockIds = new Set();
  for (const [index, v] of data.variants.entries()) {
    if (variantIds.has(v.variantId)) fail('variantId 重复。'); variantIds.add(v.variantId);
    if (!imageIds.has(v.cover.imageId)) fail('封面未引用本次用户图片。');
    if (!/[｜！？，。\p{Extended_Pictographic}]/u.test(v.title)) fail('标题缺少自然吸睛符号或 Emoji。');
    if (v.hashtags.length < 4) fail('每套至少需要4个垂类话题。');
    if (!v.interactionHook.endsWith('？')) fail('互动钩子必须是以问号结尾的具体问题。');
    const roles = v.paragraphs.map(p => p.role);
    for (const role of ['hook', 'description', 'parameters', 'closing']) if (!roles.includes(role)) fail(`方案缺少 ${role} 段。`);
    if (roles.indexOf('hook') !== 0 || roles.indexOf('parameters') < roles.indexOf('description') || roles.indexOf('closing') !== roles.length - 1) fail('段落角色顺序不符合约定。');
    if (roles.includes('pitfalls') && request.payload.brief.pitfalls === null) fail('用户未提供避坑经历，不能生成 pitfalls 段。');
    const body = v.paragraphs.map(p => p.text).join('\n') + '\n' + v.interactionHook;
    if (body.length > 800) fail('单套正文与互动结尾超过800字。');
    if (!/(?:我|我的|我这次|这次我|我用|我钩|我做)/.test(body)) fail('可发布文案必须使用第一人称博主视角。');
    if (/照片里能看到|截图中|只能算作材质联想|这些都是用户给出的祝愿|用户给出的灵感|用户提供|创作者标注/.test(body)) fail('正文出现系统审查或第三方旁白。');
    if (/品类是|参考制作时间|参考用时|用户确认|属于新手友好/.test(body)) fail('参数表达过于机械，需改为自然叙述或手作清单。');
    if (/不是官方|并非官方|非官方|官方授权|联名款|法务|免责声明/.test(body)) fail('可发布正文不应出现公文式授权免责声明。');
    const parameterText = v.paragraphs.find(p => p.role === 'parameters').text;
    for (const fact of ['动森同款铃钱包', '毛线钩织包', '2小时', '新手友好', '5股牛奶棉']) if (!parameterText.includes(fact)) fail(`参数段缺少用户事实：${fact}`);
    for (const p of v.paragraphs) { if (blockIds.has(p.blockId)) fail('blockId 必须在响应中唯一。'); blockIds.add(p.blockId); assertIds(p.evidenceIds); }
    const angleText = `${v.title}${body}`;
    if (v.angle === 'pain_point' && !/指尖|编织|牛奶棉|起针|针脚|心流|成型/.test(angleText)) fail('pain_point 未体现指尖秩序与材质心流定位。');
    if (v.angle === 'emotion' && !/动森|海岛|摇树|金币|房贷|暴富|治愈|祝愿|心意/.test(angleText)) fail('emotion 未体现文化隐喻与心意寄托定位。');
    if (v.angle === 'curiosity' && !/掌心|耳机|小物|收纳|日常|桌面|空间/.test(angleText)) fail('curiosity 未体现微缩日常与空间切片定位。');
    for (const tag of v.seasonalTags) if (!request.payload.publishing.intendedDate && !request.payload.publishing.occasion) fail(`无发布背景却生成时令标签：${tag.label}`);
    for (const claim of v.claims) {
      assertIds(claim.evidenceIds);
      const target = pointer({ data }, claim.targetPath);
      if (typeof target !== 'string' || !target.includes(claim.text)) fail('claim 未准确定位到目标文字。');
    }
    for (const a of v.annotations) {
      const target = pointer({ data }, a.targetPath);
      if (typeof target !== 'string' || a.start >= a.end || target.slice(a.start, a.end) !== a.quote) fail('annotation UTF-16 区间或 quote 不匹配。');
    }
    const ledger = v.claims.map(c => c.text).join('|');
    for (const fact of ['动森同款铃钱包', '毛线钩织包', '2小时', '新手友好', '5股牛奶棉']) if (!ledger.includes(fact)) fail(`claims 未登记用户事实：${fact}`);
    const claimText = body + v.title;
    const withoutRightsDenials = claimText
      .replace(/(?:不是|并非|非|无|不属于)(?:任何)?官方授权(?:或|、)?联名款?/g, '')
      .replace(/(?:不是|并非|非|无|不属于)(?:任何)?(?:官方|正版|联名款?|授权款?)/g, '');
    if (/(?:官方(?:授权)?|正版|联名款?|原版复刻)|容量大|绝对防丢|百分百/.test(withoutRightsDenials)) fail('存在未经支持的授权、容量或效果断言。');
    if (v.angle === 'emotion' && request.payload.brief.inspirationOrWishes) {
      const inspirationEvidenceIds = new Set(data.evidence.filter(e => e.sourceType === 'user_field' && e.sourceId === '/payload/brief/inspirationOrWishes').map(e => e.evidenceId));
      if (!inspirationEvidenceIds.size) fail('文化寄托方案缺少 inspirationOrWishes 用户证据。');
      const usedInParagraph = v.paragraphs.some(p => p.evidenceIds.some(id => inspirationEvidenceIds.has(id)));
      const usedInClaim = v.claims.some(c => c.evidenceIds.some(id => inspirationEvidenceIds.has(id)));
      if (!usedInParagraph || !usedInClaim) fail('文化寄托方案未把 inspirationOrWishes 连接到正文与 claims。');
      const symbols = ['动森', '海岛', '摇树', '金币', '房贷', '暴富', '治愈'];
      if (symbols.filter(term => angleText.includes(term)).length < 2) fail('文化寄托方案对用户灵感的转化不足。');
    }
    if (index > 0) {
      for (const prior of data.variants.slice(0, index)) if (similarity(v.title + v.paragraphs[0].text, prior.title + prior.paragraphs[0].text) >= 0.65) fail('方案标题与开篇过于相似。');
    }
  }
  const actual = new Set(data.variants.map(v => v.angle));
  if (response.status === 'success') {
    if (actual.size !== 3 || ANGLES.some(x => !actual.has(x)) || data.missingAngles.length) fail('success 必须包含三个不同角度且无缺项。');
  } else {
    const missing = ANGLES.filter(x => !actual.has(x));
    if (JSON.stringify([...data.missingAngles].sort()) !== JSON.stringify(missing.sort())) fail('partial 的 missingAngles 不准确。');
  }
}

export function renderPostMarkdown(response) {
  const names = { pain_point: '指尖秩序与材质心流', curiosity: '微缩日常与空间切片', emotion: '文化隐喻与心意寄托' };
  const lines = ['# 动森同款铃钱包｜三套文案方案'];
  if (response.data.photoReview.length) {
    lines.push('', '## 照片建议');
    for (const item of response.data.photoReview) lines.push('', `- ${item.text}`);
  }
  for (const angle of ANGLES) {
    const v = response.data.variants.find(x => x.angle === angle); if (!v) continue;
    lines.push('', `## ${names[angle]}`, '', `封面：${v.cover.headline}（${v.cover.layout} / ${v.cover.fit} / ${v.cover.imageId}）`, '', `标题：${v.title}`);
    for (const p of v.paragraphs) lines.push('', p.text);
    lines.push('', v.interactionHook, '', v.hashtags.map(x => `#${x}`).join(' '));
  }
  if (response.warnings.length) lines.push('', '## 本次局限', ...response.warnings.flatMap(w => ['', `- ${w.message}`]));
  return lines.join('\n') + '\n';
}

async function main() {
  const {values}=parseArgs({options:{replay:{type:'string'}}});
  const contract = await createContract();
  const config = validateConfig(parseEnv(await fs.readFile(path.join(ROOT, '.env.local'), 'utf8')));
  const prepared = await prepareImages(IMAGE_NAMES, ROOT, 1200);
  const requestId = `post_${randomUUID()}`;
  const request = { schemaVersion: SCHEMA_VERSION, requestId, task: TASK, payload: {
    images: prepared.images, primaryImageId: 'image_2', brief: structuredClone(TEST_BRIEF),
    publishing: { intendedDate: null, occasion: null },
  } };
  contract.check('PostGenerateRequest', request);
  const prompt = await fs.readFile(path.join(ROOT, 'prompts/post_generate_system_v1.0.md'), 'utf8');
  const system = `${prompt}\n\n完整模型输出 JSON Schema（从项目协议提取）：\n${JSON.stringify(modelSchema(contract.protocol, TASK))}`;
  const body = makeProviderBody(request, system, config.model);
  const directory = path.join(ROOT, 'test-results'); await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const prefix = path.join(directory, requestId); const save = (suffix, text) => fs.writeFile(`${prefix}.${suffix}`, text, { mode: 0o600, flag: 'wx' });
  await save('manifest.json', JSON.stringify(prepared.manifest, null, 2));
  console.log('输入协议与三张图片校验：通过');
  console.log(JSON.stringify({task:TASK,model:config.model,primaryImageId:'image_2',brief:TEST_BRIEF,images:prepared.manifest.map(({originalSha256:_a,transmittedSha256:_b,...x})=>x)},null,2));
  const started = performance.now(); const audit = {task:TASK,runType:'offline_evaluation',schemaSha256:contract.hash,promptSha256:sha(system),timeoutMs:90_000,retryCount:0,firstParsePassed:null,modelSchemaPassed:null,responseSchemaPassed:null,businessChecksPassed:null,factualReview:'pending_human_review',executionMode:values.replay?'saved_response_replay':'live_call',networkCallMade:!values.replay};
  let parsedValue;
  try {
    let received;
    if(values.replay){
      const source=path.resolve(ROOT,values.replay);
      if(!source.startsWith(directory+path.sep)||!source.endsWith('.raw.txt')) fail('回放仅允许 test-results 内的原始回复。');
      const manifest=JSON.parse(await fs.readFile(source.replace(/\.raw\.txt$/,'.manifest.json'),'utf8'));
      if(JSON.stringify(manifest)!==JSON.stringify(prepared.manifest)) fail('回放图片指纹不一致。');
      const previousAudit=JSON.parse(await fs.readFile(source.replace(/\.raw\.txt$/,'.audit.json'),'utf8'));
      if(previousAudit.task!==TASK||previousAudit.schemaSha256!==contract.hash||previousAudit.promptSha256!==sha(system)) fail('回放任务、Schema或Prompt不一致。');
      received={raw:await fs.readFile(source,'utf8'),returnedModel:config.model};audit.replaySource=path.basename(source);audit.originalDurationMs=previousAudit.durationMs;
      console.log('本地历史响应回放：没有再次调用模型，不计为新生成样本或推理耗时。');
    }else received=await callProvider(body, config, 90_000);
    await save('raw.txt', received.raw);
    console.log('模型原始输出（尚未清理或校验）：'); console.log(received.raw);
    const parsed = parseModelJson(received.raw); parsedValue = parsed.value;
    audit.firstParsePassed=parsed.firstParsePassed; audit.cleaning=parsed.cleaning; audit.repairApplied=!!parsed.repairedText;
    if (parsed.repairedText) await save('repaired.json',parsed.repairedText);
    const validate=contract.models[TASK]; audit.modelSchemaPassed=validate(parsed.value);
    if (!audit.modelSchemaPassed) fail(`模型字段校验失败：${JSON.stringify(validate.errors.map(e=>({path:e.instancePath,rule:e.keyword,message:e.message})))}`);
    const response={requestId,task:TASK,...structuredClone(parsed.value),meta:{schemaVersion:SCHEMA_VERSION,promptVersion:PROMPT_VERSION,modelId:received.returnedModel||config.model,runType:'offline_evaluation',durationMs:Math.round(performance.now()-started),retryCount:0}};
    contract.check('PostGenerateResponse',response); audit.responseSchemaPassed=true;
    checkPostBusiness(response,request); audit.businessChecksPassed=true;
    await save('response.json',JSON.stringify(response,null,2)); const md=renderPostMarkdown(response); await save('report.md',md);
    console.log(`原始JSON解析：${parsed.firstParsePassed?'通过':'失败；经限定清洗/修复后通过'}`);
    console.log('模型字段、完整Response、事实引用与差异化业务检查：全部通过');
    console.log(JSON.stringify(response,null,2)); console.log(md); console.log(`结果文件：${prefix}.response.json`);
  } catch (error) {
    const message=error instanceof TestError?error.message:'本地处理失败；未打印敏感堆栈。'; audit.failure={code:error.code||'LOCAL_PROCESSING_FAILED',message};
    console.error(`校验/调用失败：${message}`); if(parsedValue) console.log(JSON.stringify(parsedValue,null,2)); process.exitCode=1;
  } finally { audit.durationMs=Math.round(performance.now()-started); await save('audit.json',JSON.stringify(audit,null,2)); console.log(`走查记录：${prefix}.audit.json`); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e instanceof TestError?e.message:'启动失败，请检查输入与配置。');process.exitCode=1;});
