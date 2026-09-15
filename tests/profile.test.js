import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createContract, parseModelJson, checkBusiness, finalizeModel, prepareImages, makeProviderBody, callProvider, validateConfig, LIMITS } from '../test_profile_diagnosis.js';

const contract = await createContract();
const evidence = { evidenceId: 'e1', sourceType: 'image', sourceId: 'image_1', description: '自建示例中的蓝色杯垫。', quote: null, confidence: 'high' };
const input = { schemaVersion: '1.0.0', requestId: 'test_1', task: 'profile.inspect', payload: { images: [{ imageId: 'image_1', mimeType: 'image/png', base64: 'AAAA', width: 20, height: 20, byteLength: 3 }] } };
const meta = { schemaVersion: '1.0.0', promptVersion: 'profile_inspect_v1.0.0', modelId: 'test_fixture', runType: 'demo_fixture', durationMs: 0, retryCount: 0 };
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
test('program computes healthScore without modifying raw model output', () => {
  const request = { ...input, task: 'profile.report', payload: { ...input.payload, mode: 'visual_only', representatives: [], manualRepresentative: null } };
  const v = { status: 'success', data: { coverage: 'visual_only', healthScore: null, dimensions: ['legibility', 'subject_clarity', 'layout_order', 'color_harmony'].map((key, i) => ({ key, score: [70, 80, 90, null][i], explanation: '自建样例', evidenceIds: ['e1'] })), summary: { text: '自建样例', evidenceIds: ['e1'] }, styleObservation: null, viralPatterns: [], nextWeekTopics: [], priorityActions: [{ text: '增加文字对比度', evidenceIds: ['e1'] }], evidence: [evidence] }, warnings: [], error: null };
  assert.equal(finalizeModel(v, request, { ...meta, promptVersion: 'profile_report_v1.0.0' }, contract).data.healthScore, 80);
  assert.equal(v.data.healthScore, null);
  v.data.dimensions[0].key = 'subject_clarity'; assert.throws(() => finalizeModel(v, request, meta, contract));
});
test('visual-only report rejects unconfirmed viral patterns', () => {
  const r = { ...input, task: 'profile.report', payload: { ...input.payload, mode: 'visual_only', representatives: [], manualRepresentative: null } };
  const v = { requestId: r.requestId, task: r.task, status: 'success', data: { evidence: [evidence], dimensions: ['legibility', 'subject_clarity', 'layout_order', 'color_harmony'].map(key => ({ key, score: null, evidenceIds: [] })), coverage: 'visual_only', viralPatterns: [{ hypothesis: '不应出现', representativeLabels: ['未确认'], evidenceIds: ['e1'] }], healthScore: null } };
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
