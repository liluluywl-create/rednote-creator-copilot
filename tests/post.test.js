import test from 'node:test';
import assert from 'node:assert/strict';
import { createContract, SCHEMA_VERSION } from '../test_profile_diagnosis.js';
import { TEST_BRIEF, checkPostBusiness, renderPostMarkdown } from '../test_post_generation.js';

const contract=await createContract();
const images=[1,2,3].map(i=>({imageId:`image_${i}`,mimeType:'image/jpeg',base64:'AAAA',width:100,height:100,byteLength:3}));
const request={schemaVersion:SCHEMA_VERSION,requestId:'post_test',task:'post.generate',payload:{images,primaryImageId:'image_2',brief:{...TEST_BRIEF},publishing:{intendedDate:null,occasion:null}}};
const facts=['动森同款铃钱包','毛线钩织包','2小时','新手友好','5股牛奶棉'];
const evidence=[
  {evidenceId:'img',sourceType:'image',sourceId:'image_2',description:'黄色抽绳钩织零钱包',quote:null,confidence:'high'},
  ...facts.map((x,i)=>({evidenceId:`u${i}`,sourceType:'user_field',sourceId:['/payload/brief/workName','/payload/brief/confirmedTags/0','/payload/brief/durationMinutes','/payload/brief/difficulty','/payload/brief/material'][i],description:`用户提供${x}`,quote:x,confidence:'high'})),
  {evidenceId:'u5',sourceType:'user_field',sourceId:'/payload/brief/inspirationOrWishes',description:'用户提供的IP灵感与愿望',quote:TEST_BRIEF.inspirationOrWishes,confidence:'high'},
];
const variant=(angle,index)=>{
  const tone={pain_point:['指尖慢慢有了秩序🧶','从环形起针到圆弧成型，指尖如何慢慢进入心流？'],emotion:['把海岛愿望钩进钱袋🧡','把摇树掉金币、早日还清房贷的愿望钩进一只小钱袋。'],curiosity:['掌心小物的安静一角✨','掌心大小的小包，会落在日常空间的哪个角落？']}[angle];
  const paragraphs=[
    {blockId:`${angle}_h`,role:'hook',text:`${tone[1]}这是我最近钩完的一只掌心小包。`,evidenceIds:[]},
    {blockId:`${angle}_d`,role:'description',text:'我很喜欢黄色抽绳造型配棕色星形贴饰，拿在手里很醒目。',evidenceIds:['img']},
    {blockId:`${angle}_p`,role:'parameters',text:'我钩的是动森同款铃钱包，也是毛线钩织包；用的是5股牛奶棉，前后花了约2小时，新手友好。',evidenceIds:['u0','u1','u2','u3','u4']},
    {blockId:`${angle}_c`,role:'closing',text:angle==='emotion'?'把海岛慢生活和摇树掉金币的治愈祝愿，也一起放进这份时间礼物里。':angle==='curiosity'?'下一步准备用实拍展示耳机或小物能不能收进掌心空间。':'牛奶棉的微绒触感和重复针脚，让两小时制作过程有了安静秩序。',evidenceIds:angle==='emotion'?['u5']:angle==='pain_point'?['u2','u4']:[]},
  ];
  const parameterPath=`/data/variants/${index}/paragraphs/2/text`;
  return {variantId:`v_${angle}`,angle,cover:{imageId:'image_2',ratio:'3:4',layout:'top_caption',fit:'contain',headline:'铃钱包手作'},title:tone[0],paragraphs,
    interactionHook:angle==='emotion'?'你会把哪一个温柔愿望放进这只铃钱袋？':angle==='curiosity'?'你最想看它实测收纳哪件日常小物？':'你在重复针脚里也会慢慢安静下来吗？',
    hashtags:['钩针','钩针包包','手工编织','零钱包'],seasonalTags:[],
    claims:[...facts.map((x,i)=>({targetPath:parameterPath,text:x,evidenceIds:[`u${i}`]})),...(angle==='emotion'?[{targetPath:`/data/variants/${index}/paragraphs/3/text`,text:'海岛慢生活',evidenceIds:['u5']}]:[])],annotations:[]};
};
const response=()=>({requestId:'post_test',task:'post.generate',status:'success',data:{photoReview:[{text:'主体清楚',evidenceIds:['img']}],variants:['pain_point','emotion','curiosity'].map(variant),missingAngles:[],evidence:structuredClone(evidence)},warnings:[],error:null,meta:{schemaVersion:SCHEMA_VERSION,promptVersion:'test',modelId:'test',runType:'demo_fixture',durationMs:0,retryCount:0}});

test('fixture request and three differentiated variants pass full contract and business checks',()=>{
  contract.check('PostGenerateRequest',request); const r=response(); contract.check('PostGenerateResponse',r); assert.doesNotThrow(()=>checkPostBusiness(r,request));
});
test('inspirationOrWishes is optional, but validates as a non-empty bounded string when provided',()=>{
  const without=structuredClone(request); delete without.payload.brief.inspirationOrWishes;
  assert.doesNotThrow(()=>contract.check('PostGenerateRequest',without));
  for(const value of ['', '愿'.repeat(301)]) {
    const invalid=structuredClone(request); invalid.payload.brief.inspirationOrWishes=value;
    assert.throws(()=>contract.check('PostGenerateRequest',invalid));
  }
});
test('rejects unsupported fact pointers, missing facts, fake seasonal tags and repeated angle prose',()=>{
  const cases=[response(),response(),response(),response()];
  cases[0].data.evidence.find(e=>e.evidenceId==='u4').sourceId='/payload/brief/missing';
  cases[1].data.variants[0].paragraphs[2].text='参数缺失';
  cases[2].data.variants[0].seasonalTags=[{label:'秋日',basis:'user_date',sourceValue:'2026-09-17'}];
  cases[3].data.variants[1].title=cases[3].data.variants[0].title;cases[3].data.variants[1].paragraphs[0].text=cases[3].data.variants[0].paragraphs[0].text;
  for(const r of cases) assert.throws(()=>checkPostBusiness(r,request));
});
test('rejects bad claim paths, dangling evidence and annotation offsets',()=>{
  const cases=[response(),response(),response()];
  cases[0].data.variants[0].claims[0].targetPath='/data/missing';
  cases[1].data.variants[0].paragraphs[0].evidenceIds=['missing'];
  cases[2].data.variants[0].annotations=[{annotationId:'a',targetPath:'/data/variants/0/title',start:0,end:2,quote:'错字',category:'clarity',message:'测试',suggestion:null}];
  for(const r of cases) assert.throws(()=>checkPostBusiness(r,request));
});
test('Markdown shows all three user-facing directions without internal evidence IDs',()=>{
  const md=renderPostMarkdown(response());
  for(const term of ['指尖秩序与材质心流','微缩日常与空间切片','文化隐喻与心意寄托','#钩针']) assert.ok(md.includes(term));
  assert.doesNotMatch(md,/evidenceIds|u0|targetPath/);
});
test('all Unicode pictographic emoji satisfy title symbol rule, while plain title does not',()=>{
  const good=response();good.data.variants[2].title='把心意钩进小袋里🧡';assert.doesNotThrow(()=>checkPostBusiness(good,request));
  const bad=response();bad.data.variants[2].title='把心意钩进小袋里';assert.throws(()=>checkPostBusiness(bad,request));
});
test('both legalistic rights disclaimers and positive official claims are rejected from publishable copy',()=>{
  const disclaimer=response(); disclaimer.data.variants[1].paragraphs[2].text+=' 这不是官方授权或联名款。';
  assert.throws(()=>checkPostBusiness(disclaimer,request));
  const unsupported=response(); unsupported.data.variants[1].paragraphs[2].text+=' 这是官方联名款。';
  assert.throws(()=>checkPostBusiness(unsupported,request));
});
test('requires first-person copy and rejects reviewer voice or mechanical parameter reporting',()=>{
  const cases=[response(),response(),response()];
  for(const p of cases[0].data.variants[0].paragraphs) p.text=p.text.replaceAll('我','她');
  cases[1].data.variants[0].paragraphs[1].text+=' 照片里能看到主体。';
  cases[2].data.variants[0].paragraphs[2].text='我做的是动森同款铃钱包，品类是毛线钩织包；用5股牛奶棉，参考制作时间约2小时，新手友好。';
  for(const r of cases) assert.throws(()=>checkPostBusiness(r,request));
});
