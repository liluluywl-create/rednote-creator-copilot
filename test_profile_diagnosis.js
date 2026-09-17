import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, parseEnv } from 'node:util';
import { createHash, randomUUID } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import sharp from 'sharp';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const SCHEMA_VERSION = '2.0.0';
const PROMPT_VERSION = '2.0.1';
const TOPIC_TYPES = ['稳健深耕款', '场景破圈款', '高搜痛点/情绪送礼款'];
export const LIMITS = Object.freeze({
  originalBytes: 10 * 1024 ** 2, originalTotal: 30 * 1024 ** 2,
  imageBytes: 1024 ** 2, imageTotal: 2 * 1024 ** 2, requestBytes: 3 * 1024 ** 2,
  sourcePixels: 20_000_000, pixels: 12_000_000, totalPixels: 24_000_000, side: 10_000,
  inspectMs: 8_000, reportMs: 90_000, inspectTokens: 1500, reportTokens: 6000, postGenerateTokens: 10_000,
  responseBytes: 2 * 1024 ** 2, qualities: [85, 80, 75, 70],
  baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
});
const sha = value => createHash('sha256').update(value).digest('hex');
const byteSize = value => Buffer.byteLength(JSON.stringify(value));
const fail = (message, code = 'INVALID_INPUT') => { throw new TestError(message, code); };
export class TestError extends Error {
  constructor(message, code = 'OUTPUT_INVALID') { super(message); this.code = code; }
}

export function validateConfig(env) {
  if (!env.VOLC_API_KEY || /\s|替换|你的|YOUR_|[<>]/.test(env.VOLC_API_KEY)) fail('API Key 缺失或仍为占位值。');
  if (env.VOLC_BASE_URL !== LIMITS.baseUrl) fail('本测试只允许北京地域官方推理地址，拒绝向其他地址发送密钥。');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(env.VOLC_MODEL_ID ?? '')) fail('模型标识缺失或格式不合法。');
  if (env.VOLC_ENDPOINT_ID) fail('请仅使用 VOLC_MODEL_ID，避免模型配置冲突。');
  return { key: env.VOLC_API_KEY, baseUrl: env.VOLC_BASE_URL, model: env.VOLC_MODEL_ID };
}

// Model responsibility is a projection of the existing Response, not a new API.
export function modelSchema(protocol, task) {
  const response = protocol.$defs.Response;
  const dataNames = { 'profile.inspect': 'ProfileInspection', 'profile.report': 'ProfileReport', 'post.inspect': 'PostInspection', 'post.generate': 'PostResult' };
  const dataName = dataNames[task];
  if (!dataName) fail(`暂不支持模型协议任务：${task}`);
  const schema = {
    $schema: protocol.$schema, type: 'object', additionalProperties: false,
    required: ['status', 'data', 'warnings', 'error'],
    properties: {
      status: response.properties.status,
      data: { anyOf: [{ $ref: `#/$defs/${dataName}` }, { type: 'null' }] },
      warnings: response.properties.warnings, error: response.properties.error,
    },
    allOf: [response.allOf[0], response.allOf.at(-1)], $defs: {},
  };
  const visit = node => {
    if (!node || typeof node !== 'object') return;
    if (node.$ref) {
      const name = node.$ref.replace('#/$defs/', '');
      if (!Object.hasOwn(schema.$defs, name)) {
        if (!protocol.$defs[name]) fail('协议引用不存在。');
        schema.$defs[name] = protocol.$defs[name]; visit(protocol.$defs[name]);
      }
    }
    for (const [key, value] of Object.entries(node)) if (key !== '$defs') visit(value);
  };
  visit(schema);
  return schema;
}

export async function createContract(root = ROOT) {
  const source = await fs.readFile(path.join(root, 'protocol.schema.json'), 'utf8');
  const protocol = JSON.parse(source);
  // strictTypes=false permits valid cross-allOf property constraints in the baseline.
  // No coercion, default insertion, field removal or schema alteration is allowed.
  const ajv = new Ajv2020({ allErrors: true, strictTypes: false, strictRequired: false });
  addFormats(ajv); ajv.addSchema(protocol);
  const models = Object.fromEntries(['profile.inspect', 'profile.report', 'post.inspect', 'post.generate'].map(task => [task, ajv.compile(modelSchema(protocol, task))]));
  const check = (name, value) => {
    const validate = ajv.getSchema(`${protocol.$id}#/$defs/${name}`);
    if (!validate || !validate(value)) {
      const errors = (validate?.errors ?? []).map(e => ({ path: e.instancePath, rule: e.keyword, message: e.message }));
      throw new TestError(`${name} 校验失败：${JSON.stringify(errors)}`);
    }
  };
  return { protocol, hash: sha(source), check, models };
}

export function parseModelJson(raw) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw) > LIMITS.responseBytes) fail('模型文本缺失或过长。', 'OUTPUT_INVALID');
  try { return { value: JSON.parse(raw), firstParsePassed: true, cleaning: 'none' }; }
  catch { /* Only the explicitly allowed transport-format cleanup follows. */ }
  let cleaned = raw.replace(/^\uFEFF/, '').trim();
  const fence = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fence) cleaned = fence[1].trim();
  try { return { value: JSON.parse(cleaned), firstParsePassed: false, cleaning: 'bom_or_outer_fence' }; }
  catch { /* Scan delimiters outside strings; never extract arbitrary prose. */ }
  if (!cleaned.startsWith('{')) fail('无法安全修复 JSON。', 'OUTPUT_INVALID');
  const stack = [], warningBoundaries = []; let quoted = false, escaped = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') {
      if (stack.length === 2 && stack.every(c => c === '{') && /^"warnings"\s*:/.test(cleaned.slice(i))) warningBoundaries.push(i);
      quoted = true; continue;
    }
    if (char === '{' || char === '[') stack.push(char);
    else if (char === '}' || char === ']') {
      if (stack.pop() !== (char === '}' ? '{' : '[')) break;
      if (stack.length !== 0) continue;
      const suffix = cleaned.slice(i + 1);
      let repaired, cleaning;
      if (/^\s*(?:}\s*){1,3}$/.test(suffix)) {
        repaired = cleaned.slice(0, i + 1); cleaning = 'remove_trailing_extra_braces';
      } else if (/^\s*,\s*"error"\s*:/.test(suffix)) {
        // Known failure: root closed before its remaining fields, e.g. warnings},error.
        try { if (Object.hasOwn(JSON.parse(cleaned.slice(0, i + 1)), 'error')) break; }
        catch { break; }
        repaired = cleaned.slice(0, i) + suffix; cleaning = 'remove_premature_root_brace';
      } else break;
      try {
        return { value: JSON.parse(repaired), firstParsePassed: false, cleaning, repairedText: repaired, repairOffset: i };
      } catch { break; }
    }
  }
  // One known envelope defect only: data was not closed before root warnings.
  // Both halves must parse without inventing any field/value; incomplete responses still fail.
  if (!quoted && stack.length === 1 && stack[0] === '{' && warningBoundaries.length === 1) {
    const boundary = warningBoundaries[0], before = cleaned.slice(0, boundary).trimEnd();
    if (before.endsWith(',')) {
      const prefix = before.slice(0, -1);
      try {
        const head = JSON.parse(prefix + '}}');
        if (Object.keys(head).sort().join(',') === 'data,status' && head.data && !Array.isArray(head.data)) {
          const repaired = prefix + '},' + cleaned.slice(boundary);
          const value = JSON.parse(repaired);
          if (Object.keys(value).sort().join(',') === 'data,error,status,warnings' && Array.isArray(value.warnings)) {
            return {value, firstParsePassed:false, cleaning:'close_data_before_root_warnings', repairedText:repaired, repairOffset:prefix.length};
          }
        }
      } catch { /* Not the uniquely recognizable envelope defect. */ }
    }
  }
  fail('无法安全修复 JSON；未补字段、截断内容或修改语义。', 'OUTPUT_INVALID');
}

function pointerValue(value, pointer) {
  if (!pointer.startsWith('/')) return undefined;
  return pointer.slice(1).split('/').reduce((node, token) => {
    const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
    return node && typeof node === 'object' && Object.hasOwn(node, key) ? node[key] : undefined;
  }, value);
}

export function checkBusiness(response, request) {
  if (response.requestId !== request.requestId || response.task !== request.task) fail('请求与响应标识不一致。', 'OUTPUT_INVALID');
  if (response.status === 'error') return;
  const data = response.data, imageIds = new Set(request.payload.images.map(i => i.imageId));
  const evidence = new Map();
  for (const e of data.evidence) {
    if (evidence.has(e.evidenceId)) fail('evidenceId 重复。', 'OUTPUT_INVALID');
    evidence.set(e.evidenceId, e);
    if (e.sourceType === 'image') {
      if (!imageIds.has(e.sourceId)) fail('引用了不存在的图片。', 'OUTPUT_INVALID');
    } else if (e.sourceType === 'user_field' && request.task === 'profile.report') {
      if (!/^\/payload\/(representatives\/|manualRepresentative$)/.test(e.sourceId)) fail('用户证据指向非确认字段。', 'OUTPUT_INVALID');
      const v = pointerValue(request, e.sourceId);
      if (v === undefined || v === null || v === '' || typeof v === 'object') fail('用户证据字段为空或不可引用。', 'OUTPUT_INVALID');
    } else fail('当前任务不允许此证据来源。', 'OUTPUT_INVALID');
  }
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key === 'evidenceIds' || key === 'basisEvidenceIds') {
        if (value.some(id => !evidence.has(id))) fail('存在悬空的 evidenceId。', 'OUTPUT_INVALID');
      } else walk(value);
    }
  };
  walk(data);
  if (request.task === 'profile.inspect') {
    const ids = new Set();
    for (const c of data.candidates) {
      if (ids.has(c.candidateId)) fail('candidateId 重复。', 'OUTPUT_INVALID');
      ids.add(c.candidateId);
      if (c.sourceImageIds.some(id => !imageIds.has(id))) fail('候选引用不存在的截图。', 'OUTPUT_INVALID');
      if (!c.evidenceIds.some(id => c.sourceImageIds.includes(evidence.get(id)?.sourceId))) fail('候选与截图证据未对应。', 'OUTPUT_INVALID');
    }
  } else {
    if (new Set(data.dimensions.map(d => d.key)).size !== 4) fail('四个视觉维度必须各出现一次。', 'OUTPUT_INVALID');
    const observations = [...data.dimensions, ...Object.values(data.headerAudit), data.verticalityAudit];
    if (observations.some(d => d.status !== '无法判断' && d.evidenceIds.length === 0)) fail('有诊断标签但无引用依据。', 'OUTPUT_INVALID');
    if (observations.some(d => d.status === '无法判断') && (response.status !== 'partial' || !response.warnings.length)) fail('无法判断的项目必须标记 partial 并说明局限。', 'OUTPUT_INVALID');
    const visualOnly = request.payload.mode === 'visual_only';
    if (data.coverage !== (visualOnly ? 'visual_only' : 'representative_review')) fail('报告范围与确认方式不一致。', 'OUTPUT_INVALID');
    if (visualOnly && data.viralPatterns.length) fail('未确认代表作品，不能输出高反馈规律。', 'OUTPUT_INVALID');
    const labels = new Set(request.payload.representatives.map(r => r.label));
    if (request.payload.manualRepresentative) labels.add(request.payload.manualRepresentative);
    if (data.viralPatterns.some(p => p.representativeLabels.some(label => !labels.has(label)))) fail('规律引用了未确认作品。', 'OUTPUT_INVALID');
    if (new Set(data.topicRecommendations.map(t => t.type)).size !== 3) fail('三个选题层级必须各出现一次。', 'OUTPUT_INVALID');
    // User-facing prose cannot leak internal evidence identifiers or numerical ratings.
    const prose = [data.summary.text, data.styleObservation?.text, ...data.dimensions.map(d => d.explanation),
      data.headerAudit.avatar.feedback, data.headerAudit.banner.feedback, data.headerAudit.bioAndConversion.clarityFeedback,
      data.headerAudit.bioAndConversion.conversionAdvice, data.verticalityAudit.summary,
      ...data.viralPatterns.map(p => p.hypothesis), ...data.priorityActions.map(p => p.text),
      ...data.topicRecommendations.flatMap(t => [t.title, t.rationale, t.visualAdvice]), ...response.warnings.map(w => w.message)];
    if (prose.some(s => s && (/\be\d+\b/i.test(s) || /扣\s*\d+\s*分|\d+\s*\/\s*100/.test(s)))) fail('面向用户的正文包含证据代码或数值评分。', 'OUTPUT_INVALID');
  }
}

export async function prepareImages(names, root = ROOT, maxEdge = null) {
  if (maxEdge !== null && (!Number.isInteger(maxEdge) || maxEdge < 32 || maxEdge > LIMITS.side)) fail('max-edge 必须是32～10000的整数。');
  if (names.length < 1 || names.length > 6) fail('必须提供1～6张图片。');
  let originalTotal = 0, total = 0, pixels = 0;
  const hashes = new Set(), images = [], manifest = [];
  for (const [index, name] of names.entries()) {
    const file = path.resolve(root, name), stat = await fs.stat(file);
    originalTotal += stat.size;
    if (!stat.isFile() || stat.size > LIMITS.originalBytes || originalTotal > LIMITS.originalTotal) fail('原始图片超出大小限制。', 'PAYLOAD_TOO_LARGE');
    const original = await fs.readFile(file), fingerprint = sha(original);
    if (hashes.has(fingerprint)) fail('两张输入完全重复，请移除重复图。');
    hashes.add(fingerprint);
    // Source photos may exceed the transmission budget; decode within a separate
    // safety ceiling, then enforce the stricter output pixel budget below.
    const input = sharp(original, { limitInputPixels: LIMITS.sourcePixels, failOn: 'warning' });
    const meta = await input.metadata();
    if (!['png', 'jpeg', 'webp'].includes(meta.format) || (meta.pages ?? 1) > 1) fail('仅支持静态 PNG、JPEG、WebP。', 'UNSUPPORTED_IMAGE');
    if (!meta.width || !meta.height || Math.min(meta.width, meta.height) < 16 || Math.max(meta.width, meta.height) > LIMITS.side) fail('图片尺寸超限。', 'PAYLOAD_TOO_LARGE');
    let encoded;
    // Full decode verifies the actual payload; output strips metadata, not image content.
    if (original.length <= LIMITS.imageBytes && maxEdge === null) {
      await input.clone().raw().toBuffer(); encoded = { data: original, info: { width: meta.width, height: meta.height, format: meta.format } };
    } else {
      for (const quality of LIMITS.qualities) {
        let pipeline = input.clone().rotate();
        if (maxEdge !== null) pipeline = pipeline.resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
        encoded = await pipeline.jpeg({ quality, chromaSubsampling: '4:4:4' }).toBuffer({ resolveWithObject: true });
        if (encoded.data.length <= LIMITS.imageBytes) break;
      }
    }
    const { data, info } = encoded;
    total += data.length; pixels += info.width * info.height;
    if (data.length > LIMITS.imageBytes || info.width * info.height > LIMITS.pixels || total > LIMITS.imageTotal || pixels > LIMITS.totalPixels) fail('保留文字可读性的压缩副本仍超限，请减少图片。', 'PAYLOAD_TOO_LARGE');
    const image = { imageId: `image_${index + 1}`, mimeType: `image/${info.format}`, base64: data.toString('base64'), width: info.width, height: info.height, byteLength: data.length };
    images.push(image);
    manifest.push({ imageId: image.imageId, fileName: path.basename(file), originalSha256: fingerprint, transmittedSha256: sha(data), originalBytes: original.length, transmittedBytes: data.length, width: info.width, height: info.height });
  }
  return { images, manifest };
}

export function makeProviderBody(request, system, model) {
  const { images, ...fields } = request.payload;
  const content = [{ type: 'text', text: JSON.stringify({ task: request.task, payload: { ...fields, images: images.map(({ base64: _omitted, ...metadata }) => metadata) } }) }];
  for (const image of images) content.push({ type: 'text', text: `以下图片的 imageId=${image.imageId}` }, { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.base64}` } });
  const maxTokens = request.task === 'post.generate' ? LIMITS.postGenerateTokens : request.task.endsWith('.inspect') ? LIMITS.inspectTokens : LIMITS.reportTokens;
  return { model, stream: false, max_tokens: maxTokens,
    thinking: { type: 'disabled' }, messages: [{ role: 'system', content: system }, { role: 'user', content }] };
}

export async function callProvider(body, config, timeoutMs, fetcher = fetch) {
  const serialized = JSON.stringify(body);
  if (Buffer.byteLength(serialized) > LIMITS.requestBytes) fail('实际模型请求体超过3 MiB。', 'PAYLOAD_TOO_LARGE');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(`${config.baseUrl}/chat/completions`, {
      method: 'POST', redirect: 'error', signal: controller.signal,
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' }, body: serialized,
    });
    if (!response.ok) {
      // Never log provider bodies: they can echo request data or credentials.
      await response.body?.cancel();
      const code = response.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_UNAVAILABLE';
      fail(`火山方舟返回 HTTP ${response.status}；检查模型权限、API Key 类型及接口支持。响应正文未打印。`, code);
    }
    const reader = response.body.getReader(); let received = 0; const chunks = [];
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      received += value.byteLength;
      if (received > LIMITS.responseBytes) { await reader.cancel(); fail('供应商响应超过本地安全上限。', 'OUTPUT_INVALID'); }
      chunks.push(value);
    }
    let envelope;
    try { envelope = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { fail('供应商响应不是合法 JSON。', 'OUTPUT_INVALID'); }
    const choice = envelope.choices?.[0];
    if (choice?.finish_reason !== 'stop' || typeof choice?.message?.content !== 'string') fail('模型输出截断、拒答或响应结构不符合预期。', 'OUTPUT_INVALID');
    if (choice.message.content.includes(config.key)) fail('响应包含密钥，已阻止打印和保存。', 'OUTPUT_INVALID');
    if (typeof envelope.model === 'string' && envelope.model.includes(config.key)) fail('供应商元数据包含密钥，已阻止打印。', 'OUTPUT_INVALID');
    return { raw: choice.message.content, returnedModel: typeof envelope.model === 'string' ? envelope.model : null };
  } catch (error) {
    if (error instanceof TestError) throw error;
    if (controller.signal.aborted) fail(`超过 ${timeoutMs / 1000} 秒预算；未自动重试，上游是否完成未知。`, 'TIMEOUT');
    fail('网络请求未完成；未自动重试，也未输出底层堆栈或请求头。', 'NETWORK_INTERRUPTED');
  } finally { clearTimeout(timer); }
}

export function finalizeModel(value, request, meta, contract, audit = {}) {
  const validate = contract.models[request.task];
  audit.modelSchemaPassed = validate(value);
  if (!audit.modelSchemaPassed) throw new TestError(`模型字段校验失败：${JSON.stringify(validate.errors.map(e => ({ path: e.instancePath, rule: e.keyword, message: e.message })))}`);
  const response = { requestId: request.requestId, task: request.task, ...structuredClone(value), meta };
  try {
    contract.check(request.task === 'profile.inspect' ? 'ProfileInspectResponse' : 'ProfileReportResponse', response);
    audit.responseSchemaPassed = true;
  } catch (error) { audit.responseSchemaPassed = false; throw error; }
  try { checkBusiness(response, request); audit.businessChecksPassed = true; }
  catch (error) { audit.businessChecksPassed = false; throw error; }
  return response;
}

export function compatibleInspection(saved) {
  if (saved.task !== 'profile.inspect' || !['1.0.0', SCHEMA_VERSION].includes(saved.meta?.schemaVersion)) fail('只允许复用结构未变的已知版本识别结果。');
  const copy = structuredClone(saved);
  // Only inspection is structurally unchanged; never migrate or overwrite old reports.
  copy.meta.schemaVersion = SCHEMA_VERSION;
  return copy;
}

export function renderReportMarkdown(response) {
  const d = response.data;
  const names = { legibility: '文字可读性', subject_clarity: '主体清晰度', layout_order: '排版秩序', color_harmony: '色彩协调' };
  // Render prose only; internal evidence objects and ID lists are never displayed.
  const lines = ['# 主页诊断报告｜方案 B', '', `整体视觉：${d.visualGrade}`, '', d.summary.text,
    '', '## 门面资产', '', `### 头像｜${d.headerAudit.avatar.status}`, '', d.headerAudit.avatar.feedback,
    '', `### 背景图｜${d.headerAudit.banner.status}`, '', d.headerAudit.banner.feedback,
    '', `### 昵称、简介与转化｜${d.headerAudit.bioAndConversion.status}`, '', d.headerAudit.bioAndConversion.clarityFeedback,
    '', d.headerAudit.bioAndConversion.conversionAdvice, '', '## 封面视觉'];
  for (const x of d.dimensions) lines.push('', `### ${names[x.key]}｜${x.status}`, '', x.explanation);
  lines.push('', `## 内容垂直度｜${d.verticalityAudit.status}`, '', d.verticalityAudit.summary);
  if (d.styleObservation) lines.push('', '## 风格观察', '', d.styleObservation.text);
  if (d.viralPatterns.length) lines.push('', '## 值得验证的高反馈方向', ...d.viralPatterns.flatMap(x => ['', '- ' + x.hypothesis]));
  lines.push('', '## 三层选题建议');
  for (const type of TOPIC_TYPES) {
    const x = d.topicRecommendations.find(t => t.type === type);
    lines.push('', `### ${type}：${x.title}`, '', `推荐理由：${x.rationale}`, '', `封面建议：${x.visualAdvice}`);
  }
  lines.push('', '## 优先行动', ...d.priorityActions.flatMap(x => ['', '- ' + x.text]));
  if (response.warnings.length) lines.push('', '## 本次观察的局限', ...response.warnings.flatMap(w => ['', '- ' + w.message]));
  return lines.join('\n') + '\n';
}

async function confirmationPayload(options, prepared, contract) {
  if (options['visual-only']) {
    if (options.confirm || options.manual) fail('仅视觉模式不能同时确认代表作品。');
    return { images: prepared.images, mode: 'visual_only', representatives: [], manualRepresentative: null };
  }
  if (options.manual) {
    if (options.confirm) fail('本地走查请只用标签确认或手填的一种。');
    return { images: prepared.images, mode: 'representatives', representatives: [], manualRepresentative: options.manual.trim() };
  }
  if (!options.confirm || !options.inspection) fail('报告阶段必须指定 --inspection 和 --confirm，或主动选择 --visual-only / --manual。');
  const file = path.resolve(ROOT, options.inspection);
  if (!file.startsWith(path.join(ROOT, 'test-results') + path.sep) || !file.endsWith('.response.json')) fail('请使用 test-results 中的识别结果文件。');
  const previous = compatibleInspection(JSON.parse(await fs.readFile(file, 'utf8')));
  console.log('复用既有人工确认：识别字段结构未变，仅在内存适配协议版本；历史文件不改写。');
  const saved = JSON.parse(await fs.readFile(file.replace(/\.response\.json$/, '.manifest.json'), 'utf8'));
  contract.check('ProfileInspectResponse', previous);
  if (previous.status === 'error') fail('失败的识别结果不能作为确认依据。');
  if (JSON.stringify(saved) !== JSON.stringify(prepared.manifest)) fail('图片与识别时不一致，请重新识别。');
  checkBusiness(previous, { requestId: previous.requestId, task: 'profile.inspect', payload: { images: prepared.images } });
  const ids = options.confirm.split(',').map(s => s.trim());
  if (ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length) fail('请确认1～3个不重复的候选ID。');
  const representatives = ids.map(id => {
    const candidate = previous.data.candidates.find(c => c.candidateId === id);
    if (!candidate) fail('确认ID不在已校验的候选中。');
    return { label: candidate.label, sourceImageIds: candidate.sourceImageIds, confirmedHighFeedback: true };
  });
  return { images: prepared.images, mode: 'representatives', representatives, manualRepresentative: null };
}

export async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    phase: { type: 'string', default: 'inspect' }, inspection: { type: 'string' }, confirm: { type: 'string' },
    manual: { type: 'string' }, 'visual-only': { type: 'boolean' }, 'dry-run': { type: 'boolean' },
    'local-eval-90s': { type: 'boolean' }, 'max-edge': { type: 'string' },
    replay: { type: 'string' },
  } });
  if (!['inspect', 'report'].includes(values.phase)) fail('phase 只能为 inspect 或 report。');
  if (values.phase === 'inspect' && (values.confirm || values.inspection || values.manual || values['visual-only'])) fail('识别阶段不能携带确认参数。');
  const contract = await createContract();
  const config = validateConfig(parseEnv(await fs.readFile(path.join(ROOT, '.env.local'), 'utf8')));
  const maxEdge = values['max-edge'] === undefined ? null : Number(values['max-edge']);
  const prepared = await prepareImages(positionals.length ? positionals : ['test_profile_1.png', 'test_profile_2.png'], ROOT, maxEdge);
  const task = `profile.${values.phase}`, requestId = `profile_${randomUUID()}`;
  const request = { schemaVersion: SCHEMA_VERSION, requestId, task, payload: values.phase === 'inspect' ? { images: prepared.images } : await confirmationPayload(values, prepared, contract) };
  contract.check(values.phase === 'inspect' ? 'ProfileInspectRequest' : 'ProfileReportRequest', request);
  if (byteSize(request) > LIMITS.requestBytes) fail('协议请求超过3 MiB。', 'PAYLOAD_TOO_LARGE');
  const prompt = await fs.readFile(path.join(ROOT, 'prompts/profile_system_v1.0.md'), 'utf8');
  const system = `${prompt}\n\n当前任务：${task}\n完整模型输出 JSON Schema（从项目协议提取）：\n${JSON.stringify(modelSchema(contract.protocol, task))}`;
  const body = makeProviderBody(request, system, config.model);
  if (byteSize(body) > LIMITS.requestBytes) fail('模型请求超过3 MiB。', 'PAYLOAD_TOO_LARGE');
  console.log('输入协议及图片校验：通过');
  console.log(JSON.stringify({ task, model: config.model, images: prepared.manifest.map(({ originalSha256: _a, transmittedSha256: _b, ...m }) => m), requestBytes: byteSize(body) }, null, 2));
  if (values['dry-run']) { console.log('预检结束：未发送网络请求。'); return; }
  const directory = path.join(ROOT, 'test-results');
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const prefix = path.join(directory, requestId);
  const save = (suffix, text) => fs.writeFile(`${prefix}.${suffix}`, text, { mode: 0o600, flag: 'wx' });
  await save('manifest.json', JSON.stringify(prepared.manifest, null, 2));
  const started = performance.now(), productBudget = values.phase === 'inspect' ? LIMITS.inspectMs : LIMITS.reportMs;
  const timeout = values['local-eval-90s'] ? LIMITS.reportMs : productBudget;
  const audit = { task, runType: 'offline_evaluation', requestedModel: config.model, schemaSha256: contract.hash, promptSha256: sha(system), timeoutMs: timeout, productBudgetMs: productBudget, localTimeoutOverride: !!values['local-eval-90s'], maxImageEdge: maxEdge, retryCount: 0, firstParsePassed: null, modelSchemaPassed: null, responseSchemaPassed: null, businessChecksPassed: null, factualReview: 'pending_human_review' };
  audit.executionMode = values.replay ? 'saved_response_replay' : 'live_call';
  audit.networkCallMade = !values.replay;
  let parsedValue;
  try {
    let received;
    if (values.replay) {
      const source = path.resolve(ROOT, values.replay);
      if (!source.startsWith(directory + path.sep) || !source.endsWith('.raw.txt')) fail('回放仅允许 test-results 内的原始回复。');
      const originalManifest = JSON.parse(await fs.readFile(source.replace(/\.raw\.txt$/, '.manifest.json'), 'utf8'));
      if (JSON.stringify(originalManifest) !== JSON.stringify(prepared.manifest)) fail('回放截图指纹与原请求不一致。');
      const originalAudit = JSON.parse(await fs.readFile(source.replace(/\.raw\.txt$/, '.audit.json'), 'utf8'));
      if (originalAudit.task !== task || originalAudit.schemaSha256 !== contract.hash || originalAudit.promptSha256 !== sha(system)) fail('回放任务、协议或 Prompt 不一致；不能把历史回复标记成新版本输出。');
      const raw = await fs.readFile(source, 'utf8');
      if (raw.includes(config.key) || Buffer.byteLength(raw) > LIMITS.responseBytes) fail('回放文本未通过安全检查。');
      received = {raw,returnedModel:null}; audit.replaySource = path.basename(source); audit.originalDurationMs = originalAudit.durationMs;
      console.log('本地历史响应回放：没有再次请求模型；不计为新模型成功样本或推理耗时。');
    } else received = await callProvider(body, config, timeout);
    await save('raw.txt', received.raw);
    console.log('模型原始输出（尚未清理或校验）：');
    console.log(received.raw);
    audit.firstParsePassed = false;
    const parsed = parseModelJson(received.raw);
    parsedValue = parsed.value;
    audit.firstParsePassed = parsed.firstParsePassed; audit.cleaning = parsed.cleaning;
    audit.repairApplied = parsed.repairedText !== undefined;
    if (audit.repairApplied) {
      audit.repairOffset = parsed.repairOffset;
      await save('repaired.json', parsed.repairedText);
    }
    console.log(`原始 JSON 解析：${parsed.firstParsePassed ? '通过' : '失败'}；清洗/修复：${parsed.cleaning}`);
    audit.modelSchemaPassed = contract.models[task](parsed.value);
    const meta = { schemaVersion: SCHEMA_VERSION, promptVersion: `profile_${values.phase}_v${PROMPT_VERSION}`, modelId: received.returnedModel || config.model, runType: 'offline_evaluation', durationMs: Math.round(performance.now() - started), retryCount: 0 };
    const response = finalizeModel(parsed.value, request, meta, contract, audit);
    audit.returnedModel = received.returnedModel;
    await save('response.json', JSON.stringify(response, null, 2));
    console.log(`最终 JSON 解析：通过；使用修复：${audit.repairApplied ? '是（已保留原文与修复副本）' : '否'}`);
    console.log('模型字段校验：通过；完整 Response 协议校验：通过；引用/业务规则校验：通过');
    console.log('注意：字段通过不等于识图事实正确，请人工核查。');
    console.log(JSON.stringify(response, null, 2));
    if (task === 'profile.report' && response.data) {
      const markdown = renderReportMarkdown(response);
      await save('report.md', markdown);
      console.log(markdown);
    }
    console.log(`结果文件：${prefix}.response.json`);
    if (response.status === 'error') process.exitCode = 1;
    else if (task === 'profile.inspect') console.log('已停在轻量确认阶段。请确认1～3个 candidateId，或选择仅视觉诊断；没有自动生成报告。');
  } catch (error) {
    const safe = error instanceof TestError ? error.message : '本地处理失败；未打印底层错误或敏感内容。';
    audit.failure = { code: error instanceof TestError ? error.code : 'LOCAL_PROCESSING_FAILED', message: safe };
    console.error(`校验/调用失败：${safe}`);
    if (parsedValue !== undefined) {
      console.log('以下为未通过检查的模型 JSON，不得作为有效结果使用：');
      console.log(JSON.stringify(parsedValue, null, 2));
    }
    const failure = { requestId, task, status: 'error', data: null, warnings: [],
      error: { code: error instanceof TestError ? error.code : 'OUTPUT_INVALID', message: safe.slice(0, 200), retryable: ['TIMEOUT', 'NETWORK_INTERRUPTED', 'RATE_LIMITED', 'UPSTREAM_UNAVAILABLE'].includes(error.code), fieldPath: null },
      meta: { schemaVersion: SCHEMA_VERSION, promptVersion: `profile_${values.phase}_v${PROMPT_VERSION}`, modelId: config.model, runType: 'offline_evaluation', durationMs: Math.round(performance.now() - started), retryCount: 0 } };
    contract.check(values.phase === 'inspect' ? 'ProfileInspectResponse' : 'ProfileReportResponse', failure);
    audit.localErrorEnvelopeSchemaPassed = true;
    await save('response.json', JSON.stringify(failure, null, 2));
    console.log('本地运行器错误结果（不是模型回复；模型未返回时相关校验未执行）：');
    console.log(JSON.stringify(failure, null, 2));
    process.exitCode = 1;
  } finally {
    audit.durationMs = Math.round(performance.now() - started);
    audit.withinProductWaitBudget = audit.durationMs <= productBudget;
    await save('audit.json', JSON.stringify(audit, null, 2));
    console.log(`走查记录：${prefix}.audit.json`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error instanceof TestError ? error.message : '启动失败，请检查输入文件、依赖和配置；未输出敏感信息。'); process.exitCode = 1; });
}
