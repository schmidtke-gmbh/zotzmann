const assert = require('node:assert/strict');
const test = require('node:test');
const { buildLeadTablePayload, buildSubmissionHandler, parseSubmission } = require('../netlify/functions/submission-created.js');

const base={id:'0123456789abcdef01234567',form_name:'erstgespraech-daten',created_at:'2026-09-29T12:00:00.000Z',data:{vorname:'Max',nachname:'Mustermann',email:'max@example.com',telefon:'01701234567',interesse:'Keramikimplantate',erreichbarkeit:'Vormittags',quelle:'Landingpage'}};
const endpoints={keramik:'https://api-v2.lead-table.com/keramik',telefon:'https://api-v2.lead-table.com/telefon',website:'https://api-v2.lead-table.com/website'};

test('routes the three capture forms to separate campaigns',()=>{
 assert.equal(parseSubmission(JSON.stringify(base)).route,'keramik');
 assert.equal(parseSubmission(JSON.stringify({...base,form_name:'telefonische-anfrage'})).route,'telefon');
 assert.equal(parseSubmission(JSON.stringify({...base,form_name:'praxis-anfrage-daten'})).route,'website');
});

test('ignores final duplicate and unrelated forms',()=>{
 for(const form_name of ['erstgespraech','praxis-anfrage','newsletter']) assert.equal(parseSubmission(JSON.stringify({...base,form_name})),null);
});

test('rejects malformed approved submissions',()=>{
 assert.throws(()=>parseSubmission(JSON.stringify({...base,id:'bad'})),/Invalid/);
 assert.throws(()=>parseSubmission(JSON.stringify({...base,data:[]})),/Invalid/);
 assert.throws(()=>parseSubmission(JSON.stringify({payload:null,...base})),/Invalid/);
});

test('preserves phone as string and maps contact fields',()=>{
 const payload=buildLeadTablePayload(parseSubmission(JSON.stringify(base)));
 assert.equal(payload.fields.name,'Max Mustermann');
 assert.equal(payload.fields.phone,'01701234567');
 assert.equal(payload.fields.email,'max@example.com');
 assert.equal(payload.fields.formular,'erstgespraech-daten');
 assert.equal(payload.fields.netlify_submission_id,base.id);
});

test('uses the endpoint matching each form route',async()=>{
 const calls=[]; const timeouts=[]; const signal=new AbortController().signal;
 const handler=buildSubmissionHandler({endpoints,signalFactory:(ms)=>{timeouts.push(ms);return signal;},fetchImpl:async(url,options)=>{calls.push({url,options});return new Response('0123456789abcdef01234567',{status:200});}});
 for(const [form,expected] of [['erstgespraech-daten','keramik'],['telefonische-anfrage','telefon'],['praxis-anfrage-daten','website']]){
  const response=await handler({body:JSON.stringify({...base,form_name:form})});
  assert.equal(response.statusCode,200); assert.equal(JSON.parse(response.body).route,expected);
 }
 assert.deepEqual(calls.map(x=>x.url),[endpoints.keramik,endpoints.telefon,endpoints.website]);
 assert.deepEqual(timeouts,[10000,10000,10000]);
});

test('ignores unrelated forms before requiring configuration or fetching',async()=>{
 let fetched=false; const handler=buildSubmissionHandler({endpoints:{},fetchImpl:async()=>{fetched=true;}});
 const response=await handler({body:JSON.stringify({...base,form_name:'erstgespraech'})});
 assert.equal(response.statusCode,200); assert.equal(fetched,false);
});

test('rejects unsafe endpoints and plain-text errors',async()=>{
 for(const bad of ['bad','http://api-v2.lead-table.com/x','https://example.com/x','https://u:p@api-v2.lead-table.com/x','https://api-v2.lead-table.com:444/x']){
  const response=await buildSubmissionHandler({endpoints:{...endpoints,keramik:bad}})({body:JSON.stringify(base)}); assert.equal(response.statusCode,500);
 }
 for(const body of ['not-json','NotFound','Unauthorized','InternalServerError']){
  const handler=buildSubmissionHandler({endpoints,fetchImpl:async()=>new Response(body,{status:200})});
  const response=await handler({body:JSON.stringify(base)}); assert.equal(response.statusCode,502); assert.doesNotMatch(response.body,new RegExp(body));
 }
});
