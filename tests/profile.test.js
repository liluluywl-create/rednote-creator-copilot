import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createContract, parseModelJson, checkBusiness, finalizeModel, prepareImages, makeProviderBody, callProvider, validateConfig, LIMITS, SCHEMA_VERSION, compatibleInspection, renderReportMarkdown } from '../test_profile_diagnosis.js';

const contract = await createContract();
test('prompt retains visitor-only audit and exploratory capability constraints', async () => {
  const prompt = await readFile(new URL('../prompts/profile_system_v1.0.md', import.meta.url), 'utf8');
  for (const required of ['V2.0.1', '忽略作者端私有功能控件', '普通访客视角', '实测能不能装下耳机？', '不预设未经核实的实物参数']) assert.ok(prompt.includes(required));
});
const evidence = { evidenceId: 'e1', sourceType: 'image', sourceId: 'image_1', description: '自建示例中的蓝色杯垫。', quote: null, confidence: 'high' };
const input = { schemaVersion: SCHEMA_VERSION, requestId: 'test_1', task: 'profile.inspect', payload: { images: [{ imageId: 'image_1', mimeType: 'image/png', base64: 'AAAA', width: 20, height: 20, byteLength: 3 }] } };
const meta = { schemaVersion: SCHEMA_VERSION, promptVersion: 'profile_inspect_v2.0.0', modelId: 'test_fixture', runType: 'demo_fixture', durationMs: 0, retryCount: 0 };
const model = () => ({ status: 'success', data: { candidates: [{ candidateId: 'c1', label: '蓝色杯垫', sourceImageIds: ['image_1'], feedbackSignal: 'unknown', evidenceIds: ['e1'] }], evidence: [structuredClone(evidence)] }, warnings: [], error: null });

test('accepts pure JSON without cleanup', () => assert.equal(parseModelJson(JSON.stringify(model())).firstParsePassed, true));
test('repairs only bounded surplus root braces and preserves string content', () => {
  const value = model(); value.data.candidates[0].label = '括号 } { 和引号 " 与反斜杠 \\';
  const valid = JSON.stringify(value);
  for (const raw of [valid + '}}\n', valid.replace(',"error":null}', '},"error":null}')]) {
    const result = parseModelJson(raw);
    assert.equal(result.firstParsePassed, false);
    assert.ok(result.repairedText);
    assert.deepEqual(result.value, value);
  }
});
test('repair refuses prose, multiple documents, missing braces, mismatches and duplicate error', () => {
  for (const raw of ['{} explanation', '{} {}', '{"x":[}', '{"x":1', '{"error":1},"error":null}', '{"x":1},"x":2}', '{} }}}}']) {
    assert.throws(() => parseModelJson(raw));
  }
});
test('syntactic repair never bypasses protocol validation', () => {
  const result = parseModelJson('{"overall_score":75}}');
  assert.throws(() => finalizeModel(result.value, input, meta, contract));
});
test('repairs only a complete envelope missing the data closure before root warnings', () => {
  const valid=JSON.stringify(model()); const broken=valid.replace('},"warnings":',' ,"warnings":');
  const r=parseModelJson(broken); assert.equal(r.cleaning,'close_data_before_root_warnings'); assert.deepEqual(r.value,model());
  assert.equal(finalizeModel(r.value,input,meta,contract).status,'success');
  for(const bad of [broken.slice(0,-1),'{"data":{"x":1,"warnings":[],"error":null}', '{"status":"success","data":{"warnings":[],"x":1,"warnings":[],"error":null}']) assert.throws(()=>parseModelJson(bad));
});
test('records a fenced response as first-parse failure, not pristine JSON', () => {
  const r = parseModelJson('```json\n' + JSON.stringify(model()) + '\n```'); assert.equal(r.firstParsePassed, false); assert.deepEqual(r.value, model());
});
test('refuses prose extraction, truncation and multiple JSON documents', () => {
  for (const raw of ['好的：{"data":1}', '{"data":', '{} {}']) assert.throws(() => parseModelJson(raw));
});
test('builds and validates the full inspect Response', () => assert.equal(finalizeModel(model(), input, meta, contract).status, 'success'));
test('rejects old fields, missing fields, wrong types, extra fields', () => {
  const cases = [model(), model(), model(), model()];
  cases[0].data = { overall_score: 75 }; delete cases[1].data.candidates[0].label;
  cases[2].data.candidates[0].feedbackSignal = 'high'; cases[3].data.extra = true;
  for (const v of cases) assert.throws(() => finalizeModel(v, input, meta, contract));
});
test('rejects four candidates even when each candidate is structurally correct', () => {
  const v = model(); v.data.candidates = Array.from({ length: 4 }, (_, i) => ({ ...v.data.candidates[0], candidateId: `c${i}` }));
  assert.throws(() => finalizeModel(v, input, meta, contract));
});
test('rejects missing image, duplicate evidence and dangling evidence', () => {
  const a = model(); a.data.evidence[0].sourceId = 'missing';
  const b = model(); b.data.evidence.push({ ...b.data.evidence[0] });
  const c = model(); c.data.candidates[0].evidenceIds = ['missing'];
  for (const v of [a, b, c]) assert.throws(() => finalizeModel(v, input, meta, contract));
});
test('audit distinguishes schema pass from reference failure', () => {
  const v = model(), audit = {}; v.data.candidates[0].evidenceIds = ['missing'];
  assert.throws(() => finalizeModel(v, input, meta, contract, audit));
  assert.equal(audit.modelSchemaPassed, true); assert.equal(audit.responseSchemaPassed, true); assert.equal(audit.businessChecksPassed, false);
});
test('partial must include a warning; errors cannot masquerade as success', () => {
  const v = model(); v.status = 'partial'; assert.throws(() => finalizeModel(v, input, meta, contract));
  v.warnings = [{ code: 'LOW_IMAGE_QUALITY', message: '局部模糊', fieldPath: null }]; assert.equal(finalizeModel(v, input, meta, contract).status, 'partial');
  const error = { status: 'error', data: null, warnings: [], error: { code: 'IMAGE_UNREADABLE', message: '无法辨认', retryable: false, fieldPath: '/payload/images' } };
  assert.equal(finalizeModel(error, input, meta, contract).status, 'error');
});
const reportRequest = { ...input, task: 'profile.report', payload: { ...input.payload, mode: 'visual_only', representatives: [], manualRepresentative: null } };
const reportModel = () => ({ status: 'success', data: {
  coverage: 'visual_only', visualGrade: '良好',
  dimensions: ['legibility', 'subject_clarity', 'layout_order', 'color_harmony'].map(key => ({key, status: '良好', explanation: '自建样例', evidenceIds: ['e1']})),
  headerAudit: { avatar: {status:'良好',feedback:'头像可辨',evidenceIds:['e1']}, banner:{status:'良好',feedback:'背景简洁',evidenceIds:['e1']},bioAndConversion:{status:'良好',clarityFeedback:'昵称清楚',conversionAdvice:'如想分享教程可补一句',evidenceIds:['e1']} },
  verticalityAudit:{status:'良好',summary:'手作主线与生活支线相连',evidenceIds:['e1']},
  summary:{text:'自建样例',evidenceIds:['e1']},styleObservation:null,viralPatterns:[],
  topicRecommendations:['稳健深耕款','场景破圈款','高搜痛点/情绪送礼款'].map(type=>({type,title:'自建选题',rationale:'观察基础',visualAdvice:'作品近景',basisEvidenceIds:['e1']})),
  priorityActions:[{text:'增加文字对比度',evidenceIds:['e1']}],evidence:[structuredClone(evidence)]
},warnings:[],error:null});
test('qualitative report retains grades without injecting numeric scores', () => {
  const v=reportModel(); const before=structuredClone(v);
  const r=finalizeModel(v,reportRequest,meta,contract);
  assert.equal(r.data.visualGrade,'良好'); assert.ok(!Object.hasOwn(r.data,'healthScore')); assert.deepEqual(v,before);
  v.data.dimensions[0].key='subject_clarity'; assert.throws(()=>finalizeModel(v,reportRequest,meta,contract));
});
test('new report rejects numeric fields, missing assets and invalid labels', () => {
  const cases=[reportModel(),reportModel(),reportModel(),reportModel()];
  cases[0].data.healthScore=80; cases[1].data.dimensions[0].score=80; delete cases[2].data.headerAudit.banner; cases[3].data.visualGrade='一般';
  for(const v of cases) assert.throws(()=>finalizeModel(v,reportRequest,meta,contract));
});
test('three topic layers are mandatory and unique in schema itself', () => {
  for(const change of [v=>v.data.topicRecommendations.pop(),v=>v.data.topicRecommendations[1].type='稳健深耕款']) {
    const v=reportModel(); change(v); assert.equal(contract.models['profile.report'](v),false);
  }
});
test('unreadable assets require explicit partial warning, not a negative grade', () => {
  const v=reportModel(); v.data.headerAudit.banner={status:'无法判断',feedback:'截图未覆盖背景',evidenceIds:[]};
  assert.throws(()=>finalizeModel(v,reportRequest,meta,contract));
  v.status='partial';v.warnings=[{code:'INSUFFICIENT_EVIDENCE',message:'截图未覆盖背景',fieldPath:'/data/headerAudit/banner'}];
  assert.equal(finalizeModel(v,reportRequest,meta,contract).status,'partial');
});
test('new assets and topics require valid evidence; user prose rejects codes and ratings', () => {
  for(const change of [v=>v.data.headerAudit.avatar.evidenceIds=['missing'],v=>v.data.verticalityAudit.evidenceIds=[],v=>v.data.topicRecommendations[0].basisEvidenceIds=['missing'],v=>v.data.summary.text='依据 e5',v=>v.data.headerAudit.avatar.feedback='扣20分']) {
    const v=reportModel(); change(v); assert.throws(()=>finalizeModel(v,reportRequest,meta,contract));
  }
});
test('Markdown includes all new sections and omits internal evidence', () => {
  const md=renderReportMarkdown(finalizeModel(reportModel(),reportRequest,meta,contract));
  for(const term of ['头像','背景图','昵称','内容垂直度','稳健深耕款','场景破圈款','高搜痛点/情绪送礼款']) assert.ok(md.includes(term));
  assert.doesNotMatch(md,/e1|evidenceIds|healthScore/);
});
test('legacy inspection compatibility is explicit, nonmutating and never migrates reports', () => {
  const old={...finalizeModel(model(),input,meta,contract),meta:{...meta,schemaVersion:'1.0.0'}};
  const copy=compatibleInspection(old); contract.check('ProfileInspectResponse',copy);
  assert.equal(old.meta.schemaVersion,'1.0.0');assert.equal(copy.meta.schemaVersion,SCHEMA_VERSION);
  assert.throws(()=>compatibleInspection({...old,task:'profile.report'}));
  assert.throws(()=>compatibleInspection({...old,meta:{...meta,schemaVersion:'3.0.0'}}));
});
test('visual-only report rejects unconfirmed viral patterns', () => {
  const r = { ...input, task: 'profile.report', payload: { ...input.payload, mode: 'visual_only', representatives: [], manualRepresentative: null } };
  const v = {requestId:r.requestId,task:r.task,...reportModel()}; v.data.viralPatterns=[{hypothesis:'不应出现',representativeLabels:['未确认'],evidenceIds:['e1']}];
  assert.throws(() => checkBusiness(v, r));
});
test('configuration restricts key destination and rejects placeholders', () => {
  const env = { VOLC_API_KEY: 'unit-test-only-not-a-real-key', VOLC_MODEL_ID: 'test-model', VOLC_BASE_URL: LIMITS.baseUrl };
  assert.equal(validateConfig(env).baseUrl, LIMITS.baseUrl);
  assert.throws(() => validateConfig({ ...env, VOLC_BASE_URL: 'https://example.com' }));
  assert.throws(() => validateConfig({ ...env, VOLC_API_KEY: '你的密钥' }));
});
test('actual synthetic image decoding, Base64 metadata and original preservation', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'profile-fixture-'));
  const bytes = await sharp({ create: { width: 32, height: 64, channels: 3, background: '#abcdef' } }).png().toBuffer();
  await writeFile(path.join(dir, 'synthetic.png'), bytes);
  const result = await prepareImages(['synthetic.png'], dir);
  assert.equal(result.images[0].width, 32); assert.equal(result.images[0].height, 64);
  assert.equal(Buffer.from(result.images[0].base64, 'base64').length, result.images[0].byteLength);
  assert.deepEqual(await readFile(path.join(dir, 'synthetic.png')), bytes);
  await assert.rejects(() => prepareImages(['synthetic.png', 'synthetic.png'], dir));
  await writeFile(path.join(dir, 'fake.png'), 'not an image'); await assert.rejects(() => prepareImages(['fake.png'], dir));
});
test('provider receives two image_url blocks in one user message, no key in body', () => {
  const request = structuredClone(input); request.payload.images.push({ ...request.payload.images[0], imageId: 'image_2' });
  const body = makeProviderBody(request, 'system rules', 'test-model');
  assert.equal(body.messages[0].role, 'system');
  assert.equal(body.messages[1].content.filter(v => v.type === 'image_url').length, 2);
  assert.equal(body.stream, false); assert.equal(body.max_tokens, 1500);
});
test('explicit image resize preserves originals, aspect ratio and JPEG metadata', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'profile-resize-'));
  const bytes = await sharp({ create: { width: 1206, height: 2622, channels: 3, background: '#abcdef' } }).png().toBuffer();
  await writeFile(path.join(dir, 'synthetic.png'), bytes);
  const { images } = await prepareImages(['synthetic.png'], dir, 1200);
  assert.equal(images[0].height, 1200); assert.equal(images[0].width, 552); assert.equal(images[0].mimeType, 'image/jpeg');
  assert.deepEqual(await readFile(path.join(dir, 'synthetic.png')), bytes);
  const decoded = await sharp(Buffer.from(images[0].base64, 'base64')).metadata();
  assert.equal(decoded.width, 552); assert.equal(decoded.height, 1200);
  await assert.rejects(() => prepareImages(['synthetic.png'], dir, Number.NaN));
});
test('mock HTTP integration succeeds without printing reasoning or provider envelope', async () => {
  let count = 0;
  const result = await callProvider({}, { key: 'test-secret', baseUrl: LIMITS.baseUrl }, 100, async (_url, options) => {
    count++; assert.equal(options.redirect, 'error'); assert.equal(options.headers.Authorization, 'Bearer test-secret');
    return new Response(JSON.stringify({ model: 'fixture', choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(model()), reasoning_content: 'do not expose' } }] }));
  });
  assert.equal(count, 1); assert.equal(result.raw.includes('do not expose'), false);
});
test('HTTP failures, credential echoes and token truncation fail closed without retry', async () => {
  const config = { key: 'test-secret', baseUrl: LIMITS.baseUrl }; let count = 0;
  await assert.rejects(() => callProvider({}, config, 100, async () => { count++; return new Response('test-secret', { status: 401 }); }), e => !e.message.includes(config.key) && e.message.includes('401'));
  assert.equal(count, 1);
  for (const [content, finish_reason] of [['test-secret', 'stop'], ['{}', 'length']]) {
    await assert.rejects(() => callProvider({}, config, 100, async () => new Response(JSON.stringify({ choices: [{ finish_reason, message: { content } }] }))));
  }
});
test('timeout does not trigger a second call', async () => {
  let count = 0;
  await assert.rejects(() => callProvider({}, { key: 'test-secret', baseUrl: LIMITS.baseUrl }, 10, async (_url, { signal }) => {
    count++; return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  }), e => e.code === 'TIMEOUT');
  assert.equal(count, 1);
});
