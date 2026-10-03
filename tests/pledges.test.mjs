import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../backend/worker.mjs';
function setup() {
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../backend/migrations/0001_pledges.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){const stmt=sqlite.prepare(sql);let args=[];return {bind(...values){args=values;return this},async run(){return stmt.run(...args)},async all(){return {results:stmt.all(...args)}}}},async batch(statements){return Promise.all(statements.map(s=>s.all()))}};
 return {DB,ALLOWED_ORIGINS:'https://bringbackthedab.com'};
}
const id='12345678-1234-4123-8123-123456789abc';
function request(method='GET',visitor=id,origin='https://bringbackthedab.com'){return new Request('https://api.example/api/pledge',{method,headers:{Origin:origin,'X-Dab-Visitor':visitor}})}
test('count starts at zero and duplicate pledges stay idempotent',async()=>{
 const env=setup();assert.deepEqual(await (await worker.fetch(request(),env)).json(),{count:0,pledged:false});
 for(let i=0;i<2;i++)assert.deepEqual(await (await worker.fetch(request('POST'),env)).json(),{count:1,pledged:true});
 assert.deepEqual(await (await worker.fetch(request('POST','12345678-1234-4123-8123-123456789abd'),env)).json(),{count:2,pledged:true});
});
test('reject invalid origin and visitor without writing',async()=>{
 const env=setup();assert.equal((await worker.fetch(request('POST',id,'https://untrusted.example'),env)).status,403);
 assert.equal((await worker.fetch(request('POST',"' OR 1=1"),env)).status,400);
 assert.deepEqual(await (await worker.fetch(request(),env)).json(),{count:0,pledged:false});
});
test('CORS preflight and storage failure are handled',async()=>{
 const response=await worker.fetch(request('OPTIONS'),setup());assert.equal(response.status,204);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://bringbackthedab.com');
 const broken={ALLOWED_ORIGINS:'https://bringbackthedab.com',DB:{batch(){throw Error('offline')}}};
 assert.equal((await worker.fetch(request(),broken)).status,503);
});
